import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiAcademicCap,
  HiHeart,
  HiExclamationTriangle,
  HiArrowLeft,
  HiCheckCircle,
  HiClock,
  HiMoon,
  HiBeaker,
  HiShieldCheck,
  HiFire,
  HiCalendarDays,
  HiWrenchScrewdriver,
  HiBanknotes,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import PageTransition from '../../components/layout/PageTransition';
import {
  getInjuryDescription,
  recoverInjury,
} from '../../simulation/injurySystem';
import type { InjuryBodyPart, InjuryType } from '../../types';

interface TreatmentOption {
  id: 'rest' | 'rehab' | 'surgery';
  label: string;
  icon: React.JSX.Element;
  description: string;
  recoveryReduction: number;
  cost: number;
  availableFor: InjuryType[];
  color: string;
}

const TREATMENT_OPTIONS: TreatmentOption[] = [
  {
    id: 'rest',
    label: 'Rest',
    icon: <HiClock className="w-5 h-5" />,
    description: 'Standard recovery with no additional cost.',
    recoveryReduction: 1,
    cost: 0,
    availableFor: ['Minor', 'Moderate', 'Severe', 'Critical'],
    color: 'text-blue-400',
  },
  {
    id: 'rehab',
    label: 'Rehabilitation',
    icon: <HiBeaker className="w-5 h-5" />,
    description: 'Accelerated recovery with professional rehab.',
    recoveryReduction: 2,
    cost: 5000,
    availableFor: ['Minor', 'Moderate', 'Severe'],
    color: 'text-emerald-400',
  },
  {
    id: 'surgery',
    label: 'Surgery',
    icon: <HiWrenchScrewdriver className="w-5 h-5" />,
    description: 'Drastically reduces recovery for severe injuries.',
    recoveryReduction: 4,
    cost: 25000,
    availableFor: ['Severe', 'Critical'],
    color: 'text-purple-400',
  },
];

const MOCK_INJURY_HISTORY: { date: string; type: InjuryType; bodyPart: InjuryBodyPart; weeksOut: number }[] = [];

function getRiskLevel(value: number): { label: string; color: string } {
  if (value <= 30) return { label: 'Low', color: 'text-emerald-400' };
  if (value <= 60) return { label: 'Moderate', color: 'text-amber-400' };
  return { label: 'High', color: 'text-rose-400' };
}

function formatDate(season: number, week: number): string {
  return `S${season} W${week}`;
}

