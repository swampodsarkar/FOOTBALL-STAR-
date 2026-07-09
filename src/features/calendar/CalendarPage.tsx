import { useState, useMemo } from 'react';
import type { JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCalendar,
  HiFire,
  HiHeart,
  HiStar,
  HiBolt,
  HiMoon,
  HiBeaker,
  HiCheck,
  HiPlay,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import CalendarDay from '../../components/ui/CalendarDay';
import PageTransition from '../../components/layout/PageTransition';
import type { ActivityType } from '../../types';

interface ActivityOption {
  type: ActivityType;
  label: string;
  icon: JSX.Element;
  baseEnergyChange: number;
  baseXpGain: number;
  description: string;
  color: string;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { type: 'Training', label: 'Train', icon: <HiBolt className="w-5 h-5" />, baseEnergyChange: -20, baseXpGain: 50, description: 'Intensive session to improve attributes', color: 'emerald' },
  { type: 'Rest', label: 'Rest', icon: <HiMoon className="w-5 h-5" />, baseEnergyChange: 30, baseXpGain: 5, description: 'Light day to recover energy', color: 'blue' },
  { type: 'Recovery', label: 'Recovery', icon: <HiBeaker className="w-5 h-5" />, baseEnergyChange: 15, baseXpGain: 10, description: 'Focus on recovery and injury prevention', color: 'teal' },
];

const TOTAL_WEEKS = 52;

export default function CalendarPage() {
  const seasonWeek = useGameStore((s) => s.seasonWeek);
  const player = useGameStore((s) => s.player);
  const currentSeason = useGameStore((s) => s.currentSeason);
  const nextMatch = useGameStore((s) => s.nextMatch);
  const weeklyActivities = useGameStore((s) => s.weeklyActivities);
  const setWeeklyActivities = useGameStore((s) => s.setWeeklyActivities);
  const advanceWeek = useGameStore((s) => s.advanceWeek);

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [intensity, setIntensity] = useState(5);

  const activityMap = useMemo(() => {
    const map: Record<number, { type: ActivityType; completed: boolean }> = {};
    for (const a of weeklyActivities) {
      map[a.week] = { type: a.type as unknown as ActivityType, completed: a.completed };
    }
    return map;
  }, [weeklyActivities]);

  const weeks = useMemo(() => {
    const arr: { week: number; activity?: ActivityType; completed: boolean; isCurrent: boolean }[] = [];
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const stored = activityMap[w];
      arr.push({
        week: w,
        activity: stored?.type,
        completed: stored?.completed ?? false,
        isCurrent: w === seasonWeek,
      });
    }
    return arr;
  }, [activityMap, seasonWeek]);

  if (!player) return null;

  const isWeekPast = (week: number) => week < seasonWeek;
  const isWeekFuture = (week: number) => week > seasonWeek;
  const canSelectWeek = (week: number) => week === seasonWeek || (isWeekFuture(week) && !activityMap[week]?.completed);

  const handleWeekClick = (week: number) => {
    if (canSelectWeek(week)) {
      setSelectedWeek(week);
      const existing = activityMap[week];
      setSelectedActivity(existing?.type ?? null);
      if (week !== seasonWeek) setIntensity(5);
    }
  };

  const handleConfirmWeek = () => {
    if (!selectedWeek || !selectedActivity || !player) return;

    const option = ACTIVITY_OPTIONS.find((o) => o.type === selectedActivity);
    if (!option) return;

    const energyCost = selectedActivity === 'Training'
      ? Math.round(option.baseEnergyChange * (1 + (intensity - 5) * 0.1))
      : option.baseEnergyChange;
    const xpGain = selectedActivity === 'Training'
      ? Math.round(option.baseXpGain * (0.5 + intensity * 0.1))
      : option.baseXpGain;

    const existing = weeklyActivities.filter((a) => a.week !== selectedWeek);
    setWeeklyActivities([
      ...existing,
      {
        week: selectedWeek,
        type: selectedActivity as any,
        description: `${selectedActivity} (Intensity: ${selectedActivity === 'Training' ? intensity + '/10' : 'N/A'})`,
        completed: selectedWeek < seasonWeek ? true : selectedWeek === seasonWeek,
        results: {
          xpGained: xpGain,
          energyChange: energyCost,
        },
      },
    ]);

    if (selectedWeek === seasonWeek) {
      advanceWeek();
      setSelectedWeek(null);
      setSelectedActivity(null);
    }
  };

  const selectedWeekData = selectedWeek ? weeks[selectedWeek - 1] : null;
  const weeksUntilMatch = nextMatch
    ? Math.max(0, nextMatch.week - seasonWeek)
    : null;

  const weekRows: typeof weeks[] = [];
  for (let i = 0; i < weeks.length; i += 13) {
    weekRows.push(weeks.slice(i, i + 13));
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4"
          >
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Season {currentSeason} - Week {seasonWeek}
              </h1>
              {nextMatch && weeksUntilMatch !== null && (
                <p className="text-sm text-gray-500 mt-1">
                  Next Match: vs {nextMatch.opponent} - {weeksUntilMatch} {weeksUntilMatch === 1 ? 'week' : 'weeks'} away
                </p>
              )}
            </div>
            <Badge variant="info" icon={<HiCalendar className="w-3.5 h-3.5" />}>
              {nextMatch ? `${nextMatch.competition}` : 'Off Season'}
            </Badge>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card
                header={
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">Season Calendar</span>
                    <span className="text-xs text-gray-500">{seasonWeek}/{TOTAL_WEEKS}</span>
                  </div>
                }
              >
                <div className="space-y-2">
                  {weekRows.map((row, ri) => (
                    <div key={ri} className="flex items-center gap-2">
                      {row.map((w) => (
                        <CalendarDay
                          key={w.week}
                          day={w.week}
                          activity={w.activity}
                          isSelected={selectedWeek === w.week}
                          completed={w.completed}
                          onClick={() => handleWeekClick(w.week)}
                          className={`${isWeekPast(w.week) && !w.completed ? 'opacity-40' : ''}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </Card>

              <AnimatePresence mode="wait">
                {selectedWeek && selectedWeekData && (
                  <motion.div
                    key={selectedWeek}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card
                      header={
                        <span className="text-lg font-bold text-white">
                          Week {selectedWeek} - {selectedWeekData.isCurrent ? 'Plan Your Week' : selectedWeekData.completed ? 'Completed' : 'Plan Ahead'}
                        </span>
                      }
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {ACTIVITY_OPTIONS.map((option) => {
                            const isActive = selectedActivity === option.type;
                            return (
                              <motion.button
                                key={option.type}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedActivity(option.type)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                  isActive
                                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                                    : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                                }`}
                              >
                                <div className={`text-${option.color}-400`}>{option.icon}</div>
                                <span className="text-sm font-semibold text-white">{option.label}</span>
                                <span className="text-xs text-gray-500 text-center">{option.description}</span>
                              </motion.button>
                            );
                          })}
                        </div>

                        {selectedActivity === 'Training' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Intensity</span>
                              <span className="text-sm font-bold text-white">{intensity}/10</span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={10}
                              value={intensity}
                              onChange={(e) => setIntensity(Number(e.target.value))}
                              className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Light</span>
                              <span>Moderate</span>
                              <span>Intense</span>
                            </div>
                          </div>
                        )}

                        {selectedActivity && (() => {
                          const option = ACTIVITY_OPTIONS.find((o) => o.type === selectedActivity);
                          if (!option) return null;
                          const energyCost = selectedActivity === 'Training'
                            ? Math.round(option.baseEnergyChange * (1 + (intensity - 5) * 0.1))
                            : option.baseEnergyChange;
                          const xpGain = selectedActivity === 'Training'
                            ? Math.round(option.baseXpGain * (0.5 + intensity * 0.1))
                            : option.baseXpGain;
                          return (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900 rounded-lg border border-gray-800">
                              <div className="flex items-center gap-2">
                                <HiFire className="w-4 h-4 text-orange-400" />
                                <span className="text-sm text-gray-400">Energy: <span className={`font-semibold ${energyCost >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{energyCost >= 0 ? `+${energyCost}` : energyCost}</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <HiStar className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-gray-400">XP Gain: <span className="font-semibold text-amber-400">+{xpGain}</span></span>
                              </div>
                            </div>
                          );
                        })()}

                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full"
                          icon={<HiCheck className="w-5 h-5" />}
                          onClick={handleConfirmWeek}
                          disabled={!selectedActivity}
                        >
                          Confirm Week {selectedWeek}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              <Card header={<span className="text-lg font-bold text-white">Player Status</span>}>
                <div className="space-y-4">
                  <ProgressBar value={player.physical.energy} color="yellow" size="md" label="Energy" showValue />
                  <ProgressBar value={player.physical.fitness} color="green" size="md" label="Fitness" showValue />
                  <ProgressBar value={player.physical.sharpness ?? 50} color="purple" size="md" label="Sharpness" showValue />
                  {player.injury ? (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-rose-400">Injured: {player.injury.bodyPart}</p>
                      <p className="text-xs text-rose-400/70">{player.injury.weeksRemaining} weeks remaining</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <HiHeart className="w-4 h-4" />
                      <span>Fit to play</span>
                    </div>
                  )}
                  {nextMatch && weeksUntilMatch !== null && (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                      <p className="text-xs text-indigo-400 uppercase tracking-wider">Next Match</p>
                      <p className="text-sm font-semibold text-white">vs {nextMatch.opponent}</p>
                      <p className="text-xs text-gray-500">{weeksUntilMatch} {weeksUntilMatch === 1 ? 'week' : 'weeks'} away</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card header={<span className="text-lg font-bold text-white">Season Summary</span>}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Matches Played</span>
                    <span className="text-white font-semibold">{player.seasonAppearances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Goals</span>
                    <span className="text-white font-semibold">{player.seasonGoals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assists</span>
                    <span className="text-white font-semibold">{player.seasonAssists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Form</span>
                    <span className="text-white font-semibold">{player.form}/100</span>
                  </div>
                </div>
              </Card>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (selectedWeek !== null && selectedActivity) {
                    handleConfirmWeek();
                  }
                  advanceWeek();
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-shadow flex items-center justify-center gap-2"
              >
                <HiPlay className="w-5 h-5" />
                Simulate Week
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
