import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiAcademicCap,
  HiArrowTrendingUp,
  HiHeart,
  HiFire,
  HiStar,
  HiCheck,
  HiArrowLeft,
  HiBolt,
  HiBeaker,
  HiShieldCheck,
  HiTrophy,
  HiVariable,
  HiSparkles,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import PageTransition from '../../components/layout/PageTransition';
import {
  calculateTrainingXP,
  calculateEnergyCost,
  applyTrainingResults,
  getDrillBenefits,
} from '../../simulation/trainingSystem';
import type { TrainingDrill, PlayerAttributes } from '../../types';

type Intensity = 'light' | 'normal' | 'intense';

interface DrillConfig {
  drill: TrainingDrill;
  icon: React.JSX.Element;
  color: string;
}

const DRILL_CONFIGS: DrillConfig[] = [
  { drill: 'Sprint', icon: <HiBolt className="w-6 h-6" />, color: 'text-amber-400' },
  { drill: 'Passing', icon: <HiVariable className="w-6 h-6" />, color: 'text-sky-400' },
  { drill: 'Shooting', icon: <HiTrophy className="w-6 h-6" />, color: 'text-rose-400' },
  { drill: 'Defending', icon: <HiShieldCheck className="w-6 h-6" />, color: 'text-emerald-400' },
  { drill: 'Dribbling', icon: <HiSparkles className="w-6 h-6" />, color: 'text-purple-400' },
  { drill: 'Fitness', icon: <HiHeart className="w-6 h-6" />, color: 'text-green-400' },
  { drill: 'Recovery', icon: <HiBeaker className="w-6 h-6" />, color: 'text-cyan-400' },
];

const INTENSITY_MULTIPLIERS: Record<Intensity, number> = {
  light: 0.5,
  normal: 1.0,
  intense: 1.5,
};

const INTENSITY_LABELS: Intensity[] = ['light', 'normal', 'intense'];

function formatAttrName(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, (s) => s.toUpperCase());
}

function computeOVR(attrs: PlayerAttributes): number {
  const outfieldKeys: (keyof PlayerAttributes)[] = [
    'pace', 'acceleration', 'sprintSpeed',
    'finishing', 'shotPower', 'longShots',
    'passing', 'vision', 'crossing',
    'dribbling', 'ballControl', 'agility', 'balance',
    'heading', 'strength', 'jumping', 'stamina',
    'defensiveAwareness', 'standingTackle', 'slidingTackle',
  ];
  const sum = outfieldKeys.reduce((a, k) => a + ((attrs[k] as number) || 0), 0);
  return Math.round(sum / outfieldKeys.length);
}

