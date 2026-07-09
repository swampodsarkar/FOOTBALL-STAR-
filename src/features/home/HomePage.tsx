import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiStar,
  HiCurrencyDollar,
  HiBanknotes,
  HiTrophy,
  HiAcademicCap,
  HiTableCells,
  HiArrowLeftEndOnRectangle,
  HiGlobeAlt,
  HiFire,
  HiHeart,
  HiArrowTrendingUp,
  HiCalendarDays,
  HiChevronDown,
  HiUserGroup,
  HiBolt,
  HiMoon,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import PlayerCard from '../../components/ui/PlayerCard';
import Card from '../../components/ui/Card';
import StatDisplay from '../../components/ui/StatDisplay';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import PageTransition from '../../components/layout/PageTransition';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

function FormStars({ value }: { value: number }) {
  const stars = Math.round(value / 2);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <HiStar key={i} className={`w-4 h-4 ${i < stars ? 'text-amber-400' : 'text-gray-700'}`} />
      ))}
    </div>
  );
}

function MoraleIcon({ value }: { value: number }) {
  if (value >= 70) return <HiHeart className="w-5 h-5 text-emerald-400" />;
  if (value >= 40) return <HiHeart className="w-5 h-5 text-amber-400" />;
  return <HiHeart className="w-5 h-5 text-rose-400" />;
}

function Spinner() {
  return (
    <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
  );
}

