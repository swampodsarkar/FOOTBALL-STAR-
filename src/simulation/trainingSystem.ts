import type { Player, PlayerAttributes, TrainingDrill } from '../types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

interface DrillBenefit {
  attributes: (keyof PlayerAttributes)[];
  baseGain: [number, number];
  energyCostPerMin: number;
  description: string;
}

const DRILL_BENEFITS: Record<TrainingDrill, DrillBenefit> = {
  Sprint: {
    attributes: ['pace', 'acceleration', 'stamina'],
    baseGain: [1, 3],
    energyCostPerMin: 3.5,
    description: 'Improves pace, acceleration, and stamina',
  },
  Passing: {
    attributes: ['passing', 'vision', 'crossing'],
    baseGain: [1, 3],
    energyCostPerMin: 2.0,
    description: 'Improves passing, vision, and crossing',
  },
  Shooting: {
    attributes: ['finishing', 'shotPower', 'longShots'],
    baseGain: [1, 3],
    energyCostPerMin: 2.5,
    description: 'Improves finishing, shot power, and long shots',
  },
  Defending: {
    attributes: ['defensiveAwareness', 'standingTackle', 'slidingTackle'],
    baseGain: [1, 3],
    energyCostPerMin: 2.5,
    description: 'Improves defensive awareness and tackling',
  },
  Dribbling: {
    attributes: ['dribbling', 'ballControl', 'agility'],
    baseGain: [1, 3],
    energyCostPerMin: 2.5,
    description: 'Improves dribbling, ball control, and agility',
  },
  Fitness: {
    attributes: ['stamina', 'strength'],
    baseGain: [2, 4],
    energyCostPerMin: 4.0,
    description: 'Improves stamina and strength',
  },
  Recovery: {
    attributes: [],
    baseGain: [0, 0],
    energyCostPerMin: 0.5,
    description: 'Restores energy and reduces injury risk',
  },
};

function getAttributeValue(attrs: PlayerAttributes, key: keyof PlayerAttributes): number {
  return (attrs[key] as number) || 0;
}

function setAttributeValue(attrs: PlayerAttributes, key: keyof PlayerAttributes, value: number): void {
  (attrs as any)[key] = clamp(value, 1, 99);
}

export function calculateTrainingXP(drill: TrainingDrill, playerAttributes: PlayerAttributes, intensity: number): number {
  const benefit = DRILL_BENEFITS[drill];
  const avgAttr = benefit.attributes.length > 0
    ? benefit.attributes.reduce((sum, attr) => sum + getAttributeValue(playerAttributes, attr), 0) / benefit.attributes.length
    : 50;

  const baseXP = benefit.attributes.length > 0 ? randInt(15, 30) : randInt(5, 10);
  const intensityMultiplier = 0.5 + intensity * 0.1;
  const attrBonus = Math.max(0, (99 - avgAttr) * 0.5);
  const xp = Math.round(baseXP * intensityMultiplier + attrBonus);

  return clamp(xp, 1, 100);
}

export function applyTrainingResults(player: Player, drill: TrainingDrill, duration: number): Player {
  const benefit = DRILL_BENEFITS[drill];
  const updatedAttrs = { ...player.attributes };
  const updatedPhysical = { ...player.physical };
  const energyCost = calculateEnergyCost(drill, duration);

  if (drill === 'Recovery') {
    updatedPhysical.energy = clamp(updatedPhysical.energy + duration * 2.5, 0, 100);
    updatedPhysical.fatigue = clamp(updatedPhysical.fatigue - duration * 2, 0, 100);
    updatedPhysical.injuryRisk = clamp(updatedPhysical.injuryRisk - duration * 0.3, 0, 100);
    updatedPhysical.recovery = clamp(updatedPhysical.recovery + duration * 1.5, 0, 100);
  } else {
    for (const attr of benefit.attributes) {
      const gain = randInt(benefit.baseGain[0], benefit.baseGain[1]);
      const currentVal = getAttributeValue(updatedAttrs, attr);
      setAttributeValue(updatedAttrs, attr, currentVal + gain);
    }

    updatedPhysical.energy = clamp(updatedPhysical.energy - energyCost, 0, 100);
    updatedPhysical.fatigue = clamp(updatedPhysical.fatigue + energyCost * 0.3, 0, 100);
    updatedPhysical.sharpness = clamp(updatedPhysical.sharpness + 2, 0, 100);
  }

  return {
    ...player,
    attributes: updatedAttrs,
    physical: updatedPhysical,
  };
}

export function getDrillBenefits(drill: TrainingDrill): { attributes: (keyof PlayerAttributes)[]; description: string } {
  const benefit = DRILL_BENEFITS[drill];
  return {
    attributes: benefit.attributes,
    description: benefit.description,
  };
}

export function calculateEnergyCost(drill: TrainingDrill, duration: number): number {
  const benefit = DRILL_BENEFITS[drill];
  return Math.round(benefit.energyCostPerMin * duration);
}

export function calculateRecoveryBenefits(duration: number): {
  energyRestored: number;
  fatigueReduced: number;
  injuryRiskReduced: number;
} {
  return {
    energyRestored: Math.round(duration * 2.5),
    fatigueReduced: Math.round(duration * 2),
    injuryRiskReduced: Math.round(duration * 0.3),
  };
}