export default function TrainingPage() {
  const player = useGameStore((s) => s.player);
  const { goTo } = usePhaseNavigation();
  const updatePlayer = useGameStore((s) => s.updatePlayer);

  const [selectedDrill, setSelectedDrill] = useState<TrainingDrill | null>(null);
  const [intensity, setIntensity] = useState<Intensity>('normal');
  const [results, setResults] = useState<{
    xpGained: number;
    attributeChanges: Partial<PlayerAttributes>;
    energyChange: number;
    newOVR: number;
    oldOVR: number;
  } | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countUp, setCountUp] = useState(0);

  if (!player) return null;

  const duration = 60;
  const energyCost = selectedDrill ? calculateEnergyCost(selectedDrill, duration) : 0;
  const xpMin = selectedDrill ? calculateTrainingXP(selectedDrill, player.attributes, INTENSITY_MULTIPLIERS[intensity]) : 0;
  const xpMax = selectedDrill ? Math.round(xpMin * 1.4) : 0;
  const drillBenefits = selectedDrill ? getDrillBenefits(selectedDrill) : null;

  const handleStartTraining = () => {
    if (!selectedDrill || !player) return;
    const updatedPlayer = applyTrainingResults(player, selectedDrill, duration);
    const oldAttrs = { ...player.attributes };
    const newAttrs = updatedPlayer.attributes;
    const attrChanges: Partial<PlayerAttributes> = {};
    for (const key of Object.keys(newAttrs) as (keyof PlayerAttributes)[]) {
      const diff = (newAttrs[key] as number) - (oldAttrs[key] as number);
      if (diff !== 0) {
        (attrChanges as any)[key] = diff;
      }
    }
    const xpGained = calculateTrainingXP(selectedDrill, player.attributes, INTENSITY_MULTIPLIERS[intensity]);
    const oldOVR = computeOVR(oldAttrs);
    const newOVR = computeOVR(newAttrs);
    const energyChange = Math.round(updatedPlayer.physical.energy - player.physical.energy);

    setResults({
      xpGained,
      attributeChanges: attrChanges,
      energyChange,
      newOVR,
      oldOVR,
    });

    updatePlayer({
      attributes: newAttrs,
      physical: updatedPlayer.physical,
      totalXp: player.totalXp + xpGained,
    });

    setShowOverlay(true);
    setCountUp(0);
    let val = 0;
    const interval = setInterval(() => {
      val += Math.ceil(xpGained / 20);
      if (val >= xpGained) {
        val = xpGained;
        clearInterval(interval);
      }
      setCountUp(val);
    }, 50);
  };


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
                  Weekly Training
                </h1>
                <p className="text-sm text-gray-500">Select drills and improve your attributes</p>
              </div>
            </div>
            <Badge variant="info" icon={<HiAcademicCap className="w-3.5 h-3.5" />}>
              Week {player.currentSeason}
            </Badge>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <HiFire className="w-5 h-5 text-orange-400 shrink-0" />
                <div className="flex-1">
                  <ProgressBar value={player.physical.energy} color="yellow" size="md" label="Energy" showValue />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <HiHeart className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <ProgressBar value={player.physical.fitness} color="green" size="md" label="Fitness" showValue />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <HiArrowTrendingUp className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="flex-1">
                  <ProgressBar value={player.physical.sharpness ?? 50} color="purple" size="md" label="Sharpness" showValue />
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-4">Choose Drill</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              {DRILL_CONFIGS.map((cfg, i) => {
                const isSelected = selectedDrill === cfg.drill;
                const benefits = getDrillBenefits(cfg.drill);
                const isRecovery = cfg.drill === 'Recovery';
                return (
                  <motion.button
                    key={cfg.drill}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDrill(cfg.drill)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <div className={cfg.color}>{cfg.icon}</div>
                    <span className="text-sm font-bold text-white">{cfg.drill}</span>
                    <div className="text-[10px] text-gray-500 text-center leading-tight space-y-0.5">
                      {isRecovery ? (
                        <span>Restores energy</span>
                      ) : (
                        benefits.attributes.map((attr) => (
                          <div key={attr} className="text-gray-400">
                            {formatAttrName(attr)} <span className="text-emerald-400">+1-3</span>
                          </div>
                        ))
                      )}
                    </div>
                    {!isRecovery && (
                      <div className="text-[10px] text-gray-600 flex items-center gap-1 mt-1">
                        <HiFire className="w-3 h-3 text-orange-400/60" />
                        -{calculateEnergyCost(cfg.drill, duration)} energy
                      </div>
                    )}
                    {isRecovery && (
                      <div className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1">
                        <HiHeart className="w-3 h-3" />
                        +recovery
                      </div>
                    )}
                    <div className="text-[10px] text-amber-500">
                      XP: {isRecovery ? '5-10' : '15-30'}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {selectedDrill && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card
                header={
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                      {selectedDrill} Session
                    </span>
                    <Badge variant="info">{duration} min</Badge>
                  </div>
                }
              >
                <div className="space-y-4">
                  {drillBenefits && selectedDrill !== 'Recovery' && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Attributes Trained:</p>
                      <div className="flex flex-wrap gap-2">
                        {drillBenefits.attributes.map((attr) => (
                          <Badge key={attr} variant="success">
                            {formatAttrName(attr)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Intensity</span>
                      <span className="text-sm font-bold text-white capitalize">{intensity}</span>
                    </div>
                    <div className="flex gap-2">
                      {INTENSITY_LABELS.map((level) => (
                        <motion.button
                          key={level}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIntensity(level)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                            intensity === level
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Low XP, Low Cost</span>
                      <span>Balanced</span>
                      <span>High XP, High Cost</span>
                    </div>
                  </div>

                  {selectedDrill !== 'Recovery' && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-2">
                        <HiStar className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-gray-400">
                          XP Gain: <span className="font-semibold text-amber-400">{xpMin}-{xpMax}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiFire className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-gray-400">
                          Energy Cost: <span className="font-semibold text-rose-400">-{energyCost}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedDrill === 'Recovery' && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <p className="text-sm text-emerald-400 font-semibold">
                        Recovery Session - Restores energy and reduces fatigue
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    icon={<HiCheck className="w-5 h-5" />}
                    onClick={handleStartTraining}
                    disabled={player.physical.energy < energyCost && selectedDrill !== 'Recovery'}
                  >
                    Start Training
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

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

        <AnimatePresence>
          {showOverlay && results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-full max-w-md"
              >
                <Card className="border-indigo-500/40">
                  <div className="text-center space-y-5 py-2">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center">
                        <HiAcademicCap className="w-8 h-8 text-indigo-400" />
                      </div>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-white">Training Complete</p>
                      <p className="text-sm text-gray-500">{selectedDrill} - {intensity.charAt(0).toUpperCase() + intensity.slice(1)}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">XP Gained</p>
                      <motion.p
                        key={countUp}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-black text-amber-400"
                      >
                        +{countUp}
                      </motion.p>
                    </div>

                    {Object.keys(results.attributeChanges).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Attribute Improvements</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {Object.entries(results.attributeChanges).map(([attr, change]) => (
                            <motion.div
                              key={attr}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-lg"
                            >
                              <span className="text-sm text-emerald-400 font-semibold">
                                {formatAttrName(attr)} +{change as number}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase">Energy</p>
                        <p className={`text-lg font-bold ${results.energyChange < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {results.energyChange >= 0 ? '+' : ''}{results.energyChange}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase">OVR</p>
                        <p className={`text-lg font-bold ${results.newOVR !== results.oldOVR ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {results.newOVR !== results.oldOVR ? (
                            <span>{results.oldOVR} <HiArrowTrendingUp className="w-4 h-4 inline text-emerald-400" /> {results.newOVR}</span>
                          ) : (
                            <span>{results.oldOVR}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setShowOverlay(false);
                        setSelectedDrill(null);
                        setResults(null);
                      }}
                    >
                      Continue
                    </Button>
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
