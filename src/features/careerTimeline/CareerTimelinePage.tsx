import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HiTrophy,
  HiStar,
  HiAcademicCap,
  HiFire,
  HiCalendarDays,
  HiUserGroup,
  HiFlag,
  HiArrowRight,
  HiShieldExclamation,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatDisplay from '../../components/ui/StatDisplay';
import PageTransition from '../../components/layout/PageTransition';

interface SeasonEntry {
  season: number;
  label: string;
  club: string;
  clubColors: { primary: string; secondary: string };
  leaguePosition: number;
  goals: number;
  assists: number;
  appearances: number;
  avgRating: number;
  trophies: string[];
  awards: string[];
  events: TimelineEvent[];
}

interface TimelineEvent {
  type: 'debut' | 'firstGoal' | 'hatTrick' | 'transfer' | 'injury' | 'trophy' | 'internationalDebut' | 'award';
  label: string;
  description: string;
}

const eventConfig: Record<TimelineEvent['type'], { icon: typeof HiTrophy; color: string; badge: string }> = {
  debut: { icon: HiCalendarDays, color: 'text-amber-400', badge: 'PRO DEBUT' },
  firstGoal: { icon: HiTrophy, color: 'text-emerald-400', badge: 'FIRST GOAL' },
  hatTrick: { icon: HiTrophy, color: 'text-purple-400', badge: 'HAT-TRICK' },
  transfer: { icon: HiArrowRight, color: 'text-sky-400', badge: 'TRANSFER' },
  injury: { icon: HiShieldExclamation, color: 'text-rose-400', badge: 'INJURY' },
  trophy: { icon: HiTrophy, color: 'text-amber-400', badge: 'TROPHY WIN' },
  internationalDebut: { icon: HiFlag, color: 'text-indigo-400', badge: "INT'L DEBUT" },
  award: { icon: HiStar, color: 'text-yellow-400', badge: 'AWARD WIN' },
};

function hallOfFameRating(seasons: number, totalGoals: number, totalAssists: number, totalTrophies: number, totalApps: number): { label: string; stars: number; color: string } {
  let score = 0;
  score += Math.min(seasons * 5, 25);
  score += Math.min(totalGoals * 2, 30);
  score += Math.min(totalAssists * 1.5, 15);
  score += totalTrophies * 5;
  score += Math.min(totalApps * 0.5, 15);

  if (score >= 80) return { label: 'Legend', stars: 5, color: 'text-amber-400' };
  if (score >= 60) return { label: 'Icon', stars: 4, color: 'text-purple-400' };
  if (score >= 40) return { label: 'Star', stars: 3, color: 'text-sky-400' };
  if (score >= 20) return { label: 'Professional', stars: 2, color: 'text-emerald-400' };
  return { label: 'Journeyman', stars: 1, color: 'text-gray-400' };
}

