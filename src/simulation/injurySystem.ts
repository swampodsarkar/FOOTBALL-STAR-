import type { Injury, InjuryType, InjuryBodyPart, Player } from '../types';

let injuryIdCounter = 0;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const bodyPartsByActivity: Record<string, InjuryBodyPart[]> = {
  Sprint: ['Hamstring', 'Calf', 'Thigh'],
  Passing: ['Ankle', 'Groin'],
  Shooting: ['Ankle', 'Knee', 'Thigh'],
  Defending: ['Knee', 'Ankle', 'Shoulder'],
  Dribbling: ['Ankle', 'Groin', 'Calf'],
  Fitness: ['Back', 'Hamstring', 'Calf'],
  Match: ['Ankle', 'Knee', 'Hamstring', 'Groin', 'Calf', 'Thigh', 'Shoulder', 'Head'],
  Training: ['Ankle', 'Knee', 'Hamstring', 'Groin', 'Calf'],
  Travel: ['Back'],
};

const severityProb = [0.5, 0.3, 0.15, 0.05];

function getSeverity(): InjuryType {
  const roll = Math.random();
  if (roll < severityProb[0]) return 'Minor';
  if (roll < severityProb[0] + severityProb[1]) return 'Moderate';
  if (roll < severityProb[0] + severityProb[1] + severityProb[2]) return 'Severe';
  return 'Critical';
}

function weeksForSeverity(severity: InjuryType): number {
  switch (severity) {
    case 'Minor': return randInt(1, 2);
    case 'Moderate': return randInt(3, 6);
    case 'Severe': return randInt(7, 16);
    case 'Critical': return randInt(17, 40);
  }
}

function getBodyPart(activity: string, forcedPart?: InjuryBodyPart): InjuryBodyPart {
  if (forcedPart) return forcedPart;
  const parts = bodyPartsByActivity[activity] || bodyPartsByActivity.Match;
  return pick(parts);
}

export function generateInjury(severity?: number): Injury {
  const type = severity !== undefined
    ? (['Minor', 'Moderate', 'Severe', 'Critical'] as InjuryType[])[Math.min(severity, 3)]
    : getSeverity();
  const bodyPart = pick(bodyPartsByActivity.Match);
  const weeks = weeksForSeverity(type);
  const id = `injury-${++injuryIdCounter}-${Date.now()}`;

  return {
    id,
    type,
    bodyPart,
    weeksRemaining: weeks,
    description: getInjuryDescription({ id, type, bodyPart, weeksRemaining: weeks, description: '' }),
  };
}

export function applyInjuryRisk(player: Player, activity: string): Injury | null {
  if (player.injury) return null;

  const fatigue = player.physical.fatigue;
  const injuryRisk = player.physical.injuryRisk;

  let baseChance = 0;
  if (activity === 'Match') {
    baseChance = 0.05;
  } else if (activity === 'Training') {
    baseChance = 0.02;
  } else {
    baseChance = 0;
  }

  if (baseChance === 0) return null;

  const fatigueModifier = fatigue > 70 ? (fatigue - 70) * 0.002 : 0;
  const riskModifier = (injuryRisk - 5) * 0.005;
  const totalChance = baseChance + fatigueModifier + riskModifier;

  if (Math.random() < totalChance) {
    const severityRoll = Math.random();
    let type: InjuryType;
    if (severityRoll < 0.5) type = 'Minor';
    else if (severityRoll < 0.8) type = 'Moderate';
    else if (severityRoll < 0.95) type = 'Severe';
    else type = 'Critical';

    const bodyPart = getBodyPart(activity);
    const weeks = weeksForSeverity(type);
    const id = `injury-${++injuryIdCounter}-${Date.now()}`;
    const injury: Injury = {
      id,
      type,
      bodyPart,
      weeksRemaining: weeks,
      description: '',
    };
    injury.description = getInjuryDescription(injury);
    return injury;
  }

  return null;
}

export function recoverInjury(player: Player, weeksOfRest: number): Player {
  if (!player.injury) return player;

  return {
    ...player,
    injury: {
      ...player.injury,
      weeksRemaining: Math.max(0, player.injury.weeksRemaining - weeksOfRest),
    },
  };
}

export function getInjuryDescription(injury: Injury): string {
  const typeLabels: Record<InjuryType, string> = {
    Minor: 'Minor',
    Moderate: 'Grade 1',
    Severe: 'Grade 2',
    Critical: 'Grade 3',
  };

  const bodyLabels: Record<InjuryBodyPart, string> = {
    Ankle: 'ankle sprain',
    Knee: 'knee injury',
    Hamstring: 'hamstring strain',
    Groin: 'groin strain',
    Calf: 'calf strain',
    Thigh: 'thigh strain',
    Shoulder: 'shoulder injury',
    Back: 'back problem',
    Head: 'head injury',
  };

  const weeks = injury.weeksRemaining;
  const label = `${typeLabels[injury.type]} ${bodyLabels[injury.bodyPart]}`;
  return `${label} (${weeks} week${weeks !== 1 ? 's' : ''})`;
}
