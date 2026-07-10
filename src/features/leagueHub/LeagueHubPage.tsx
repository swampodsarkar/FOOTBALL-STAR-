import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiTrophy,
  HiChartBar,
  HiCalendarDays,
  HiCheckBadge,
  HiUserGroup,
  HiFlag,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  getLeagueTopScorers,
  getLeagueTopAssists,
  getLeagueTopRatings,
  getLeagueTopCleanSheets,
} from '../../simulation/worldSimulator';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageTransition from '../../components/layout/PageTransition';
import type { LeagueTableEntry } from '../../types';

type Tab = 'Table' | 'Fixtures' | 'Results' | 'Stats';

const tabs: Tab[] = ['Table', 'Fixtures', 'Results', 'Stats'];

const zoneColors: Record<string, string> = {
  champions: 'border-l-4 border-l-sky-500',
  europa: 'border-l-4 border-l-emerald-500',
  relegation: 'border-l-4 border-l-rose-500',
  midtable: 'border-l-4 border-l-transparent',
};

function getZoneClass(index: number, total: number): string {
  if (index < 4) return zoneColors.champions;
  if (index < 6) return zoneColors.europa;
  if (index >= total - 3) return zoneColors.relegation;
  return zoneColors.midtable;
}

function FormDot({ result }: { result: string }) {
  const color =
    result === 'W'
      ? 'bg-emerald-500'
      : result === 'D'
        ? 'bg-amber-500'
        : 'bg-rose-500';
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
  );
}

