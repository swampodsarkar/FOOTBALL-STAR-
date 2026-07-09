import type { MatchState, QEEvent, QTEType, QTEResult, Player, AIPlayer, Club } from '../types';

interface MatchEngineConfig {
  player: Player;
  opponent: Club;
  competition: string;
  isHome: boolean;
  aiSquad?: AIPlayer[];
}

const QTE_TYPES_BY_POSITION: Record<string, QTEType[]> = {
  GK: ['GoalkeeperSave'],
  CB: ['Tackle', 'Interception', 'SlidingBlock'],
  LB: ['Tackle', 'Interception', 'Cross'],
  RB: ['Tackle', 'Interception', 'Cross'],
  CDM: ['Tackle', 'Interception', 'LongShot'],
  CM: ['ThroughPass', 'LongShot', 'Tackle'],
  CAM: ['ThroughPass', 'LongShot', 'Finish'],
  LM: ['Cross', 'ThroughPass', 'LongShot'],
  RM: ['Cross', 'ThroughPass', 'LongShot'],
  LW: ['Finish', 'ThroughPass', 'Cross'],
  RW: ['Finish', 'ThroughPass', 'Cross'],
  ST: ['Finish', 'Header', 'Penalty', 'Volley'],
  CF: ['Finish', 'Header', 'Volley', 'ThroughPass'],
};

