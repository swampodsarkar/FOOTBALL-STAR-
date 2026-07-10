import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiTrophy,
  HiStar,
  HiArrowTrendingUp,
  HiCalendar,
  HiAcademicCap,
  HiBolt,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiPause,
  HiPlay,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import { useMatchStore } from '../../stores/matchStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import PageTransition from '../../components/layout/PageTransition';
import ClubCrest from '../../components/ui/ClubCrest';
import PitchCanvas, { type PitchHandle } from '../../components/match/PitchCanvas';
import QTEOverlay from '../../components/match/QTEOverlay';
import {
  playerRelevantAttribute,
  playerTeamStrength,
  opponentStrengthFromClub,
  playerTeamWinProbability,
  resolveQTESkill,
} from '../../simulation/matchSimulation';
import {
  applyRatingEvents,
  getRatingLabel,
  getRatingColor,
  BASE_RATING,
  type RatingEvent,
} from '../../simulation/ratingSystem';
import { calculateMarketValue } from '../../services/marketValue';
import { processMatchBonus } from '../../simulation/economySystem';
import {
  speak,
  playWhistle,
  playGoalCheer,
  playKick,
  playCard,
  setMatchAudioMuted,
} from '../../utils/matchAudio';
import type { MatchState, QTEResult, QTEType, MatchPerformance, MatchResult, Player } from '../../types';
import { useSimulationStore } from '../../stores/simulationStore';

const SPEED_MS: Record<number, number> = { 1: 700, 2: 350, 4: 175 };

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