export default function LeagueHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Table');
  const currentClub = useGameStore((s) => s.currentClub);
  const currentSeason = useGameStore((s) => s.currentSeason);
  const player = useGameStore((s) => s.player);
  const seasonWeek = useGameStore((s) => s.seasonWeek);

  const activeLeague = useSimulationStore((s) => s.activeLeague);
  const isWorldLoading = useSimulationStore((s) => s.isWorldLoading);
  const leagueTables = useSimulationStore((s) => s.leagueTables);

  const selectedLeague = activeLeague;

  const leagueName = selectedLeague?.name ?? 'Unknown League';
  const country = selectedLeague?.country ?? '';
  const table: LeagueTableEntry[] = leagueTables[leagueName] ?? [];
  const fixtures = selectedLeague?.fixtures ?? [];

  const playerClubId = currentClub?.id ?? '';
  const playerClubName = currentClub?.name ?? '';

  const upcomingFixtures = useMemo(
    () =>
      [...fixtures]
        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
        .slice(0, 12),
    [fixtures]
  );

  const playerFixtures = useMemo(
    () =>
      [...fixtures]
        .filter(
          (f) =>
            f.homeTeam.name === playerClubName || f.awayTeam.name === playerClubName
        )
        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
        .slice(0, 6),
    [fixtures, playerClubName]
  );

  const topScorers = useMemo(
    () => (selectedLeague ? getLeagueTopScorers(selectedLeague, 5) : []),
    [selectedLeague]
  );
  const topAssists = useMemo(
    () => (selectedLeague ? getLeagueTopAssists(selectedLeague, 5) : []),
    [selectedLeague]
  );
  const topRatings = useMemo(
    () => (selectedLeague ? getLeagueTopRatings(selectedLeague, 5) : []),
    [selectedLeague]
  );
  const topCleanSheets = useMemo(
    () => (selectedLeague ? getLeagueTopCleanSheets(selectedLeague, 5) : []),
    [selectedLeague]
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/25">
              <HiTrophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{leagueName}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiFlag className="w-4 h-4" />
                <span>{country}</span>
                <span className="text-gray-600">&middot;</span>
                <span>Season {currentSeason}</span>
                <span className="text-gray-600">&middot;</span>
                <span>Week {seasonWeek}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isWorldLoading && (
          <div className="text-sm text-gray-500 text-center py-4">
            Loading league world…
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'Table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto"
            >
              <Card className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-xs">
                        <th className="px-3 py-3 text-left">Pos</th>
                        <th className="px-3 py-3 text-left">Club</th>
                        <th className="px-3 py-3 text-center">P</th>
                        <th className="px-3 py-3 text-center">W</th>
                        <th className="px-3 py-3 text-center">D</th>
                        <th className="px-3 py-3 text-center">L</th>
                        <th className="px-3 py-3 text-center">GF</th>
                        <th className="px-3 py-3 text-center">GA</th>
                        <th className="px-3 py-3 text-center">GD</th>
                        <th className="px-3 py-3 text-center">Pts</th>
                        <th className="px-3 py-3 text-center">Form</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.map((entry, index) => {
                        const isPlayerClub = entry.clubId === playerClubId;
                        return (
                          <motion.tr
                            key={entry.clubId}
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border-b border-gray-800/50 transition-colors ${
                              isPlayerClub
                                ? 'bg-indigo-600/10 border-indigo-500/30'
                                : 'hover:bg-white/5'
                            } ${getZoneClass(index, table.length)}`}
                          >
                            <td className="px-3 py-3 font-bold text-white">
                              {index + 1}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-semibold ${
                                    isPlayerClub
                                      ? 'text-indigo-300'
                                      : 'text-white'
                                  }`}
                                >
                                  {entry.clubName}
                                </span>
                                {isPlayerClub && (
                                  <HiCheckBadge className="w-4 h-4 text-indigo-400 shrink-0" />
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center text-gray-300">
                              {entry.played}
                            </td>
                            <td className="px-3 py-3 text-center text-emerald-400">
                              {entry.won}
                            </td>
                            <td className="px-3 py-3 text-center text-amber-400">
                              {entry.drawn}
                            </td>
                            <td className="px-3 py-3 text-center text-rose-400">
                              {entry.lost}
                            </td>
                            <td className="px-3 py-3 text-center text-gray-300">
                              {entry.goalsFor}
                            </td>
                            <td className="px-3 py-3 text-center text-gray-300">
                              {entry.goalsAgainst}
                            </td>
                            <td className="px-3 py-3 text-center font-mono font-semibold">
                              <span
                                className={
                                  entry.goalsFor - entry.goalsAgainst > 0
                                    ? 'text-emerald-400'
                                    : entry.goalsFor - entry.goalsAgainst < 0
                                      ? 'text-rose-400'
                                      : 'text-gray-400'
                                }
                              >
                                {entry.goalsFor - entry.goalsAgainst > 0
                                  ? '+'
                                  : ''}
                                {entry.goalsFor - entry.goalsAgainst}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center font-bold text-white">
                              {entry.points}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {(entry.form ?? []).map((r, i) => (
                                  <FormDot key={i} result={r} />
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-gray-800 flex flex-wrap gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-1 rounded bg-sky-500" />
                    <span>Champions League</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-1 rounded bg-emerald-500" />
                    <span>Europa League</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-1 rounded bg-rose-500" />
                    <span>Relegation</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'Fixtures' && (
            <motion.div
              key="fixtures"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {playerFixtures.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Your Club
                  </h3>
                  {playerFixtures.map((f, weekOffset) => {
                    const isHome = f.homeTeam.name === playerClubName;
                    return (
                      <motion.div
                        key={`player-${f.id}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: weekOffset * 0.05 }}
                      >
                        <Card className="border-l-4 border-l-indigo-500 bg-indigo-600/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500 uppercase">
                                  MD{f.matchday ?? '?'}
                                </span>
                                <HiCalendarDays className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`font-semibold ${
                                    isHome ? 'text-white' : 'text-gray-300'
                                  }`}
                                >
                                  {f.homeTeam.name}
                                </span>
                                <span className="text-xs text-gray-600">vs</span>
                                <span
                                  className={`font-semibold ${
                                    !isHome ? 'text-white' : 'text-gray-300'
                                  }`}
                                >
                                  {f.awayTeam.name}
                                </span>
                              </div>
                            </div>
                            <Badge variant="info">{isHome ? 'Home' : 'Away'}</Badge>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Upcoming ({leagueName})
                </h3>
                {upcomingFixtures.length === 0 && (
                  <Card>
                    <p className="text-gray-500 text-sm text-center py-4">
                      No upcoming fixtures
                    </p>
                  </Card>
                )}
                {upcomingFixtures.map((f, i) => {
                  const involvesPlayer =
                    f.homeTeam.name === playerClubName ||
                    f.awayTeam.name === playerClubName;
                  return (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card
                        className={`border-l-4 ${
                          involvesPlayer
                            ? 'border-l-indigo-500 bg-indigo-600/5'
                            : 'border-l-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs text-gray-500 uppercase">
                                MD{f.matchday ?? '?'}
                              </span>
                              <HiCalendarDays className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-semibold ${
                                  f.homeTeam.name === playerClubName
                                    ? 'text-indigo-300'
                                    : 'text-white'
                                }`}
                              >
                                {f.homeTeam.name}
                              </span>
                              <span className="text-xs text-gray-600">vs</span>
                              <span
                                className={`font-semibold ${
                                  f.awayTeam.name === playerClubName
                                    ? 'text-indigo-300'
                                    : 'text-white'
                                }`}
                              >
                                {f.awayTeam.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'Results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {player?.matchHistory
                .slice()
                .reverse()
                .slice(0, 10)
                .map((match, i) => {
                  const isWin = match.result === 'Win';
                  const isDraw = match.result === 'Draw';
                  return (
                    <motion.div
                      key={`${match.week}-${match.opponent}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card
                        className={`border-l-4 ${
                          isWin
                            ? 'border-l-emerald-500'
                            : isDraw
                              ? 'border-l-amber-500'
                              : 'border-l-rose-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <HiCalendarDays className="w-3 h-3" />
                              <span>
                                S{match.season} W{match.week}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {currentClub?.name ?? 'Your Club'}
                              </span>
                              <span className="text-xs text-gray-600">vs</span>
                              <span className="text-sm text-gray-300">
                                {match.opponent}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-white">
                              {match.goals} - {match.assists}
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {match.goals > 0 && (
                                <span className="text-emerald-400 mr-2">
                                  {match.goals} goal{match.goals > 1 ? 's' : ''}
                                </span>
                              )}
                              {match.assists > 0 && (
                                <span className="text-sky-400">
                                  {match.assists} assist
                                  {match.assists > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <Badge
                            variant={
                              isWin
                                ? 'success'
                                : isDraw
                                  ? 'warning'
                                  : 'error'
                            }
                          >
                            {match.result}
                          </Badge>
                          <span className="text-gray-500">
                            Rating: {match.rating.toFixed(1)}
                          </span>
                          {match.manOfTheMatch && (
                            <Badge variant="info">MOTM</Badge>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              {(player?.matchHistory.length ?? 0) === 0 && (
                <div className="col-span-2">
                  <Card>
                    <p className="text-gray-500 text-sm text-center py-4">
                      No matches played yet
                    </p>
                  </Card>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'Stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <HiTrophy className="w-5 h-5 text-amber-400" />
                    <span className="text-lg font-bold text-white">
                      Top Scorers
                    </span>
                  </div>
                }
              >
                <div className="space-y-2">
                  {topScorers.length === 0 && (
                    <p className="text-sm text-gray-500 py-2">
                      No data available
                    </p>
                  )}
                  {topScorers.map((scorer, i) => (
                    <div
                      key={`${scorer.name}-${i}`}
                      className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-white">{scorer.name}</span>
                        <span className="text-xs text-gray-500">
                          ({scorer.club})
                        </span>
                      </div>
                      <span className="text-sm font-bold text-amber-400">
                        {scorer.goals}
                      </span>
                    </div>
                  ))}
                  {player && player.seasonGoals > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-800/50 bg-indigo-600/10 px-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <HiCheckBadge className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-300">
                          {player.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-indigo-400">
                        {player.seasonGoals}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card
                header={
                  <div className="flex items-center gap-2">
                    <HiUserGroup className="w-5 h-5 text-sky-400" />
                    <span className="text-lg font-bold text-white">
                      Top Assists
                    </span>
                  </div>
                }
              >
                <div className="space-y-2">
                  {topAssists.length === 0 && (
                    <p className="text-sm text-gray-500 py-2">
                      No data available
                    </p>
                  )}
                  {topAssists.map((p, i) => (
                    <div
                      key={`${p.name}-${i}`}
                      className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-white">{p.name}</span>
                        <span className="text-xs text-gray-500">({p.club})</span>
                      </div>
                      <span className="text-sm font-bold text-sky-400">
                        {p.assists}
                      </span>
                    </div>
                  ))}
                  {player && player.seasonAssists > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-800/50 bg-indigo-600/10 px-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <HiCheckBadge className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-300">
                          {player.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-indigo-400">
                        {player.seasonAssists}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card
                header={
                  <div className="flex items-center gap-2">
                    <HiChartBar className="w-5 h-5 text-emerald-400" />
                    <span className="text-lg font-bold text-white">
                      Clean Sheets
                    </span>
                  </div>
                }
              >
                <div className="space-y-2">
                  {topCleanSheets.length === 0 && (
                    <p className="text-sm text-gray-500 py-2">
                      No data available
                    </p>
                  )}
                  {topCleanSheets.map((p, i) => (
                    <div
                      key={`${p.name}-${i}`}
                      className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-white">{p.name}</span>
                        <span className="text-xs text-gray-500">({p.club})</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">
                        {p.cleanSheets}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card
                header={
                  <div className="flex items-center gap-2">
                    <HiTrophy className="w-5 h-5 text-purple-400" />
                    <span className="text-lg font-bold text-white">
                      Average Ratings
                    </span>
                  </div>
                }
              >
                <div className="space-y-2">
                  {topRatings.length === 0 && (
                    <p className="text-sm text-gray-500 py-2">
                      No data available
                    </p>
                  )}
                  {topRatings.map((p, i) => (
                    <div
                      key={`${p.name}-${i}`}
                      className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-white">{p.name}</span>
                        <span className="text-xs text-gray-500">({p.club})</span>
                      </div>
                      <span className="text-sm font-bold text-purple-400">
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  {player && player.matchHistory.length > 0 && (
                    <div className="flex items-center justify-between py-2 bg-indigo-600/10 px-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <HiCheckBadge className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-300">
                          {player.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-indigo-400">
                        {(
                          player.matchHistory.reduce(
                            (s, m) => s + m.rating,
                            0
                          ) / player.matchHistory.length
                        ).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