const COMMENTARY_LINES = {
  attack: [
    '{player} drives forward with purpose...',
    '{player} picks up the ball in midfield...',
    'A surging run from {player}!',
    '{player} looks up and spots a run...',
    'The ball comes to {player} on the edge of the box...',
    '{player} cuts inside onto their stronger foot...',
    'A clever touch from {player} to create space...',
  ],
  chance: [
    'What a chance! Saved brilliantly!',
    'Just wide from {player}! So close!',
    'Off the bar! Unlucky!',
    'Great save! The keeper tips it around the post!',
    '{player} should have scored there!',
    'A wonderful diving save!',
    'Cleared off the line! Incredible defending!',
  ],
  goal: [
    'GOAL! What a strike from {player}!',
    'GOAL! {player} finds the back of the net!',
    'GOAL! Incredible finish from {player}!',
    'GOAL! {player} slots it home calmly!',
    'GOAL! A header from {player}! Unstoppable!',
    'GOAL! {player} with a clinical finish!',
    'GOAL! {player} smashes it into the roof of the net!',
  ],
  defense: [
    '{player} makes a crucial tackle!',
    '{player} reads the play perfectly and intercepts!',
    'A well-timed challenge from {player}!',
    '{player} clears the danger!',
    'Last-ditch tackle from {player}! Brilliant defending!',
  ],
  foul: [
    'Foul! {player} caught the man late.',
    'Free kick to the attacking side after a foul by {player}.',
    '{player} bundles over their opponent. Free kick given.',
  ],
  card: [
    'Yellow card! {player} goes into the book.',
    'That is a yellow card for {player}.',
    'Red card! {player} is sent off!',
    'Straight red for {player}! Their team is down to 10 men!',
  ],
  neutral: [
    'The crowd urges their team forward...',
    'Possession football from both sides at the moment.',
    'The tempo has dropped slightly here.',
    'Both teams are well organized defensively.',
    'A period of sustained pressure from the home side.',
    'The away side looking dangerous on the break.',
    'A tactical battle unfolding in midfield.',
  ],
  halftime: [
    'The referee blows the whistle for half time!',
    'Half time! The teams head to the tunnel.',
    'An eventful first half comes to an end.',
  ],
  fulltime: [
    'The final whistle goes! Full time!',
    'Full time! The result stands!',
    'That is it! The match is over!',
  ],
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function generateCommentary(playerName: string, category: keyof typeof COMMENTARY_LINES, fallback?: string): string {
  const lines = COMMENTARY_LINES[category];
  if (!lines || lines.length === 0) return fallback || 'The match continues...';
  const line = pick(lines);
  return line.replace(/{player}/g, playerName);
}

export class MatchEngine {
  private config: MatchEngineConfig;
  private state: MatchState;
  private homePlayers: string[];
  private awayPlayers: string[];
  constructor(config: MatchEngineConfig) {
    this.config = config;
    const homeName = config.isHome ? config.player.name : config.opponent.name;
    const awayName = config.isHome ? config.opponent.name : config.player.name;
    this.homePlayers = config.isHome
      ? [config.player.name, ...config.opponent.aiSquad?.slice(0, 10).map(p => p.name) || []]
      : config.opponent.aiSquad?.slice(0, 11).map(p => p.name) || [];
    this.awayPlayers = config.isHome
      ? config.opponent.aiSquad?.slice(0, 11).map(p => p.name) || []
      : [config.player.name, ...config.opponent.aiSquad?.slice(0, 10).map(p => p.name) || []];

    this.state = {
      minute: 0,
      score: { home: 0, away: 0 },
      homeTeam: homeName,
      awayTeam: awayName,
      competition: config.competition,
      momentum: 50,
      possession: { home: 50, away: 50 },
      xG: { home: 0, away: 0 },
      shots: { home: 0, away: 0 },
      passAccuracy: { home: 0, away: 0 },
      playerEnergy: 100,
      playerRating: 6.0,
      commentary: 'The match is about to begin!',
      isPlayerTeam: config.isHome ? 'home' : 'away',
      qteEvents: [],
      currentQTE: null,
      isLive: true,
      isHalfTime: false,
      isFullTime: false,
      matchEvents: [],
    };
  }

  generateQTEEvents(): QEEvent[] {
    const count = randInt(3, 5);
    const events: QEEvent[] = [];
    const usedMinutes = new Set<number>();
    const posTypes = QTE_TYPES_BY_POSITION[this.config.player.position] || ['Finish'];
    const oppAvgOvr = this.config.opponent.aiSquad
      ? Math.round(this.config.opponent.aiSquad.reduce((s, p) => s + p.ovr, 0) / this.config.opponent.aiSquad.length)
      : 75;

    for (let i = 0; i < count; i++) {
      let minute: number;
      do {
        minute = randInt(5, 90);
      } while (usedMinutes.has(minute));
      usedMinutes.add(minute);

      const type = pick(posTypes);
      const diffMod = Math.max(1, Math.round((oppAvgOvr - 50) / 8));
      const difficulty = clamp(randInt(diffMod - 2, diffMod + 3), 1, 10);

      events.push({
        id: `qte-${minute}-${Date.now()}`,
        type,
        minute,
        difficulty,
        result: null,
      });
    }

    events.sort((a, b) => a.minute - b.minute);
    this.state.qteEvents = events;
    return events;
  }

  tick(): MatchState {
    if (this.state.isFullTime) return this.state;

    const minuteAdvance = randInt(1, 3);
    let newMinute = this.state.minute + minuteAdvance;

    if (newMinute > 45 && this.state.minute <= 45 && !this.state.isHalfTime) {
      newMinute = 45;
      this.state.isHalfTime = true;
      this.state.commentary = generateCommentary(this.config.player.name, 'halftime');
      return this.state;
    }

    if (newMinute >= 90) {
      newMinute = 90 + randInt(0, 4);
      this.state.isFullTime = true;
      this.state.isLive = false;
      this.state.commentary = generateCommentary(this.config.player.name, 'fulltime');
      this.state.minute = newMinute;
      return this.state;
    }

    if (this.state.isHalfTime && newMinute > 45) {
      this.state.isHalfTime = false;
    }

    this.state.minute = newMinute;

    if (newMinute > 45 && !this.state.qteEvents.some(e => e.minute === newMinute)) {
      this.state.currentQTE = null;
    }

    const qteNow = this.state.qteEvents.find(e => e.minute === newMinute && e.result === null);
    if (qteNow) {
      this.state.currentQTE = qteNow;
      this.state.commentary = `QTE: ${qteNow.type} chance for ${this.config.player.name}! (Difficulty: ${qteNow.difficulty}/10)`;
      return this.state;
    }

    this.simulateMinuteEvents(newMinute);

    return this.state;
  }

  private simulateMinuteEvents(minute: number): void {
    const homeStrength = this.config.isHome ? this.calcTeamStrength() + 3 : this.calcTeamStrength();
    const awayStrength = this.config.isHome ? this.calcTeamStrength() : this.calcTeamStrength() + 3;
    const totalStrength = homeStrength + awayStrength;
    const homeProb = totalStrength > 0 ? homeStrength / totalStrength : 0.5;

    this.state.possession.home = clamp(Math.round(homeProb * 50 + (Math.random() - 0.5) * 15), 35, 65);
    this.state.possession.away = 100 - this.state.possession.home;

    const goalChance = 0.04 + (Math.random() * 0.03);
    const goalRand = Math.random();

    if (goalRand < goalChance) {
      const scoringHome = Math.random() < homeProb;
      if (scoringHome) {
        this.state.score.home++;
        this.state.xG.home = Math.round((this.state.xG.home + randFloat(0.3, 1.5)) * 10) / 10;
        const scorer = pick(this.homePlayers);
        this.state.matchEvents.push({
          minute, type: 'Goal', playerName: scorer,
          description: `${scorer} scores for ${this.state.homeTeam}!`,
          team: 'home',
        });
        this.state.commentary = generateCommentary(scorer, 'goal');
        this.state.momentum = clamp(this.state.momentum + randInt(5, 12), 0, 100);
        if (scorer === this.config.player.name) {
          this.state.playerRating = clamp(this.state.playerRating + 0.3, 6.0, 10.0);
        }
      } else {
        this.state.score.away++;
        this.state.xG.away = Math.round((this.state.xG.away + randFloat(0.3, 1.5)) * 10) / 10;
        const scorer = pick(this.awayPlayers);
        this.state.matchEvents.push({
          minute, type: 'Goal', playerName: scorer,
          description: `${scorer} scores for ${this.state.awayTeam}!`,
          team: 'away',
        });
        this.state.commentary = generateCommentary(scorer, 'goal');
        this.state.momentum = clamp(this.state.momentum - randInt(5, 12), 0, 100);
      }

      this.state.shots.home += scoringHome ? 1 : 0;
      this.state.shots.away += scoringHome ? 0 : 1;

      if (!scoringHome && this.state.isPlayerTeam === 'home') {
        this.state.playerRating = clamp(this.state.playerRating - 0.1, 6.0, 10.0);
      } else if (scoringHome && this.state.isPlayerTeam === 'away') {
        this.state.playerRating = clamp(this.state.playerRating - 0.1, 6.0, 10.0);
      }

      return;
    }

    const shotChance = 0.12 + (Math.random() * 0.08);
    if (Math.random() < shotChance) {
      const shootingHome = Math.random() < homeProb;
      if (shootingHome) {
        this.state.shots.home++;
        const onTarget = Math.random() < 0.45;
        this.state.xG.home = Math.round((this.state.xG.home + randFloat(0.02, 0.25)) * 10) / 10;
        const shooter = pick(this.homePlayers);
        const category = onTarget ? 'chance' : 'chance';
        this.state.commentary = generateCommentary(shooter, category);
        if (shooter === this.config.player.name && onTarget) {
          this.state.playerRating = clamp(this.state.playerRating + 0.1, 6.0, 10.0);
        }
      } else {
        this.state.shots.away++;
        this.state.xG.away = Math.round((this.state.xG.away + randFloat(0.02, 0.25)) * 10) / 10;
        const shooter = pick(this.awayPlayers);
        this.state.commentary = generateCommentary(shooter, 'chance');
      }
      return;
    }

    if (Math.random() < 0.05) {
      const cardOnHome = Math.random() < 0.5;
      const isRed = Math.random() < 0.1;
      const playerName = cardOnHome ? pick(this.homePlayers) : pick(this.awayPlayers);
      const type = isRed ? 'Red' as const : 'Yellow' as const;
      const team = cardOnHome ? 'home' as const : 'away' as const;
      this.state.matchEvents.push({
        minute, type, playerName,
        description: isRed ? `${playerName} is shown a red card!` : `${playerName} receives a yellow card.`,
        team,
      });
      this.state.commentary = generateCommentary(playerName, 'card');
      return;
    }

    const commentaryRoll = Math.random();
    if (commentaryRoll < 0.2) {
      this.state.commentary = generateCommentary(this.config.player.name, 'attack');
    } else if (commentaryRoll < 0.35) {
      this.state.commentary = generateCommentary(this.config.player.name, 'defense');
    } else if (commentaryRoll < 0.5) {
      this.state.commentary = pick(COMMENTARY_LINES.neutral);
    } else if (commentaryRoll < 0.6) {
      this.state.commentary = generateCommentary(pick([...this.homePlayers, ...this.awayPlayers]), 'foul');
    } else {
      this.state.commentary = pick(COMMENTARY_LINES.neutral);
    }

    this.state.momentum = clamp(this.state.momentum + (Math.random() - 0.5) * 6, 0, 100);

    const basePassAcc = 70 + Math.floor(Math.random() * 15);
    this.state.passAccuracy.home = clamp(basePassAcc + randInt(-3, 3), 60, 95);
    this.state.passAccuracy.away = clamp(basePassAcc + randInt(-3, 3), 60, 95);

    this.state.playerRating = clamp(
      this.state.playerRating + (Math.random() - 0.5) * 0.06,
      6.0, 10.0
    );

    this.state.playerEnergy = clamp(this.state.playerEnergy - randFloat(0.5, 2.0), 0, 100);
  }

  processQTEResult(result: QTEResult): MatchState {
    if (!this.state.currentQTE) return this.state;

    const qte = this.state.currentQTE;
    qte.result = result;

    const resultMap: Record<QTEResult, { success: boolean; ratingBoost: number; momentumBoost: number; xgBoost: number }> = {
      Perfect: { success: true, ratingBoost: 0.5, momentumBoost: 10, xgBoost: 0.8 },
      Great: { success: true, ratingBoost: 0.3, momentumBoost: 7, xgBoost: 0.5 },
      Good: { success: Math.random() < 0.4, ratingBoost: 0.1, momentumBoost: 3, xgBoost: 0.2 },
      Late: { success: false, ratingBoost: 0, momentumBoost: -3, xgBoost: 0.05 },
      Miss: { success: false, ratingBoost: -0.2, momentumBoost: -5, xgBoost: 0 },
    };

    const outcome = resultMap[result];

    this.state.playerRating = clamp(this.state.playerRating + outcome.ratingBoost, 6.0, 10.0);
    this.state.momentum = clamp(this.state.momentum + outcome.momentumBoost, 0, 100);

    this.state.xG[this.state.isPlayerTeam] = Math.round(
      (this.state.xG[this.state.isPlayerTeam] + outcome.xgBoost) * 10
    ) / 10;

    if (outcome.success) {
      const scoringTeam = this.state.isPlayerTeam;
      this.state.score[scoringTeam]++;
      this.state.shots[scoringTeam]++;

      this.state.matchEvents.push({
        minute: qte.minute,
        type: 'Goal',
        playerName: this.config.player.name,
        description: `GOAL! ${this.config.player.name} ${qte.type === 'Header' ? 'heads' : qte.type === 'Penalty' ? 'converts the penalty' : qte.type === 'Volley' ? 'volleys' : 'finishes'} brilliantly!`,
        team: scoringTeam,
      });
      this.state.commentary = generateCommentary(this.config.player.name, 'goal');
    } else {
      this.state.shots[this.state.isPlayerTeam]++;
      if (result === 'Late' || result === 'Miss') {
        this.state.commentary = `${this.config.player.name} ${result === 'Miss' ? 'misses the target completely!' : 'gets the shot off but it is blocked!'}`;
      } else {
        this.state.commentary = generateCommentary(this.config.player.name, 'chance');
      }
    }

    this.state.currentQTE = null;
    return this.state;
  }

  getState(): MatchState {
    return this.state;
  }

  private calcTeamStrength(): number {
    const squad = this.config.opponent.aiSquad || [];
    if (squad.length === 0) return 75;
    return squad.reduce((s, p) => s + p.ovr, 0) / squad.length;
  }
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