const PLAYER_GOAL_SHARE: Record<string, number> = {
  ST: 0.7, CF: 0.65, LW: 0.55, RW: 0.55, CAM: 0.5, CM: 0.28,
  LM: 0.42, RM: 0.42, CDM: 0.12, CB: 0.06, LB: 0.08, RB: 0.08, GK: 0,
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

const COMMENTARY_POOL = {
  attack: [
    '{p} drives forward with purpose...',
    '{p} picks up the ball in midfield...',
    'A surging run from {p}!',
    '{p} looks up and spots a run...',
    'The ball comes to {p} on the edge of the box...',
    '{p} cuts inside onto their stronger foot...',
    '{p} shows great footwork to beat the defender!',
    '{p} charges into the final third...',
  ],
  chance: [
    'What a chance! Saved brilliantly!',
    'Just wide from {p}! So close!',
    'Off the bar! Unlucky!',
    'Great save! The keeper tips it around the post!',
    '{p} should have scored there!',
    'A wonderful diving save!',
    'The keeper denies {p} with a strong hand!',
    'A goal-line clearance! Incredible!',
  ],
  goal: [
    'GOAL! What a strike from {p}!',
    'GOAL! {p} finds the back of the net!',
    'GOAL! Incredible finish from {p}!',
    'GOAL! {p} slots it home calmly!',
    'GOAL! A header from {p}! Unstoppable!',
    'GOAL! {p} curls it into the top corner!',
    'GOAL! A deflected shot falls kindly for {p}!',
  ],
  defense: [
    '{p} makes a crucial tackle!',
    '{p} reads the play perfectly and intercepts!',
    'A well-timed challenge from {p}!',
    '{p} clears the danger!',
    '{p} puts the ball out for a throw under pressure.',
    '{p} tracks back brilliantly!',
  ],
  card: [
    'Yellow card! {p} goes into the book.',
    'Red card! {p} is sent off!',
  ],
  foul: [
    'Foul! {p} penalized for a late challenge.',
    'Free kick awarded after {p} is brought down.',
    'A tactical foul by {p} stops the attack.',
  ],
  corner: [
    'Corner kick for the attacking side...',
    'The corner is swung in... cleared!',
    'Short corner played to {p}...',
  ],
  neutral: [
    'The crowd urges their team forward...',
    'Possession football from both sides at the moment.',
    'The tempo has dropped slightly here.',
    'Both teams are well organized defensively.',
    'A tactical battle unfolding in midfield.',
    'The rain is pouring down, making conditions tricky.',
    'A lull in play as both sides regroup.',
    'The keeper takes his time with the goal kick.',
    'The physio is on the pitch tending to a player.',
  ],
  offside: [
    'The flag goes up! Offside against {p}.',
    'Tight call — {p} judged offside by a fraction.',
  ],
  stat: [
    '{p} has covered {dist}km so far this half.',
    'Pass completion for {p}: {acc}% so far.',
  ],
};

function generateCommentary(playerName: string, category: keyof typeof COMMENTARY_POOL): string {
  const lines = COMMENTARY_POOL[category];
  const line = pick(lines);
  let result = line.replace(/{p}/g, playerName);
  result = result.replace(/{dist}/g, String((9 + Math.random() * 3).toFixed(1)));
  result = result.replace(/{acc}/g, String(randInt(75, 95)));
  return result;
}

function formatMinute(m: number): string {
  return `${Math.floor(m)}:${String(Math.round((m % 1) * 60)).padStart(2, '0')}`;
}

export default function MatchPage() {
  const player = useGameStore((s) => s.player);
  const currentClub = useGameStore((s) => s.currentClub);
  const currentLeague = useGameStore((s) => s.currentLeague);
  const nextMatch = useGameStore((s) => s.nextMatch);
  const { goTo } = usePhaseNavigation();

  const opponentClub = currentLeague?.clubs.find((c) => c.name === nextMatch?.opponent);
  const playerStrength = player && currentClub ? playerTeamStrength(player, currentClub) : 75;
  const opponentStrength = opponentStrengthFromClub(opponentClub, nextMatch?.opponent ?? '');
  const playerTeamScoreProb = playerTeamWinProbability(playerStrength, opponentStrength);
  const playerGoalShare = PLAYER_GOAL_SHARE[player?.position ?? 'ST'] ?? 0.4;

  const randomTeammate = (): string => {
    const mates = currentClub?.aiSquad?.filter((m) => m.position !== player?.position) ?? [];
    if (mates.length === 0) return 'a teammate';
    return mates[Math.floor(Math.random() * mates.length)].name;
  };

  const matchState = useMatchStore((s) => s.matchState);
  const commentary = useMatchStore((s) => s.commentary);
  const matchEvents = useMatchStore((s) => s.matchEvents);
  const startMatch = useMatchStore((s) => s.startMatch);
  const updateMatchState = useMatchStore((s) => s.updateMatchState);
  const addCommentary = useMatchStore((s) => s.addCommentary);
  const addMatchEvent = useMatchStore((s) => s.addMatchEvent);
  const endMatch = useMatchStore((s) => s.endMatch);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  const [showQTE, setShowQTE] = useState(false);
  const [qteType, setQteType] = useState<QTEType>('Finish');
  const [showResult, setShowResult] = useState(false);
  const [matchTime, setMatchTime] = useState(0);
  const [playerGoals, setPlayerGoals] = useState(0);
  const [playerAssists, setPlayerAssists] = useState(0);
  const [isHalfTime, setIsHalfTime] = useState(false);
  const [isFullTime, setIsFullTime] = useState(false);
  const [computedFinalRating, setComputedFinalRating] = useState(0);
  const [computedFinalLabel, setComputedFinalLabel] = useState('');
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [stats, setStats] = useState({
    possession: { home: 50, away: 50 },
    xG: { home: 0, away: 0 },
    shots: { home: 0, away: 0 },
    passAccuracy: { home: 85, away: 85 },
    momentum: 50,
    playerRating: BASE_RATING,
  });
  const [motmAwarded, setMotmAwarded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [muted, setMuted] = useState(false);
  const [shake, setShake] = useState(false);

  const pitchRef = useRef<PitchHandle | null>(null);
  const matchIntervalRef = useRef<number | null>(null);
  const advanceRef = useRef<number | null>(null);

  const isLiveRef = useRef(false);
  const halfTimeRef = useRef(false);
  const fullTimeRef = useRef(false);
  const showQTERef = useRef(false);
  const qteResolvedRef = useRef(false);
  const energyUsedRef = useRef(0);
  const scoreRef = useRef(score);
  const playerGoalsRef = useRef(playerGoals);
  const playerAssistsRef = useRef(playerAssists);

  useEffect(() => {
    scoreRef.current = score;
    playerGoalsRef.current = playerGoals;
    playerAssistsRef.current = playerAssists;
  }, [score, playerGoals, playerAssists]);

  const isHome = nextMatch?.isHome ?? true;
  const playerTeamColor = currentClub?.colors?.primary ?? '#6366f1';
  const oppColor = opponentClub?.colors?.primary ?? '#9ca3af';
  const homeColor = isHome ? playerTeamColor : oppColor;
  const awayColor = isHome ? oppColor : playerTeamColor;
  const playerTeam: 'home' | 'away' = isHome ? 'home' : 'away';

  useEffect(() => { setMatchAudioMuted(muted); }, [muted]);

  const triggerShake = useCallback(() => {
    setShake(true);
    window.setTimeout(() => setShake(false), 550);
  }, []);

  const beginMatch = useCallback(() => {
    if (!player || !currentClub || !nextMatch) return;
    setPlayerGoals(0);
    setPlayerAssists(0);
    energyUsedRef.current = 0;

    const initState: MatchState = {
      minute: 0,
      score: { home: 0, away: 0 },
      homeTeam: currentClub.name,
      awayTeam: nextMatch.opponent,
      competition: nextMatch.competition,
      momentum: 50,
      possession: { home: 55, away: 45 },
      xG: { home: 0, away: 0 },
      shots: { home: 0, away: 0 },
      passAccuracy: { home: 85, away: 83 },
      playerEnergy: player.physical.energy,
      playerRating: BASE_RATING,
      commentary: 'The match is about to begin!',
      isPlayerTeam: playerTeam,
      qteEvents: [],
      currentQTE: null,
      isLive: true,
      isHalfTime: false,
      isFullTime: false,
      matchEvents: [],
    };

    startMatch(initState);
    addCommentary(`Kick off at ${initState.competition}! ${initState.homeTeam} vs ${initState.awayTeam}`);
    addCommentary(`The referee blows the whistle! We are underway!`);
    pitchRef.current?.kickoff();
    playWhistle();
    speak(`Kick off. ${currentClub.name} versus ${nextMatch.opponent}.`, true);
  }, [player, currentClub, nextMatch, playerTeam, startMatch, addCommentary]);

  useEffect(() => {
    beginMatch();
    return () => { resetMatch(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveQTE = useCallback((result: QTEResult) => {
    if (qteResolvedRef.current) return;
    qteResolvedRef.current = true;

    const skill = player ? playerRelevantAttribute(player, qteType) : 70;
    const difficulty = matchState?.currentQTE?.difficulty ?? 5;
    const outcome = resolveQTESkill(result, skill, difficulty);

    addCommentary(`${player?.name ?? 'Player'} ${result === 'Perfect' ? 'with a perfect' : result === 'Great' ? 'with a great' : result === 'Good' ? 'manages a' : result === 'Late' ? 'late' : 'misses the'} ${qteType} effort!`);

    if (outcome.didScore) {
      setPlayerGoals((g) => g + 1);
      setScore((s) => playerTeam === 'home' ? { ...s, home: s.home + 1 } : { ...s, away: s.away + 1 });
      addMatchEvent({
        minute: Math.floor(matchTime),
        type: 'Goal',
        playerName: player?.name ?? '',
        description: `GOAL! ${player?.name} ${qteType === 'Header' ? 'heads' : qteType === 'Penalty' ? 'converts the penalty' : qteType === 'Volley' ? 'volleys' : qteType === 'Cross' ? 'crosses for a finish' : 'finishes'} brilliantly!`,
        team: playerTeam,
      });
      pitchRef.current?.goal(playerTeam);
      playGoalCheer();
      triggerShake();
      addCommentary(`GOAL! ${player?.name} ${qteType === 'Header' ? 'powers a header' : qteType === 'Penalty' ? 'slots the penalty away' : qteType === 'Cross' ? 'whips in a cross that is tapped in' : qteType === 'Volley' ? 'volleys home' : 'finishes with class'} — GOAL for ${playerTeam === 'home' ? currentClub?.name ?? 'your team' : nextMatch?.opponent ?? 'Opponent'}!`);
      speak(`Goal! ${player?.name}.`);
    } else {
      playKick();
    }

    setStats((s) => ({
      ...s,
      playerRating: clamp(s.playerRating + outcome.ratingBoost, 6.0, 10.0),
      momentum: clamp(s.momentum + outcome.momentumBoost, 0, 100),
    }));

    window.setTimeout(() => {
      setShowQTE(false);
      showQTERef.current = false;
      qteResolvedRef.current = false;
    }, 1200);
  }, [player, qteType, matchState, matchTime, playerTeam, currentClub, nextMatch, addCommentary, addMatchEvent, triggerShake]);

  const triggerQTE = useCallback(() => {
    if (qteResolvedRef.current) return;
    const posTypes = QTE_TYPES_BY_POSITION[player?.position ?? 'ST'] || ['Finish'];
    const type = posTypes[Math.floor(Math.random() * posTypes.length)];
    setQteType(type);
    setShowQTE(true);
    showQTERef.current = true;
    pitchRef.current?.attack(playerTeam);
    playKick();
  }, [player, playerTeam]);

  useEffect(() => { isLiveRef.current = matchState?.isLive ?? false; }, [matchState?.isLive]);
  useEffect(() => { halfTimeRef.current = isHalfTime; }, [isHalfTime]);
  useEffect(() => { fullTimeRef.current = isFullTime; }, [isFullTime]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showQTERef.current) return;
      if (!matchState?.isLive) return;
      if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p); }
      else if (e.key === '1') setSpeed(1);
      else if (e.key === '2') setSpeed(2);
      else if (e.key === '4') setSpeed(4);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [matchState?.isLive]);

  useEffect(() => {
    if (paused) {
      if (matchIntervalRef.current) { clearInterval(matchIntervalRef.current); matchIntervalRef.current = null; }
      return;
    }
    if (!matchState?.isLive) return;

    const speedMs = SPEED_MS[speed] ?? 700;

    matchIntervalRef.current = window.setInterval(() => {
      if (showQTERef.current) return;

      setMatchTime((prev) => {
        if (fullTimeRef.current) return prev;
        const adv = randInt(1, 2);
        let newMinute = prev + adv;

        if (newMinute >= 45 && prev < 45) {
          setIsHalfTime(true);
          halfTimeRef.current = true;
          addCommentary('Half time! The teams head to the tunnel.');
          playWhistle(true);
          speak('Half time.');
          return 45;
        }

        if (newMinute >= 90) {
          const stoppage = randInt(1, 5);
          newMinute = 90 + stoppage;
          setIsFullTime(true);
          fullTimeRef.current = true;
          setIsHalfTime(false);
          addCommentary('The final whistle goes! Full time!');
          playWhistle(true);
          updateMatchState({ isLive: false, isFullTime: true, minute: newMinute });
          const isGK = player?.position === 'GK';
          const result: MatchResult =
            scoreRef.current.home > scoreRef.current.away ? 'Win' : scoreRef.current.home < scoreRef.current.away ? 'Loss' : 'Draw';
          const rawEvents = generateMatchEvents(playerGoalsRef.current, playerAssistsRef.current, player?.position ?? 'ST', isGK, result);
          let rating = applyRatingEvents(rawEvents);
          const motm = determineMOTM(rating, playerGoalsRef.current, result, player?.name ?? '');
          if (motm) {
            rawEvents.push({ type: 'playerOfMatch', count: 1 });
            rating = applyRatingEvents(rawEvents);
          }
          setMotmAwarded(motm);
          setComputedFinalRating(Math.round(rating * 10) / 10);
          setComputedFinalLabel(getRatingLabel(Math.round(rating * 10) / 10));
          setShowResult(true);
          return newMinute;
        }

        if (halfTimeRef.current && newMinute > 45) {
          setIsHalfTime(false);
          halfTimeRef.current = false;
          setMatchTime(45);
          addCommentary('The second half is underway!');
          playWhistle();
          return 45;
        }

        const tacticProb = clamp(playerTeamScoreProb, 0.05, 0.95);
        const eventRoll = Math.random();

        if (eventRoll < 0.035) {
          const scored = Math.random() < tacticProb;
          if (scored) {
            const playerScores = Math.random() < playerGoalShare;
            if (playerScores) {
              setPlayerGoals((g) => g + 1);
              const scorer = player?.name ?? 'Player';
              setScore((s) => ({ ...s, home: s.home + 1 }));
              setStats((s) => ({
                ...s,
                xG: { ...s.xG, home: Math.round((s.xG.home + Math.random() * 0.8) * 10) / 10 },
                shots: { ...s.shots, home: s.shots.home + 1 },
                momentum: clamp(s.momentum + 8, 0, 100),
                playerRating: clamp(s.playerRating + 0.25, 6.0, 10.0),
              }));
              pitchRef.current?.goal('home');
              playGoalCheer();
              triggerShake();
              addMatchEvent({
                minute: newMinute,
                type: 'Goal',
                playerName: scorer,
                description: `GOAL! ${scorer} scores for ${currentClub?.name ?? 'your team'}!`,
                team: 'home',
              });
              addCommentary(`GOAL! ${scorer} finds the net for ${currentClub?.name ?? 'your team'}! A fine finish!`);
              speak(`Goal! ${scorer}.`);
            } else {
              setPlayerAssists((a) => a + 1);
              const scorer = randomTeammate();
              setScore((s) => ({ ...s, home: s.home + 1 }));
              setStats((s) => ({
                ...s,
                xG: { ...s.xG, home: Math.round((s.xG.home + Math.random() * 0.8) * 10) / 10 },
                shots: { ...s.shots, home: s.shots.home + 1 },
                momentum: clamp(s.momentum + 6, 0, 100),
                playerRating: clamp(s.playerRating + 0.12, 6.0, 10.0),
              }));
              pitchRef.current?.goal('home');
              playGoalCheer();
              triggerShake();
              addMatchEvent({
                minute: newMinute,
                type: 'Goal',
                playerName: scorer,
                description: `GOAL! ${scorer} scores, assisted by ${player?.name} for ${currentClub?.name ?? 'your team'}!`,
                team: 'home',
              });
              addCommentary(`${player?.name} picks out ${scorer} with a brilliant ball — GOAL for ${currentClub?.name ?? 'your team'}, assisted by ${player?.name}!`);
            }
          } else {
            const scorer = nextMatch?.opponent ?? 'Opponent';
            setScore((s) => ({ ...s, away: s.away + 1 }));
            setStats((s) => ({
              ...s,
              xG: { ...s.xG, away: Math.round((s.xG.away + Math.random() * 0.8) * 10) / 10 },
              shots: { ...s.shots, away: s.shots.away + 1 },
              momentum: clamp(s.momentum - 8, 0, 100),
              playerRating: clamp(s.playerRating - 0.05, 6.0, 10.0),
            }));
            pitchRef.current?.goal('away');
            playGoalCheer();
            triggerShake();
            addMatchEvent({
              minute: newMinute,
              type: 'Goal',
              playerName: scorer,
              description: `Goal for ${scorer} (${nextMatch?.opponent ?? 'Opponent'})`,
              team: 'away',
            });
            addCommentary(`Goal for ${nextMatch?.opponent ?? 'Opponent'}... ${player?.name} will be disappointed at the other end.`);
          }
        } else if (eventRoll < 0.1) {
          addCommentary(generateCommentary(player?.name ?? 'Player', 'chance'));
          pitchRef.current?.attack('home');
          playKick();
          setStats((s) => ({
            ...s,
            shots: { ...s.shots, home: s.shots.home + 1 },
            xG: { ...s.xG, home: Math.round((s.xG.home + Math.random() * 0.2) * 10) / 10 },
          }));
        } else if (eventRoll < 0.13 && !showQTERef.current) {
          triggerQTE();
          return prev;
        } else if (eventRoll < 0.16) {
          const isRed = Math.random() < 0.1;
          const who = Math.random() < 0.5 ? (player?.name ?? 'Player') : (nextMatch?.opponent ?? 'Opponent');
          addCommentary(generateCommentary(who, 'card'));
          playCard();
          addMatchEvent({
            minute: newMinute,
            type: isRed ? 'Red' : 'Yellow',
            playerName: who,
            description: isRed ? `${who} is shown a red card!` : `${who} receives a yellow card.`,
            team: 'home',
          });
        } else if (eventRoll < 0.23) {
          const cat = pick(['foul', 'corner', 'offside'] as const);
          const who = Math.random() < 0.5 ? (player?.name ?? 'Player') : (nextMatch?.opponent ?? 'Opponent');
          addCommentary(generateCommentary(who, cat));
          pitchRef.current?.attack(Math.random() < 0.5 ? 'home' : 'away');
        } else if (eventRoll < 0.38) {
          addCommentary(generateCommentary(player?.name ?? 'Player', 'attack'));
          pitchRef.current?.attack('home');
        } else if (eventRoll < 0.48) {
          addCommentary(generateCommentary(player?.name ?? 'Player', 'defense'));
          pitchRef.current?.attack('away');
        } else if (eventRoll < 0.63) {
          addCommentary(pick(COMMENTARY_POOL.neutral));
        } else if (eventRoll < 0.68) {
          addCommentary(generateCommentary(player?.name ?? 'Player', 'stat'));
        }

        energyUsedRef.current = Math.min(
          player?.physical.energy ?? 100,
          energyUsedRef.current + randInt(0, 2) + 1,
        );
        const momentumShift = (Math.random() - 0.5) * 6;
        setStats((s) => ({
          ...s,
          momentum: clamp(s.momentum + momentumShift, 0, 100),
            possession: {
              home: clamp(50 + (Math.random() - 0.5) * 10, 35, 65),
              away: 100 - clamp(50 + (Math.random() - 0.5) * 10, 35, 65),
            },
          passAccuracy: {
            home: clamp(85 + randInt(-3, 3), 70, 95),
            away: clamp(83 + randInt(-3, 3), 70, 95),
          },
          playerRating: clamp(s.playerRating + (Math.random() - 0.5) * 0.06, 6.0, 10.0),
        }));
        pitchRef.current?.setPossession(
          clamp(50 + (Math.random() - 0.5) * 10, 35, 65),
        );
        pitchRef.current?.setMomentum(stats.momentum);

        updateMatchState({ minute: newMinute });

        return newMinute;
      });
    }, speedMs);

    return () => {
      if (matchIntervalRef.current) { clearInterval(matchIntervalRef.current); matchIntervalRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, speed, matchState?.isLive, triggerQTE, playerTeamScoreProb, player, currentClub, nextMatch, playerGoalShare, randomTeammate, addCommentary, addMatchEvent, updateMatchState, triggerShake]);
  useEffect(() => {
    if (commentary.length > 0 && commentaryRef.current) {
      commentaryRef.current.scrollTop = commentaryRef.current.scrollHeight;
    }
  }, [commentary]);

  const commentaryRef = useRef<HTMLDivElement>(null);

  function generateMatchEvents(
    goals: number,
    assists: number,
    pos: string,
    isGK: boolean,
    matchResult: MatchResult,
  ): RatingEvent[] {
    const events: RatingEvent[] = [];
    if (goals > 0) {
      events.push({ type: 'goal', count: goals });
      if (matchResult === 'Win' && goals > 0) {
        events.push({ type: 'matchWinnerGoal', count: 1 });
      }
    }
    if (assists > 0) events.push({ type: 'assist', count: assists });
    const keyPasses = assists * 2 + Math.floor(Math.random() * 3);
    if (keyPasses > 0) events.push({ type: 'keyPass', count: keyPasses });
    const bigChances = goals + Math.floor(Math.random() * 2);
    if (bigChances > 0) events.push({ type: 'bigChanceCreated', count: bigChances });
    const attackingPositions = ['ST', 'CF', 'LW', 'RW', 'CAM', 'LM', 'RM'];
    const dribbles = attackingPositions.includes(pos) ? Math.floor(Math.random() * 6) + 2 : Math.floor(Math.random() * 3);
    if (dribbles > 0) events.push({ type: 'successfulDribble', count: dribbles });
    const defendingPositions = ['CB', 'LB', 'RB', 'CDM'];
    const tackles = defendingPositions.includes(pos) ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 4);
    if (tackles > 0) events.push({ type: 'tackleWon', count: tackles });
    const interceptions = defendingPositions.includes(pos) ? Math.floor(Math.random() * 6) + 3 : Math.floor(Math.random() * 3);
    if (interceptions > 0) events.push({ type: 'interception', count: interceptions });
    const clearances = defendingPositions.includes(pos) ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 2);
    if (clearances > 0) events.push({ type: 'clearance', count: clearances });
    if (Math.random() > 0.5) events.push({ type: 'accuratePassHigh', count: 1 });
    if (Math.random() < 0.3) events.push({ type: 'wrongPass', count: Math.floor(Math.random() * 3) + 1 });
    if (Math.random() < 0.2) events.push({ type: 'lostPossession', count: Math.floor(Math.random() * 4) + 1 });
    if (Math.random() < 0.1) events.push({ type: 'missedBigChance', count: 1 });
    if (isGK) {
      const saves = Math.floor(Math.random() * 6) + 2;
      if (saves > 0) events.push({ type: 'save', count: saves });
      if (matchResult === 'Win' || matchResult === 'Draw') {
        events.push({ type: 'cleanSheet', count: 1 });
      }
    }
    if (defendingPositions.includes(pos) && goals === 0 && (matchResult === 'Win' || matchResult === 'Draw')) {
      events.push({ type: 'cleanSheet', count: 1 });
    }
    return events;
  }

  function determineMOTM(rating: number, _goals: number, result: MatchResult, _playerName: string): boolean {
    const aiCount = 20 + randInt(0, 6);
    const aiRatings: number[] = [];
    for (let i = 0; i < aiCount; i++) {
      const base = 5.0 + Math.random() * 3.5;
      const goalBonus = Math.random() < 0.08 ? 0.6 : 0;
      const assistBonus = Math.random() < 0.1 ? 0.3 : 0;
      const winBonus = result === 'Win' && Math.random() < 0.3 ? 0.2 : 0;
      aiRatings.push(clamp(base + goalBonus + assistBonus + winBonus, 3.0, 10.0));
    }
    aiRatings.push(rating);
    aiRatings.sort((a, b) => b - a);
    const isTop = aiRatings[0] === rating;
    return isTop && rating >= 7.5;
  }

  useEffect(() => {
    if (showResult) {
      advanceRef.current = window.setTimeout(() => {
        const isGK = player?.position === 'GK';
        const result: MatchResult =
          score.home > score.away ? 'Win' : score.home < score.away ? 'Loss' : 'Draw';

        const rawEvents = generateMatchEvents(playerGoals, playerAssists, player?.position ?? 'ST', isGK, result);
        const qteEventCount = matchEvents.filter((e) => e.type === 'QTE').length;
        if (qteEventCount > 0) {
          rawEvents.push({ type: 'keyPass', count: Math.min(qteEventCount, 3) });
        }

        const xpEarned = Math.round(
          computedFinalRating * 8 +
            (result === 'Win' ? 20 : result === 'Draw' ? 10 : 5) +
            playerGoals * 15 +
            playerAssists * 8
        );

        const st = useGameStore.getState();
        const p = st.player;
        if (p) {
          const newForm = clamp(
            p.form + Math.round((computedFinalRating - 7) * 4) + (result === 'Win' ? 3 : result === 'Loss' ? -3 : 0),
            0,
            100
          );
          const newMorale = clamp(
            p.morale + (result === 'Win' ? 4 : result === 'Loss' ? -4 : 1),
            0,
            100
          );
          const newManagerTrust = clamp(
            p.managerTrust + (computedFinalRating >= 7.5 ? 3 : computedFinalRating >= 6.5 ? 1 : -2),
            0,
            100
          );
          const newConfidence = clamp(
            p.confidence + (result === 'Win' ? 5 : result === 'Loss' ? -3 : 1),
            0,
            100
          );
          const newPopularity = clamp(
            p.popularity + (motmAwarded ? 3 : result === 'Win' ? 1 : 0) + (playerGoals > 0 ? 1 : 0),
            0,
            100
          );

          const perf: MatchPerformance = {
            week: nextMatch?.week ?? 1,
            season: p.currentSeason,
            opponent: nextMatch?.opponent ?? 'Opponent',
            result,
            goals: playerGoals,
            assists: playerAssists,
            keyPasses: playerAssists * 2 + Math.floor(Math.random() * 3),
            shots: playerGoals + Math.floor(Math.random() * 4) + 1,
            tackles: Math.floor(Math.random() * 5),
            interceptions: Math.floor(Math.random() * 4),
            saves: p.position === 'GK' ? Math.floor(Math.random() * 6) : 0,
            possessionWon: Math.floor(Math.random() * 8),
            distanceCovered: Math.round((9 + Math.random() * 3) * 10) / 10,
            passAccuracy: 75 + Math.floor(Math.random() * 20),
            rating: computedFinalRating,
            manOfTheMatch: motmAwarded,
            xpEarned,
            minutesPlayed: 90,
          };

          const updatedPlayer = {
            seasonGoals: p.seasonGoals + playerGoals,
            seasonAssists: p.seasonAssists + playerAssists,
            seasonAppearances: p.seasonAppearances + 1,
            careerGoals: p.careerGoals + playerGoals,
            careerAssists: p.careerAssists + playerAssists,
            careerAppearances: p.careerAppearances + 1,
            totalXp: p.totalXp + xpEarned,
            form: newForm,
            morale: newMorale,
            managerTrust: newManagerTrust,
            confidence: newConfidence,
            popularity: newPopularity,
            matchHistory: [...p.matchHistory, perf],
          };
          st.updatePlayer(updatedPlayer);
          st.addMatchPerformance(perf);

          const updatedPlayerFull = { ...p, ...updatedPlayer };
          const newMarketValue = calculateMarketValue(updatedPlayerFull as Player);
          const withBonus = processMatchBonus(updatedPlayerFull as Player, perf);
          st.updatePlayer({
            marketValue: newMarketValue,
            bankBalance: withBonus.bankBalance,
          });
        }

        st.generateClubOffers();

        const sim = useSimulationStore.getState();
        const homeGoals = isHome ? score.home : score.away;
        const awayGoals = isHome ? score.away : score.home;
        sim.recordPlayerMatch({
          leagueName: currentLeague?.name ?? '',
          clubId: currentClub?.id ?? '',
          opponentName: nextMatch?.opponent ?? '',
          isHome,
          homeGoals,
          awayGoals,
        });

        st.advanceWeek();
        st.scheduleNextMatch();
        endMatch();
        goTo('home');
      }, 8000);
    }
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult]);

  if (!player) return null;

  if (!matchState) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          {!showResult ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <HiTrophy className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-indigo-400 font-semibold uppercase tracking-wider">{matchState.competition}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMuted((m) => !m)}
                    title={muted ? 'Unmute' : 'Mute'}
                    className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    {muted ? <HiSpeakerXMark className="w-4 h-4" /> : <HiSpeakerWave className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setPaused((p) => !p)}
                    title={paused ? 'Resume' : 'Pause'}
                    className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-40"
                  >
                    {paused ? <HiPlay className="w-4 h-4" /> : <HiPause className="w-4 h-4" />}
                  </button>
                  <div className="flex rounded-full bg-gray-900 border border-gray-800 overflow-hidden">
                    {[1, 2, 4].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-2 py-1 text-xs font-bold ${speed === s ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                  <Badge variant="info">{isHalfTime ? 'Half Time' : isFullTime ? 'Full Time' : paused ? 'Paused' : 'LIVE'}</Badge>
                </div>
              </motion.div>

              <div className={`rounded-2xl overflow-hidden max-w-4xl mx-auto ${shake ? 'pitch-shake' : ''}`}>
                <PitchCanvas
                  ref={pitchRef}
                  homeColor={homeColor}
                  awayColor={awayColor}
                  homeFormation={'4-3-3'}
                  awayFormation={'4-3-3'}
                  playerIsHome={isHome}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 text-center"
              >
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="flex-1 flex items-center justify-end gap-3">
                    <ClubCrest club={isHome ? currentClub : opponentClub} name={matchState.homeTeam} color={homeColor} size={28} />
                    <p className="text-lg font-bold text-white">{matchState.homeTeam}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-white">{score.home}</span>
                    <span className="text-2xl text-gray-600">-</span>
                    <span className="text-5xl font-black text-white">{score.away}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-start gap-3">
                    <p className="text-lg font-bold text-white">{matchState.awayTeam}</p>
                    <ClubCrest club={isHome ? opponentClub : currentClub} name={matchState.awayTeam} color={awayColor} size={28} />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <HiCalendar className="w-4 h-4 text-gray-500" />
                  <span className="text-2xl font-mono font-bold text-indigo-400">{formatMinute(matchTime)}</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Possession', home: `${stats.possession.home}%`, away: `${stats.possession.away}%`, icon: <HiArrowTrendingUp className="w-4 h-4 text-blue-400" /> },
                  { label: 'xG', home: stats.xG.home.toFixed(1), away: stats.xG.away.toFixed(1), icon: <HiTrophy className="w-4 h-4 text-amber-400" /> },
                  { label: 'Shots', home: stats.shots.home, away: stats.shots.away, icon: <HiBolt className="w-4 h-4 text-rose-400" /> },
                  { label: 'Pass Acc', home: `${stats.passAccuracy.home}%`, away: `${stats.passAccuracy.away}%`, icon: <HiAcademicCap className="w-4 h-4 text-emerald-400" /> },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <div className="flex items-center gap-2 mb-2">
                      {stat.icon}
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-white">{stat.home}</span>
                      <span className="text-gray-600">vs</span>
                      <span className="text-white">{stat.away}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{matchState.homeTeam}</span>
                    <span className="font-semibold text-indigo-400">MOMENTUM</span>
                    <span>{matchState.awayTeam}</span>
                  </div>
                  <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ left: `${stats.momentum}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      className="absolute top-0 w-1 h-full bg-indigo-400 rounded-full"
                      style={{ transform: 'translateX(-50%)' }}
                    />
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.momentum}%`,
                        background: `linear-gradient(90deg, ${stats.momentum < 50 ? '#ef4444' : '#22c55e'}, ${stats.momentum < 50 ? '#f97316' : '#10b981'})`,
                      }}
                    />
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Card header={<span className="text-sm font-bold text-white uppercase tracking-wider">Commentary</span>}>
                    <div
                      ref={commentaryRef}
                      className="h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-800"
                    >
                      {commentary.map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`text-sm ${line.startsWith('GOAL!') ? 'text-amber-400 font-bold' : line.startsWith('Half') || line.startsWith('The final') ? 'text-indigo-400 font-semibold' : line.startsWith('Yellow') ? 'text-yellow-400' : line.startsWith('Red') ? 'text-rose-400' : 'text-gray-300'}`}
                        >
                          <span className="text-gray-600 mr-2">{formatMinute(matchTime)}</span>
                          {line}
                        </motion.p>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card header={<span className="text-sm font-bold text-white uppercase tracking-wider">Player Rating</span>}>
                    <div className="text-center">
                      <span className="text-4xl font-black bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                        {stats.playerRating.toFixed(1)}
                      </span>
                      <ProgressBar value={(stats.playerRating - 6) * 25} color="indigo" size="sm" className="mt-2" />
                    </div>
                  </Card>

                  <Card header={<span className="text-sm font-bold text-white uppercase tracking-wider">Events</span>}>
                    <div className="h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {matchEvents.slice(-8).reverse().map((evt, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-gray-600 shrink-0 w-6">{evt.minute}'</span>
                          {evt.type === 'Goal' && <HiTrophy className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />}
                          {evt.type === 'Yellow' && <span className="w-3.5 h-3.5 bg-yellow-400 rounded-sm mt-0.5 shrink-0" />}
                          {evt.type === 'Red' && <span className="w-3.5 h-3.5 bg-rose-500 rounded-sm mt-0.5 shrink-0" />}
                          {evt.type === 'QTE' && <HiBolt className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />}
                          <span className={evt.type === 'Goal' ? 'text-amber-300 font-semibold' : 'text-gray-400'}>{evt.description}</span>
                        </div>
                      ))}
                      {matchEvents.length === 0 && (
                        <p className="text-gray-600 text-xs">No events yet</p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto text-center space-y-6 py-12"
            >
              <Card className="border-indigo-500/30">
                <div className="text-center space-y-4">
                  <HiTrophy className="w-12 h-12 text-amber-400 mx-auto" />
                  <p className="text-sm text-indigo-400 uppercase tracking-wider font-semibold">{matchState.competition}</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <ClubCrest club={isHome ? currentClub : opponentClub} name={matchState.homeTeam} color={homeColor} size={24} />
                      <p className="text-lg font-bold text-white">{matchState.homeTeam}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-6xl font-black text-white">{score.home}</span>
                      <span className="text-2xl text-gray-600">-</span>
                      <span className="text-6xl font-black text-white">{score.away}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-white">{matchState.awayTeam}</p>
                      <ClubCrest club={isHome ? opponentClub : currentClub} name={matchState.awayTeam} color={awayColor} size={24} />
                    </div>
                  </div>
                  <div className="border-t border-gray-800 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Result</span>
                      <span className={`font-semibold ${score.home > score.away ? 'text-emerald-400' : score.home < score.away ? 'text-rose-400' : 'text-amber-400'}`}>
                        {score.home > score.away ? 'WIN' : score.home < score.away ? 'LOSS' : 'DRAW'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rating</span>
                      <span className={`font-semibold ${computedFinalRating > 0 ? getRatingColor(computedFinalLabel) : 'text-gray-400'}`}>
                        {computedFinalRating > 0 ? `${computedFinalRating.toFixed(1)} — ${computedFinalLabel}` : 'Calculating...'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Goals (this match)</span>
                      <span className="text-white font-semibold">{playerGoals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Assists (this match)</span>
                      <span className="text-white font-semibold">{playerAssists}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Energy Used</span>
                      <span className="text-rose-400 font-semibold">{Math.round(energyUsedRef.current)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">XP Earned</span>
                      <span className="text-amber-400 font-semibold">+{Math.round(
                        (computedFinalRating > 0 ? computedFinalRating : stats.playerRating) * 8 +
                        (score.home > score.away ? 20 : score.home < score.away ? 5 : 10) +
                        playerGoals * 15 + playerAssists * 8
                      )}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    {motmAwarded ? (
                      <Badge variant="success" icon={<HiStar className="w-3.5 h-3.5" />}>
                        Man of the Match
                      </Badge>
                    ) : (
                      <Badge variant="info">Full Time</Badge>
                    )}
                  </div>
                  <Button variant="primary" onClick={() => goTo('home')}>
                    Continue
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {showQTE && (
            <QTEOverlay type={qteType} onResolve={resolveQTE} />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