export default function HomePage() {
  const player = useGameStore((s) => s.player);
  const currentClub = useGameStore((s) => s.currentClub);
  const nextMatch = useGameStore((s) => s.nextMatch);
  const currentSeason = useGameStore((s) => s.currentSeason);
  const seasonWeek = useGameStore((s) => s.seasonWeek);
  const inbox = useGameStore((s) => s.inbox);
  const advanceWeek = useGameStore((s) => s.advanceWeek);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const { goTo } = usePhaseNavigation();
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [prep, setPrep] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const handleAdvance = () => {
    if (advancing) return;
    setAdvancing(true);
    window.setTimeout(() => {
      advanceWeek();
      setAdvancing(false);
    }, 550);
  };

  if (!player || !currentClub) return null;

  const weeksUntilMatch = nextMatch ? Math.max(0, nextMatch.week - seasonWeek) : 0;

  const handlePrep = (type: 'rest' | 'train' | 'talk') => {
    if (!player) return;
    setPrep(type);
    if (type === 'rest') {
      updatePlayer({
        physical: { ...player.physical, energy: Math.min(100, player.physical.energy + 20) },
      });
    } else if (type === 'train') {
      updatePlayer({
        physical: {
          ...player.physical,
          energy: Math.max(0, player.physical.energy - 8),
          fitness: Math.min(100, player.physical.fitness + 4),
        },
      });
    } else if (type === 'talk') {
      updatePlayer({ morale: Math.min(100, player.morale + 8) });
    }
  };

  const recentNews = inbox.slice(0, 3);
  const avgRating = player.matchHistory.length > 0
    ? (player.matchHistory.reduce((s, m) => s + m.rating, 0) / player.matchHistory.length).toFixed(1)
    : 'N/A';
  const motmCount = player.matchHistory.filter((m) => m.manOfTheMatch).length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <PlayerCard
              compact
              name={player.name}
              ovr={player.ovr}
              position={player.position}
              club={currentClub.name}
              nationality={player.nationality}
              form={player.form}
              energy={player.physical.energy}
              fitness={player.physical.fitness}
              morale={player.morale}
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Current Form', value: <FormStars value={player.form} />, icon: <HiStar className="text-amber-400" /> },
              { label: 'Market Value', value: currencyFormatter.format(player.marketValue), icon: <HiCurrencyDollar className="text-emerald-400" /> },
              { label: 'Weekly Salary', value: currencyFormatter.format(player.weeklySalary), icon: <HiBanknotes className="text-sky-400" /> },
              { label: 'Bank Balance', value: currencyFormatter.format(player.bankBalance), icon: <HiBanknotes className="text-purple-400" /> },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Card>
                  <StatDisplay label={item.label} value={item.value} icon={item.icon} />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {nextMatch ? (
            weeksUntilMatch > 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
                <Card className="border-indigo-500/30 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HiCalendarDays className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-indigo-400 font-semibold uppercase tracking-wider">Next Match</span>
                      </div>
                      <Badge variant={nextMatch.isHome ? 'success' : 'warning'}>{nextMatch.isHome ? 'HOME' : 'AWAY'}</Badge>
                    </div>
                    <p className="text-3xl font-black text-white">vs {nextMatch.opponent}</p>
                    <p className="text-sm text-gray-400">{nextMatch.competition} &middot; Season {currentSeason} &middot; Week {nextMatch.week}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <HiArrowTrendingUp className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-gray-300">
                        {weeksUntilMatch} {weeksUntilMatch === 1 ? 'week' : 'weeks'} until match day
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdvance}
                    disabled={advancing}
                    className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-shadow disabled:opacity-80 flex items-center justify-center gap-2"
                  >
                    {advancing ? <Spinner /> : 'Advance ▸'}
                  </motion.button>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
                <Card className="border-amber-500/30 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HiTrophy className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-amber-400 font-semibold uppercase tracking-wider">Match Day</span>
                      </div>
                      <Badge variant={nextMatch.isHome ? 'success' : 'warning'}>{nextMatch.isHome ? 'HOME' : 'AWAY'}</Badge>
                    </div>
                    <p className="text-3xl font-black text-white">vs {nextMatch.opponent}</p>
                    <p className="text-sm text-gray-400">{nextMatch.competition} &middot; Season {currentSeason} &middot; Week {nextMatch.week}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider pt-1">Pre-Match Preparation</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'rest' as const, label: 'Rest Day', icon: <HiMoon className="w-5 h-5" />, desc: '+Energy' },
                        { key: 'train' as const, label: 'Light Train', icon: <HiBolt className="w-5 h-5" />, desc: '+Fitness' },
                        { key: 'talk' as const, label: 'Team Talk', icon: <HiHeart className="w-5 h-5" />, desc: '+Morale' },
                      ].map((opt) => (
                        <motion.button
                          key={opt.key}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handlePrep(opt.key)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${prep === opt.key ? 'border-amber-500 bg-amber-500/10' : 'border-gray-800 bg-gray-900 hover:border-gray-600'}`}
                        >
                          <span className="text-amber-400">{opt.icon}</span>
                          <span className="text-xs font-semibold text-white">{opt.label}</span>
                          <span className="text-[10px] text-gray-500">{opt.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                    {prep && (
                      <p className="text-xs text-emerald-400">
                        {prep === 'rest'
                          ? 'Rested and recovered — energy restored.'
                          : prep === 'train'
                            ? 'Sharpened up in light training — fitness up.'
                            : 'Fired up by the team talk — morale boosted.'}
                      </p>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => goTo('match')}
                    className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
                  >
                    Play Match &#9656;
                  </motion.button>
                </Card>
              </motion.div>
            )
          ) : (
            <Card className="h-full flex flex-col items-center justify-center text-center gap-3">
              <p className="text-gray-500 text-sm">No match scheduled yet.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdvance}
                disabled={advancing}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-shadow disabled:opacity-80 flex items-center justify-center gap-2"
              >
                {advancing ? <Spinner /> : 'Advance ▸'}
              </motion.button>
            </Card>
          )}
        </div>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card header={<span className="text-lg font-bold text-white">Your Season</span>}>
                <div className="grid grid-cols-2 gap-4">
                  <StatDisplay label="Goals" value={player.seasonGoals} icon={<HiTrophy className="text-amber-400" />} />
                  <StatDisplay label="Assists" value={player.seasonAssists} icon={<HiUserGroup className="text-green-400" />} />
                  <StatDisplay label="Appearances" value={player.seasonAppearances} icon={<HiCalendarDays className="text-blue-400" />} />
                  <StatDisplay label="Avg Rating" value={avgRating} icon={<HiStar className="text-purple-400" />} />
                  <div className="col-span-2">
                    <StatDisplay label="Man of the Match" value={motmCount} icon={<HiTrophy className="text-amber-400" />} />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card header={<span className="text-lg font-bold text-white">Latest News</span>}>
                <div className="space-y-2">
                  {recentNews.length === 0 && (
                    <p className="text-gray-500 text-sm">No news yet. Play matches to generate news.</p>
                  )}
                  {recentNews.map((item) => (
                    <div key={item.id}>
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => setExpandedNews(expandedNews === item.id ? null : item.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-2 py-2 border-b border-gray-800 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{item.headline}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Week {item.week}, Season {item.season}
                            </p>
                          </div>
                          <HiChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${expandedNews === item.id ? 'rotate-180' : ''}`} />
                        </div>
                      </motion.button>
                      <AnimatePresence>
                        {expandedNews === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-gray-400 px-2 pb-3">{item.body}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card header={<span className="text-lg font-bold text-white">Manager Trust</span>}>
              <div className="flex items-center gap-3">
                <HiArrowTrendingUp className="w-5 h-5 text-indigo-400 shrink-0" />
                <ProgressBar value={player.managerTrust} color="indigo" size="md" showValue />
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <div className="flex flex-col items-center gap-1">
                  <HiFire className="w-5 h-5 text-orange-400" />
                  <span className="text-xs text-gray-500 uppercase">Energy</span>
                  <span className="text-lg font-bold text-white">{Math.round(player.physical.energy)}%</span>
                  <ProgressBar value={player.physical.energy} color="yellow" size="sm" />
                </div>
              </Card>
              <Card>
                <div className="flex flex-col items-center gap-1">
                  <HiHeart className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs text-gray-500 uppercase">Fitness</span>
                  <span className="text-lg font-bold text-white">{Math.round(player.physical.fitness)}</span>
                  <ProgressBar value={player.physical.fitness} color="green" size="sm" />
                </div>
              </Card>
              <Card>
                <div className="flex flex-col items-center gap-1">
                  <MoraleIcon value={player.morale} />
                  <span className="text-xs text-gray-500 uppercase">Morale</span>
                  <span className="text-lg font-bold text-white">{Math.round(player.morale)}</span>
                  <ProgressBar value={player.morale} color={player.morale >= 70 ? 'green' : player.morale >= 40 ? 'yellow' : 'red'} size="sm" />
                </div>
              </Card>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Training', icon: <HiAcademicCap className="w-5 h-5" />, onClick: () => goTo('training') },
              { label: 'League Table', icon: <HiTableCells className="w-5 h-5" />, onClick: () => goTo('leagueHub') },
              { label: 'Transfer Hub', icon: <HiArrowLeftEndOnRectangle className="w-5 h-5" />, onClick: () => goTo('transfers') },
              { label: 'Social Media', icon: <HiGlobeAlt className="w-5 h-5" />, onClick: () => goTo('social') },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={item.onClick}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:border-gray-600 hover:text-white transition-colors"
              >
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