export default function InjuryPage() {
  const player = useGameStore((s) => s.player);
  const currentSeason = useGameStore((s) => s.currentSeason);
  const seasonWeek = useGameStore((s) => s.seasonWeek);
  const { goTo } = usePhaseNavigation();
  const updatePlayer = useGameStore((s) => s.updatePlayer);

  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [injuryHistory] = useState(MOCK_INJURY_HISTORY);

  if (!player) return null;

  const isInjured = player.injury !== null && player.injury.weeksRemaining > 0;
  const injury = player.injury;
  const riskInfo = getRiskLevel(player.physical.injuryRisk);
  const fatigueInfo = getRiskLevel(player.physical.fatigue);
  const fitnessRisk = player.physical.fitness < 40 ? 'High' : player.physical.fitness < 70 ? 'Moderate' : 'Low';

  const handleTreatment = (optionId: string) => {
    if (!isInjured || !injury) return;
    const option = TREATMENT_OPTIONS.find((o) => o.id === optionId);
    if (!option) return;

    if (player.bankBalance < option.cost) return;

    const weeksToReduce = option.recoveryReduction;
    const updatedPlayer = recoverInjury(player, weeksToReduce);

    updatePlayer({
      injury: updatedPlayer.injury,
      bankBalance: player.bankBalance - option.cost,
    });

    setSelectedTreatment(null);
  };

  const weeksCompleted = injury
    ? Math.max(0, 0)
    : 0;
  const totalWeeks = injury
    ? injury.weeksRemaining + weeksCompleted
    : 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goTo('home')}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
              >
                <HiArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Medical Center
                </h1>
                <p className="text-sm text-gray-500">Injury status and recovery management</p>
              </div>
            </div>
            <Badge
              variant={isInjured ? 'error' : 'success'}
              icon={isInjured ? <HiExclamationTriangle className="w-3.5 h-3.5" /> : <HiCheckCircle className="w-3.5 h-3.5" />}
            >
              {isInjured ? 'Injured' : 'Fit & Ready'}
            </Badge>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {isInjured && injury ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card
                      header={
                        <div className="flex items-center gap-2">
                          <HiExclamationTriangle className="w-5 h-5 text-rose-400" />
                          <span className="text-lg font-bold text-white">Current Injury</span>
                        </div>
                      }
                      className="border-rose-500/30"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white">{injury.bodyPart}</p>
                            <Badge variant="error" className="mt-1">{injury.type}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Severity</p>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 4 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-6 rounded-full ${
                                    i < (injury.type === 'Minor' ? 1 : injury.type === 'Moderate' ? 2 : injury.type === 'Severe' ? 3 : 4)
                                      ? 'bg-rose-500'
                                      : 'bg-gray-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400">
                          {getInjuryDescription(injury)}
                        </p>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Recovery Progress</span>
                            <span className="text-white font-semibold">
                              {weeksCompleted} / {totalWeeks} weeks
                            </span>
                          </div>
                          <ProgressBar
                            value={totalWeeks > 0 ? (weeksCompleted / totalWeeks) * 100 : 0}
                            color="red"
                            size="lg"
                          />
                          <p className="text-xs text-rose-400 font-semibold">
                            {injury.weeksRemaining} week{injury.weeksRemaining !== 1 ? 's' : ''} remaining
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <Card header={<span className="text-lg font-bold text-white">Treatment Options</span>}>
                    <div className="space-y-3">
                      {TREATMENT_OPTIONS.filter((opt) => opt.availableFor.includes(injury.type)).map(
                        (option) => {
                          const isSelected = selectedTreatment === option.id;
                          const cantAfford = player.bankBalance < option.cost;
                          return (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <button
                                onClick={() =>
                                  setSelectedTreatment(
                                    isSelected ? null : option.id
                                  )
                                }
                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-500/10'
                                    : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={option.color}>{option.icon}</div>
                                    <div>
                                      <p className="text-sm font-bold text-white">{option.label}</p>
                                      <p className="text-xs text-gray-500">{option.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase">Reduction</p>
                                    <p className="text-sm font-bold text-emerald-400">
                                      -{option.recoveryReduction} week{option.recoveryReduction > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-3 pt-3 border-t border-gray-800"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm text-gray-400">Cost</span>
                                      <span className={`text-sm font-bold ${cantAfford ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {option.cost === 0 ? 'Free' : `$${option.cost.toLocaleString()}`}
                                      </span>
                                    </div>
                                    <Button
                                      variant="primary"
                                      size="md"
                                      className="w-full"
                                      disabled={cantAfford}
                                      onClick={() => handleTreatment(option.id)}
                                    >
                                      {cantAfford ? 'Insufficient Funds' : `Apply ${option.label}`}
                                    </Button>
                                  </motion.div>
                                )}
                              </button>
                            </motion.div>
                          );
                        }
                      )}
                    </div>
                  </Card>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card
                    header={
                      <div className="flex items-center gap-2">
                        <HiCheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-lg font-bold text-white">Fit & Ready</span>
                      </div>
                    }
                    className="border-emerald-500/30"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <HiHeart className="w-8 h-8 text-emerald-400" />
                        <div>
                          <p className="text-sm font-bold text-white">No injuries reported</p>
                          <p className="text-xs text-gray-500">You are fully fit and available for selection.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                          <p className="text-xs text-gray-500 uppercase">Energy</p>
                          <p className="text-lg font-bold text-white mt-1">{Math.round(player.physical.energy)}%</p>
                          <ProgressBar value={player.physical.energy} color="yellow" size="sm" className="mt-2" />
                        </div>
                        <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                          <p className="text-xs text-gray-500 uppercase">Fitness</p>
                          <p className="text-lg font-bold text-white mt-1">{Math.round(player.physical.fitness)}</p>
                          <ProgressBar value={player.physical.fitness} color="green" size="sm" className="mt-2" />
                        </div>
                      </div>

                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Injury Risk</span>
                          <span className={`text-sm font-bold ${riskInfo.color}`}>
                            {riskInfo.label} ({Math.round(player.physical.injuryRisk)}%)
                          </span>
                        </div>
                        <ProgressBar value={player.physical.injuryRisk} color="red" size="sm" className="mt-2" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              <Card header={<span className="text-lg font-bold text-white">Injury Risk Factors</span>}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HiFire className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-gray-400">Fatigue Level</span>
                    </div>
                    <span className={`text-sm font-bold ${fatigueInfo.color}`}>
                      {fatigueInfo.label} ({Math.round(player.physical.fatigue)}%)
                    </span>
                  </div>
                  <ProgressBar value={player.physical.fatigue} color="yellow" size="sm" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HiHeart className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-gray-400">Fitness Level</span>
                    </div>
                    <span className={`text-sm font-bold ${fitnessRisk === 'High' ? 'text-rose-400' : fitnessRisk === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {fitnessRisk} ({Math.round(player.physical.fitness)})
                    </span>
                  </div>
                  <ProgressBar value={player.physical.fitness} color="green" size="sm" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HiCalendarDays className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm text-gray-400">Match Frequency</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {player.seasonAppearances} matches this season
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <HiAcademicCap className="w-5 h-5 text-indigo-400" />
                    <span className="text-lg font-bold text-white">Injury History</span>
                  </div>
                }
              >
                {injuryHistory.length === 0 && !isInjured ? (
                  <div className="text-center py-8">
                    <HiShieldCheck className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                    <p className="text-gray-500">No injury history recorded.</p>
                    <p className="text-xs text-gray-600 mt-1">Your clean streak continues!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {isInjured && (
                      <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                        <HiExclamationTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-white">
                            {injury?.bodyPart} - {injury?.type}
                          </p>
                          <p className="text-xs text-rose-400/70">
                            Current &middot; {formatDate(currentSeason, seasonWeek)}
                          </p>
                        </div>
                      </div>
                    )}
                    {injuryHistory.map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-800"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {entry.bodyPart} - {entry.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {entry.date} &middot; {entry.weeksOut} week{entry.weeksOut !== 1 ? 's' : ''} out
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card header={<span className="text-lg font-bold text-white">Prevention Tips</span>}>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <HiBeaker className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-gray-400">
                      Maintain fitness above <span className="text-white font-semibold">70%</span> to reduce injury risk.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiMoon className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-gray-400">
                      Rest when fatigue exceeds <span className="text-white font-semibold">70%</span> to avoid muscle strains.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiCalendarDays className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-gray-400">
                      Avoid intense training before matches to maintain <span className="text-white font-semibold">peak sharpness</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiBanknotes className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-gray-400">
                      Invest in <span className="text-white font-semibold">rehabilitation</span> for faster recovery from injuries.
                    </p>
                  </div>
                </div>
              </Card>

              <Card header={<span className="text-lg font-bold text-white">Medical Stats</span>}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Overall Condition</span>
                    <span className="text-sm font-bold text-white">
                      {Math.round((player.physical.energy + player.physical.fitness + (player.physical.sharpness ?? 50)) / 3)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Recovery Rate</span>
                    <span className="text-sm font-bold text-emerald-400">{Math.round(player.physical.recovery ?? 50)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Morale</span>
                    <span className="text-sm font-bold text-white">{Math.round(player.morale)}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => goTo('home')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
}