export default function CareerTimelinePage() {
  const player = useGameStore((s) => s.player);
  const currentClub = useGameStore((s) => s.currentClub);
  const currentSeason = useGameStore((s) => s.currentSeason);

  const { seasons, totals, hof } = useMemo(() => {
    if (!player) return { seasons: [] as SeasonEntry[], totals: { goals: 0, assists: 0, apps: 0 }, hof: { label: '', stars: 0, color: '' } };

    const matchHistory = player.matchHistory ?? [];
    const seasonsMap = new Map<number, { goals: number; assists: number; apps: number; ratings: number[] }>();

    for (const m of matchHistory) {
      const s = m.season;
      if (!seasonsMap.has(s)) seasonsMap.set(s, { goals: 0, assists: 0, apps: 0, ratings: [] });
      const data = seasonsMap.get(s)!;
      data.goals += m.goals;
      data.assists += m.assists;
      data.apps += 1;
      data.ratings.push(m.rating);
    }

    const entries: SeasonEntry[] = [];
    for (let i = 1; i <= currentSeason; i++) {
      const data = seasonsMap.get(i) ?? { goals: 0, assists: 0, apps: 0, ratings: [] };
      const avgRating = data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0;

      const events: TimelineEvent[] = [];
      if (i === 1) {
        events.push({ type: 'debut', label: 'Professional Debut', description: 'First senior appearance' });
      }
      if (data.goals > 0 && entries.every((e) => e.goals === 0)) {
        events.push({ type: 'firstGoal', label: 'First Career Goal', description: `Scored first goal in season ${i}` });
      }
      if (data.goals >= 3) {
        events.push({ type: 'hatTrick', label: 'Hat-Trick', description: `Scored ${data.goals} goals this season` });
      }

      entries.push({
        season: i,
        label: `Season ${i} - ${2024 + i - 1}/${String(24 + i - 1).padStart(2, '0')}`,
        club: currentClub?.name ?? 'Unknown',
        clubColors: currentClub?.colors ?? { primary: '#6366f1', secondary: '#a855f7' },
        leaguePosition: currentClub?.leaguePosition ?? 0,
        goals: data.goals,
        assists: data.assists,
        appearances: data.apps,
        avgRating: Math.round(avgRating * 10) / 10,
        trophies: [],
        awards: [],
        events,
      });
    }

    const totals = {
      goals: player.careerGoals ?? entries.reduce((s, e) => s + e.goals, 0),
      assists: player.careerAssists ?? entries.reduce((s, e) => s + e.assists, 0),
      apps: player.careerAppearances ?? entries.reduce((s, e) => s + e.appearances, 0),
    };
    const trophiesCount = entries.reduce((s, e) => s + e.trophies.length, 0);
    const hof = hallOfFameRating(entries.length, totals.goals, totals.assists, trophiesCount, totals.apps);

    return { seasons: entries, totals, hof };
  }, [player, currentClub, currentSeason]);

  if (!player) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64 text-gray-500">No career data available.</div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <HiAcademicCap className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl font-bold">Career Timeline</h1>
          </div>

          {/* Header Stats */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{player.nationality}</span>
                <div>
                  <p className="text-xl font-bold text-white">{player.name}</p>
                  <p className="text-sm text-gray-400">{player.position} &middot; {seasons.length} seasons</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 md:gap-8">
                <StatDisplay label="Appearances" value={totals.apps} icon={<HiCalendarDays className="text-blue-400" />} />
                <StatDisplay label="Goals" value={totals.goals} icon={<HiTrophy className="text-amber-400" />} />
                <StatDisplay label="Assists" value={totals.assists} icon={<HiUserGroup className="text-emerald-400" />} />
                <StatDisplay
                  label="Trophies"
                  value={seasons.reduce((s, e) => s + e.trophies.length, 0)}
                  icon={<HiTrophy className="text-amber-400" />}
                />
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Timeline */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="timeline-line" />
                <div className="space-y-6">
                  {seasons.map((season, index) => (
                    <motion.div
                      key={season.season}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-14"
                    >
                      <div className="timeline-dot" />
                      <div
                        className={`glass rounded-xl p-5 ${season.events.some((e) => e.type === 'debut') ? 'gold-border' : ''}`}
                      >
                        {/* Season Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">{season.label}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: season.clubColors.primary }}
                              />
                              <span className="text-sm text-gray-300">{season.club}</span>
                              <span className="text-xs text-gray-600">&middot;</span>
                              <span className="text-sm text-gray-500">Pos {season.leaguePosition}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500 uppercase">Goals</p>
                            <p className="text-lg font-bold text-white">{season.goals}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500 uppercase">Assists</p>
                            <p className="text-lg font-bold text-white">{season.assists}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500 uppercase">Apps</p>
                            <p className="text-lg font-bold text-white">{season.appearances}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500 uppercase">Rating</p>
                            <p className="text-lg font-bold text-white">{season.avgRating}</p>
                          </div>
                        </div>

                        {/* Trophies */}
                        {season.trophies.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            {season.trophies.map((t, i) => (
                              <Badge key={i} variant="success" icon={<HiTrophy className="w-3 h-3" />}>
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Awards */}
                        {season.awards.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            {season.awards.map((a, i) => (
                              <Badge key={i} variant="info" icon={<HiStar className="w-3 h-3" />}>
                                {a}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Events */}
                        {season.events.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-800">
                            {season.events.map((event, i) => {
                              const cfg = eventConfig[event.type];
                              const Icon = cfg.icon;
                              return (
                                <div
                                  key={i}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
                                  style={{
                                    backgroundColor: `${cfg.color.replace('text-', '')}15`,
                                    borderColor: `${cfg.color.replace('text-', '')}30`,
                                  }}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  {cfg.badge}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 shrink-0 space-y-6">
              <Card header={<span className="text-lg font-bold text-white">Career Totals</span>}>
                <div className="space-y-4">
                  <StatDisplay label="Seasons Played" value={seasons.length} icon={<HiCalendarDays className="text-blue-400" />} />
                  <StatDisplay label="Total Goals" value={totals.goals} icon={<HiTrophy className="text-amber-400" />} />
                  <StatDisplay label="Total Assists" value={totals.assists} icon={<HiUserGroup className="text-emerald-400" />} />
                  <StatDisplay label="Total Appearances" value={totals.apps} icon={<HiFire className="text-orange-400" />} />
                  <StatDisplay label="Trophies Won" value={seasons.reduce((s, e) => s + e.trophies.length, 0)} icon={<HiTrophy className="text-amber-400" />} />
                </div>
              </Card>

              <Card header={<span className="text-lg font-bold text-white">Hall of Fame</span>}>
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className={`text-5xl ${hof.color}`}>
                    {hof.stars >= 1 && <HiStar className="inline" />}
                    {hof.stars >= 2 && <HiStar className="inline" />}
                    {hof.stars >= 3 && <HiStar className="inline" />}
                    {hof.stars >= 4 && <HiStar className="inline" />}
                    {hof.stars >= 5 && <HiStar className="inline" />}
                  </div>
                  <span className={`text-xl font-black ${hof.color}`}>{hof.label}</span>
                  <p className="text-xs text-gray-500 text-center">
                    Based on career longevity, goals, assists, trophies, and appearances.
                  </p>
                </div>
              </Card>

              <Card header={<span className="text-lg font-bold text-white">Player Info</span>}>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Position</span>
                    <span className="text-white font-medium">{player.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age</span>
                    <span className="text-white font-medium">{player.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Overall</span>
                    <span className="text-white font-medium">{player.ovr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Club</span>
                    <span className="text-white font-medium">{currentClub?.name ?? 'None'}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
