import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiTrophy,
  HiStar,
  HiArrowTrendingUp,
  HiCalendar,
  HiAcademicCap,
  HiBolt,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import { useMatchStore } from '../../stores/matchStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import PageTransition from '../../components/layout/PageTransition';
import {
  playerRelevantAttribute,
  playerTeamStrength,
  opponentStrengthFromClub,
  playerTeamWinProbability,
  resolveQTESkill,
} from '../../simulation/matchSimulation';
import type { MatchState, QTEResult, QTEType, MatchPerformance, MatchResult } from '../../types';
import { useSimulationStore } from '../../stores/simulationStore';

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
  ],
  chance: [
    'What a chance! Saved brilliantly!',
    'Just wide from {p}! So close!',
    'Off the bar! Unlucky!',
    'Great save! The keeper tips it around the post!',
    '{p} should have scored there!',
    'A wonderful diving save!',
  ],
  goal: [
    'GOAL! What a strike from {p}!',
    'GOAL! {p} finds the back of the net!',
    'GOAL! Incredible finish from {p}!',
    'GOAL! {p} slots it home calmly!',
    'GOAL! A header from {p}! Unstoppable!',
  ],
  defense: [
    '{p} makes a crucial tackle!',
    '{p} reads the play perfectly and intercepts!',
    'A well-timed challenge from {p}!',
    '{p} clears the danger!',
  ],
  card: [
    'Yellow card! {p} goes into the book.',
    'Red card! {p} is sent off!',
  ],
  neutral: [
    'The crowd urges their team forward...',
    'Possession football from both sides at the moment.',
    'The tempo has dropped slightly here.',
    'Both teams are well organized defensively.',
    'A tactical battle unfolding in midfield.',
  ],
};

function generateCommentary(playerName: string, category: keyof typeof COMMENTARY_POOL): string {
  const lines = COMMENTARY_POOL[category];
  const line = pick(lines);
  return line.replace(/{p}/g, playerName);
}

function formatMinute(m: number): string {
  return `${Math.floor(m)}:${String(Math.round((m % 1) * 60)).padStart(2, '0')}`;
}

function QTEResultOverlay({ result }: { result: QTEResult }) {
  const config: Record<QTEResult, { label: string; color: string; emoji: string }> = {
    Perfect: { label: 'PERFECT!', color: 'text-amber-400', emoji: '⭐⭐⭐' },
    Great: { label: 'GREAT!', color: 'text-emerald-400', emoji: '⭐⭐' },
    Good: { label: 'GOOD', color: 'text-blue-400', emoji: '⭐' },
    Late: { label: 'LATE', color: 'text-orange-400', emoji: '⚠' },
    Miss: { label: 'MISS!', color: 'text-rose-400', emoji: '✕' },
  };
  const c = config[result];
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`text-center ${c.color}`}
    >
      <p className="text-6xl font-black">{c.emoji}</p>
      <p className="text-4xl font-black mt-2">{c.label}</p>
    </motion.div>
  );
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
  const [qtePosition, setQtePosition] = useState(0);
  const [qteType, setQteType] = useState<QTEType>('Finish');
  const [qteResult, setQteResult] = useState<QTEResult | null>(null);
  const [qteResolved, setQteResolved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [matchTime, setMatchTime] = useState(0);
  const [playerGoals, setPlayerGoals] = useState(0);
  const [playerAssists, setPlayerAssists] = useState(0);
  const [isHalfTime, setIsHalfTime] = useState(false);
  const [isFullTime, setIsFullTime] = useState(false);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [stats, setStats] = useState({
    possession: { home: 50, away: 50 },
    xG: { home: 0, away: 0 },
    shots: { home: 0, away: 0 },
    passAccuracy: { home: 85, away: 85 },
    momentum: 50,
    playerRating: 6.0,
  });

  const commentaryRef = useRef<HTMLDivElement>(null);
  const matchIntervalRef = useRef<number | null>(null);
  const advanceRef = useRef<number | null>(null);
  const qteAnimRef = useRef<number | null>(null);
  const qteStartRef = useRef(0);

  useEffect(() => {
    if (!player || !currentClub || !nextMatch) return;

    setPlayerGoals(0);
    setPlayerAssists(0);

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
      playerRating: 6.0,
      commentary: 'The match is about to begin!',
      isPlayerTeam: nextMatch.isHome ? 'home' : 'away',
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

    return () => {
      resetMatch();
    };
  }, []);

  const triggerQTE = useCallback(() => {
    const posTypes = QTE_TYPES_BY_POSITION[player?.position ?? 'ST'] || ['Finish'];
    setQteType(posTypes[Math.floor(Math.random() * posTypes.length)]);
    setQtePosition(50);
    setQteResult(null);
    setQteResolved(false);
    setShowQTE(true);
    qteStartRef.current = performance.now();

    const duration = 2000;
    let startPos = -10;

    if (qteAnimRef.current) cancelAnimationFrame(qteAnimRef.current);

    const animate = (now: number) => {
      const elapsed = now - qteStartRef.current;
      const progress = (elapsed % duration) / duration;
      const pos = startPos + (110 * progress);
      setQtePosition(clamp(pos, -10, 100));
      qteAnimRef.current = requestAnimationFrame(animate);
    };
    qteAnimRef.current = requestAnimationFrame(animate);
  }, []);

  const handleQTEClick = useCallback(() => {
    if (qteResolved || !showQTE) return;
    if (qteAnimRef.current) cancelAnimationFrame(qteAnimRef.current);

    const pos = qtePosition;
    let result: QTEResult;
    if (pos >= 42 && pos <= 58) result = 'Perfect';
    else if (pos >= 35 && pos <= 65) result = 'Great';
    else if (pos >= 25 && pos <= 75) result = 'Good';
    else if (pos >= 15 && pos <= 85) result = 'Late';
    else result = 'Miss';

    setQteResult(result);
    setQteResolved(true);

    const skill = player ? playerRelevantAttribute(player, qteType) : 70;
    const difficulty = matchState?.currentQTE?.difficulty ?? 5;
    const outcome = resolveQTESkill(result, skill, difficulty);

    addCommentary(`${player?.name ?? 'Player'} ${result === 'Perfect' ? 'with a perfect' : result === 'Great' ? 'with a great' : result === 'Good' ? 'manages a' : result === 'Late' ? 'late' : 'misses the'} ${qteType} effort!`);

    if (outcome.didScore) {
      const homeScored = nextMatch?.isHome ?? true;
      setPlayerGoals((g) => g + 1);
      setScore((s) => homeScored ? { ...s, home: s.home + 1 } : { ...s, away: s.away + 1 });
      addMatchEvent({
        minute: Math.floor(matchTime),
        type: 'Goal',
        playerName: player?.name ?? '',
        description: `GOAL! ${player?.name} ${qteType === 'Header' ? 'heads' : qteType === 'Penalty' ? 'converts the penalty' : qteType === 'Volley' ? 'volleys' : qteType === 'Cross' ? 'crosses for a finish' : 'finishes'} brilliantly!`,
        team: homeScored ? 'home' : 'away',
      });
      addCommentary(`${player?.name} ${qteType === 'Header' ? 'powers a header' : qteType === 'Penalty' ? 'slots the penalty away' : qteType === 'Cross' ? 'whips in a cross that is tapped in' : qteType === 'Volley' ? 'volleys home' : 'finishes with class'} — GOAL for ${homeScored ? currentClub?.name ?? 'your team' : nextMatch?.opponent ?? 'Opponent'}!`);
    }

    setStats((s) => ({
      ...s,
      playerRating: clamp(s.playerRating + outcome.ratingBoost, 6.0, 10.0),
      momentum: clamp(s.momentum + outcome.momentumBoost, 0, 100),
    }));

    setTimeout(() => {
      setShowQTE(false);
      setQteResult(null);
    }, 1500);
  }, [qtePosition, qteResolved, showQTE, player, nextMatch, matchTime, addCommentary, addMatchEvent]);

  const isLiveRef = useRef(matchState?.isLive ?? false);
  const halfTimeRef = useRef(false);
  const fullTimeRef = useRef(false);
  const showQTERef = useRef(false);

  useEffect(() => {
    isLiveRef.current = matchState?.isLive ?? false;
  }, [matchState?.isLive]);

  useEffect(() => {
    halfTimeRef.current = isHalfTime;
  }, [isHalfTime]);

  useEffect(() => {
    fullTimeRef.current = isFullTime;
  }, [isFullTime]);

  useEffect(() => {
    showQTERef.current = showQTE;
  }, [showQTE]);

  useEffect(() => {
    if (!matchState?.isLive) return;

    const speed = 450;

    matchIntervalRef.current = window.setInterval(() => {
      setMatchTime((prev) => {
        if (fullTimeRef.current) return prev;
        const adv = randInt(1, 2);
        let newMinute = prev + adv;

        if (newMinute >= 45 && prev < 45) {
          setIsHalfTime(true);
          halfTimeRef.current = true;
          addCommentary('Half time! The teams head to the tunnel.');
          return 45;
        }

        if (newMinute >= 90) {
          const stoppage = randInt(1, 4);
          newMinute = 90 + stoppage;
          setIsFullTime(true);
          fullTimeRef.current = true;
          setIsHalfTime(false);
          setShowResult(true);
          addCommentary('The final whistle goes! Full time!');
          updateMatchState({ isLive: false, isFullTime: true, minute: newMinute });
          return newMinute;
        }

        if (halfTimeRef.current && newMinute > 45) {
          setIsHalfTime(false);
          halfTimeRef.current = false;
          setMatchTime(45);
          addCommentary('The second half is underway!');
          return 45;
        }

        const eventRoll = Math.random();

        if (eventRoll < 0.04) {
          const scored = Math.random() < playerTeamScoreProb;
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
              addMatchEvent({
                minute: newMinute,
                type: 'Goal',
                playerName: scorer,
                description: `GOAL! ${scorer} scores for ${currentClub?.name ?? 'your team'}!`,
                team: 'home',
              });
              addCommentary(`GOAL! ${scorer} finds the net for ${currentClub?.name ?? 'your team'}! A fine finish!`);
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
            addMatchEvent({
              minute: newMinute,
              type: 'Goal',
              playerName: scorer,
              description: `Goal for ${scorer} (${nextMatch?.opponent ?? 'Opponent'})`,
              team: 'away',
            });
            addCommentary(`Goal for ${nextMatch?.opponent ?? 'Opponent'}... ${player?.name} will be disappointed at the other end.`);
          }
        } else if (eventRoll < 0.12) {
          addCommentary(generateCommentary(player?.name ?? 'Player', 'chance'));
          setStats((s) => ({
            ...s,
            shots: { ...s.shots, home: s.shots.home + 1 },
            xG: { ...s.xG, home: Math.round((s.xG.home + Math.random() * 0.2) * 10) / 10 },
          }));
        } else if (eventRoll < 0.15 && !showQTERef.current) {
          triggerQTE();
        } else if (eventRoll < 0.3) {
          addCommentary(generateCommentary(player?.name ?? 'Player', 'attack'));
        } else if (eventRoll < 0.4) {
          addCommentary(generateCommentary(player?.name ?? 'Player', 'defense'));
        } else if (eventRoll < 0.55) {
          addCommentary(pick(COMMENTARY_POOL.neutral));
        }

        const momentumShift = (Math.random() - 0.5) * 6;
        setStats((s) => ({
          ...s,
          momentum: clamp(s.momentum + momentumShift, 0, 100),
          possession: { home: clamp(50 + (Math.random() - 0.5) * 10, 35, 65), away: 100 - clamp(50 + (Math.random() - 0.5) * 10, 35, 65) },
          passAccuracy: {
            home: clamp(85 + randInt(-3, 3), 70, 95),
            away: clamp(83 + randInt(-3, 3), 70, 95),
          },
          playerRating: clamp(s.playerRating + (Math.random() - 0.5) * 0.06, 6.0, 10.0),
        }));

        updateMatchState({ minute: newMinute });

        return newMinute;
      });
    }, speed);

    return () => {
      if (matchIntervalRef.current) clearInterval(matchIntervalRef.current);
    };
  }, [matchState?.isLive, triggerQTE]);

  useEffect(() => {
    if (commentaryRef.current) {
      commentaryRef.current.scrollTop = commentaryRef.current.scrollHeight;
    }
  }, [commentary]);

  useEffect(() => {
    if (showResult) {
      advanceRef.current = window.setTimeout(() => {
        const finalRating = stats.playerRating;
        const result: MatchResult =
          score.home > score.away ? 'Win' : score.home < score.away ? 'Loss' : 'Draw';
        const motm = finalRating >= 8 || (playerGoals > 0 && finalRating >= 7.5);
        const xpEarned = Math.round(
          finalRating * 8 +
            (result === 'Win' ? 20 : result === 'Draw' ? 10 : 5) +
            playerGoals * 15 +
            playerAssists * 8
        );

        const st = useGameStore.getState();
        const p = st.player;
        if (p) {
          const newForm = clamp(
            p.form + Math.round((finalRating - 7) * 4) + (result === 'Win' ? 3 : result === 'Loss' ? -3 : 0),
            0,
            100
          );
          const newMorale = clamp(
            p.morale + (result === 'Win' ? 4 : result === 'Loss' ? -4 : 1),
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
            rating: Math.round(finalRating * 10) / 10,
            manOfTheMatch: motm,
            xpEarned,
            minutesPlayed: 90,
          };

          st.updatePlayer({
            seasonGoals: p.seasonGoals + playerGoals,
            seasonAssists: p.seasonAssists + playerAssists,
            seasonAppearances: p.seasonAppearances + 1,
            careerGoals: p.careerGoals + playerGoals,
            careerAssists: p.careerAssists + playerAssists,
            careerAppearances: p.careerAppearances + 1,
            totalXp: p.totalXp + xpEarned,
            form: newForm,
            morale: newMorale,
            matchHistory: [...p.matchHistory, perf],
          });
          st.addMatchPerformance(perf);
        }

          st.generateClubOffers();

          const sim = useSimulationStore.getState();
          const isHome = matchState?.isPlayerTeam === 'home';
          const homeGoals = isHome ? score.home : score.away;
          const awayGoals = isHome ? score.away : score.home;
          sim.recordPlayerMatch({
            leagueName: currentLeague?.name ?? '',
            clubId: currentClub?.id ?? '',
            opponentName: nextMatch?.opponent ?? '',
            isHome: isHome,
            homeGoals,
            awayGoals,
          });

          st.advanceWeek();
        st.scheduleNextMatch();
        endMatch();
        goTo('home');
      }, 5000);
    }
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, [showResult]);

  if (!matchState || !player) return null;

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
                <Badge variant="info">{isHalfTime ? 'Half Time' : isFullTime ? 'Full Time' : 'LIVE'}</Badge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 text-center"
              >
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="flex-1 text-right">
                    <p className="text-lg font-bold text-white">{currentClub?.name ?? 'your team'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-white">{score.home}</span>
                    <span className="text-2xl text-gray-600">-</span>
                    <span className="text-5xl font-black text-white">{score.away}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-lg font-bold text-white">{nextMatch?.opponent ?? 'Opponent'}</p>
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
                    <span>{currentClub?.name ?? 'your team'}</span>
                    <span className="font-semibold text-indigo-400">MOMENTUM</span>
                    <span>{nextMatch?.opponent ?? 'Opponent'}</span>
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
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{currentClub?.name ?? 'your team'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-6xl font-black text-white">{score.home}</span>
                      <span className="text-2xl text-gray-600">-</span>
                      <span className="text-6xl font-black text-white">{score.away}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-white">{nextMatch?.opponent ?? 'Opponent'}</p>
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
                      <span className="text-white font-semibold">{stats.playerRating.toFixed(1)}</span>
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
                      <span className="text-rose-400 font-semibold">{Math.round(player.physical.energy - stats.playerRating * 5)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">XP Earned</span>
                      <span className="text-amber-400 font-semibold">+{Math.round(stats.playerRating * 8 + (score.home > score.away ? 20 : score.home === score.away ? 10 : 5) + playerGoals * 15 + playerAssists * 8)}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    {stats.playerRating >= 8 || (playerGoals > 0 && stats.playerRating >= 7.5) ? (
                      <Badge variant="success" icon={<HiStar className="w-3.5 h-3.5" />}>
                        Man of the Match
                      </Badge>
                    ) : (
                      <Badge variant="info">Full Time</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Auto-advancing in 5 seconds...</p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {showQTE && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              onClick={handleQTEClick}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -20 }}
                className="w-full max-w-lg mx-4"
              >
                <Card className="border-indigo-500/50">
                  <div className="text-center space-y-6 py-4">
                    <div className="space-y-1">
                      <p className="text-2xl font-black bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                        FINISHING CHANCE!
                      </p>
                      <p className="text-sm text-gray-500">Tap at the right moment</p>
                    </div>

                    <div className="relative h-16 bg-gray-800 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <div className="flex-1 bg-rose-500/30" />
                        <div className="flex-1 bg-orange-500/30" />
                        <div className="flex-1 bg-emerald-500/30" />
                        <div className="flex-1 bg-amber-500/30" />
                        <div className="flex-1 bg-rose-500/30" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex w-full h-full">
                          <div className="flex-1 flex items-center justify-center text-xs text-rose-300 font-semibold">Miss</div>
                          <div className="flex-1 flex items-center justify-center text-xs text-orange-300 font-semibold">Good</div>
                          <div className="flex-1 flex items-center justify-center text-xs text-emerald-300 font-semibold">Great</div>
                          <div className="flex-1 flex items-center justify-center text-xs text-amber-300 font-semibold">Perfect</div>
                          <div className="flex-1 flex items-center justify-center text-xs text-rose-300 font-semibold">Miss</div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ left: `${qtePosition}%` }}
                        transition={{ duration: 0.05, ease: 'linear' as const }}
                        className="absolute top-0 w-1 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        style={{ transform: 'translateX(-50%)' }}
                      />
                    </div>

                    <AnimatePresence>
                      {qteResult && (
                        <QTEResultOverlay result={qteResult} />
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

