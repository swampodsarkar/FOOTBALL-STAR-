import type { Player, PlayerAttributes, Position, Difficulty, PhysicalState } from '../types';

let idCounter = 0;
function generateId(): string {
  return `player-${Date.now()}-${++idCounter}-${Math.random().toString(36).substring(2, 8)}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, val)));
}

const positionAttributeRanges: Record<Position, {
  pace: [number, number]; acceleration: [number, number]; sprintSpeed: [number, number];
  finishing: [number, number]; shotPower: [number, number]; longShots: [number, number];
  passing: [number, number]; vision: [number, number]; crossing: [number, number];
  dribbling: [number, number]; ballControl: [number, number]; agility: [number, number]; balance: [number, number];
  heading: [number, number]; strength: [number, number]; jumping: [number, number]; stamina: [number, number];
  defensiveAwareness: [number, number]; standingTackle: [number, number]; slidingTackle: [number, number];
  gkDiving?: [number, number]; gkHandling?: [number, number]; gkKicking?: [number, number];
  gkReflexes?: [number, number]; gkPositioning?: [number, number];
}> = {
  GK: {
    pace: [30, 50], acceleration: [30, 50], sprintSpeed: [30, 50],
    finishing: [15, 30], shotPower: [15, 35], longShots: [15, 30],
    passing: [40, 60], vision: [40, 60], crossing: [20, 40],
    dribbling: [20, 40], ballControl: [35, 55], agility: [40, 60], balance: [40, 60],
    heading: [30, 50], strength: [40, 60], jumping: [50, 70], stamina: [35, 55],
    defensiveAwareness: [40, 60], standingTackle: [20, 40], slidingTackle: [15, 35],
    gkDiving: [70, 88], gkHandling: [70, 86], gkKicking: [65, 85], gkReflexes: [72, 90], gkPositioning: [70, 88],
  },
  CB: {
    pace: [55, 72], acceleration: [55, 72], sprintSpeed: [55, 72],
    finishing: [30, 50], shotPower: [40, 60], longShots: [30, 50],
    passing: [50, 68], vision: [48, 65], crossing: [35, 55],
    dribbling: [40, 58], ballControl: [48, 65], agility: [45, 60], balance: [55, 75],
    heading: [65, 85], strength: [68, 85], jumping: [65, 82], stamina: [55, 72],
    defensiveAwareness: [65, 85], standingTackle: [65, 85], slidingTackle: [60, 80],
  },
  LB: {
    pace: [65, 82], acceleration: [65, 82], sprintSpeed: [65, 82],
    finishing: [35, 55], shotPower: [40, 60], longShots: [35, 55],
    passing: [58, 75], vision: [55, 72], crossing: [62, 80],
    dribbling: [58, 75], ballControl: [58, 75], agility: [60, 78], balance: [58, 75],
    heading: [50, 68], strength: [50, 68], jumping: [55, 72], stamina: [60, 78],
    defensiveAwareness: [60, 78], standingTackle: [60, 78], slidingTackle: [55, 72],
  },
  RB: {
    pace: [65, 82], acceleration: [65, 82], sprintSpeed: [65, 82],
    finishing: [35, 55], shotPower: [40, 60], longShots: [35, 55],
    passing: [58, 75], vision: [55, 72], crossing: [62, 80],
    dribbling: [58, 75], ballControl: [58, 75], agility: [60, 78], balance: [58, 75],
    heading: [50, 68], strength: [50, 68], jumping: [55, 72], stamina: [60, 78],
    defensiveAwareness: [60, 78], standingTackle: [60, 78], slidingTackle: [55, 72],
  },
  CDM: {
    pace: [55, 72], acceleration: [55, 72], sprintSpeed: [55, 72],
    finishing: [40, 58], shotPower: [50, 68], longShots: [45, 65],
    passing: [58, 76], vision: [58, 75], crossing: [50, 68],
    dribbling: [55, 72], ballControl: [58, 75], agility: [55, 70], balance: [60, 78],
    heading: [55, 75], strength: [62, 80], jumping: [58, 75], stamina: [65, 82],
    defensiveAwareness: [62, 80], standingTackle: [62, 80], slidingTackle: [55, 72],
  },
  CM: {
    pace: [55, 72], acceleration: [55, 72], sprintSpeed: [55, 72],
    finishing: [48, 68], shotPower: [52, 72], longShots: [52, 72],
    passing: [62, 80], vision: [62, 80], crossing: [50, 68],
    dribbling: [58, 76], ballControl: [62, 80], agility: [58, 75], balance: [60, 78],
    heading: [48, 65], strength: [55, 72], jumping: [52, 68], stamina: [60, 80],
    defensiveAwareness: [55, 72], standingTackle: [52, 70], slidingTackle: [48, 65],
  },
  CAM: {
    pace: [60, 78], acceleration: [60, 78], sprintSpeed: [60, 78],
    finishing: [55, 75], shotPower: [58, 78], longShots: [58, 78],
    passing: [65, 85], vision: [68, 85], crossing: [50, 68],
    dribbling: [65, 85], ballControl: [65, 85], agility: [65, 82], balance: [58, 75],
    heading: [40, 58], strength: [48, 65], jumping: [45, 62], stamina: [55, 72],
    defensiveAwareness: [40, 58], standingTackle: [35, 55], slidingTackle: [30, 50],
  },
  LM: {
    pace: [65, 82], acceleration: [65, 82], sprintSpeed: [65, 82],
    finishing: [50, 68], shotPower: [52, 72], longShots: [50, 70],
    passing: [60, 78], vision: [58, 76], crossing: [62, 80],
    dribbling: [62, 80], ballControl: [62, 80], agility: [62, 80], balance: [58, 75],
    heading: [40, 58], strength: [48, 65], jumping: [48, 65], stamina: [60, 78],
    defensiveAwareness: [48, 65], standingTackle: [45, 62], slidingTackle: [40, 58],
  },
  RM: {
    pace: [65, 82], acceleration: [65, 82], sprintSpeed: [65, 82],
    finishing: [50, 68], shotPower: [52, 72], longShots: [50, 70],
    passing: [60, 78], vision: [58, 76], crossing: [62, 80],
    dribbling: [62, 80], ballControl: [62, 80], agility: [62, 80], balance: [58, 75],
    heading: [40, 58], strength: [48, 65], jumping: [48, 65], stamina: [60, 78],
    defensiveAwareness: [48, 65], standingTackle: [45, 62], slidingTackle: [40, 58],
  },
  LW: {
    pace: [68, 85], acceleration: [68, 85], sprintSpeed: [68, 85],
    finishing: [58, 78], shotPower: [55, 75], longShots: [55, 75],
    passing: [62, 80], vision: [60, 78], crossing: [62, 80],
    dribbling: [68, 85], ballControl: [65, 85], agility: [68, 85], balance: [58, 75],
    heading: [38, 55], strength: [45, 62], jumping: [45, 62], stamina: [55, 72],
    defensiveAwareness: [35, 52], standingTackle: [30, 50], slidingTackle: [28, 48],
  },
  RW: {
    pace: [68, 85], acceleration: [68, 85], sprintSpeed: [68, 85],
    finishing: [58, 78], shotPower: [55, 75], longShots: [55, 75],
    passing: [62, 80], vision: [60, 78], crossing: [62, 80],
    dribbling: [68, 85], ballControl: [65, 85], agility: [68, 85], balance: [58, 75],
    heading: [38, 55], strength: [45, 62], jumping: [45, 62], stamina: [55, 72],
    defensiveAwareness: [35, 52], standingTackle: [30, 50], slidingTackle: [28, 48],
  },
  ST: {
    pace: [60, 80], acceleration: [60, 80], sprintSpeed: [60, 80],
    finishing: [65, 88], shotPower: [65, 85], longShots: [55, 78],
    passing: [48, 68], vision: [50, 68], crossing: [40, 58],
    dribbling: [58, 78], ballControl: [60, 80], agility: [58, 78], balance: [58, 78],
    heading: [58, 80], strength: [60, 82], jumping: [58, 78], stamina: [50, 68],
    defensiveAwareness: [30, 48], standingTackle: [25, 45], slidingTackle: [22, 40],
  },
  CF: {
    pace: [62, 82], acceleration: [62, 82], sprintSpeed: [62, 82],
    finishing: [62, 85], shotPower: [62, 82], longShots: [58, 80],
    passing: [58, 78], vision: [60, 80], crossing: [48, 65],
    dribbling: [62, 82], ballControl: [65, 85], agility: [62, 82], balance: [58, 78],
    heading: [48, 68], strength: [55, 75], jumping: [52, 72], stamina: [52, 70],
    defensiveAwareness: [35, 52], standingTackle: [30, 50], slidingTackle: [28, 48],
  },
};

const difficultyOVRRange: Record<Difficulty, [number, number]> = {
  'Amateur': [72, 78],
  'Semi-Pro': [67, 73],
  'Professional': [62, 68],
  'World Class': [57, 63],
  'Legendary': [52, 58],
};

function generatePositionAttributes(position: Position): PlayerAttributes {
  const ranges = positionAttributeRanges[position];
  const attrs: PlayerAttributes = {
    pace: randInt(...ranges.pace),
    acceleration: randInt(...ranges.acceleration),
    sprintSpeed: randInt(...ranges.sprintSpeed),
    finishing: randInt(...ranges.finishing),
    shotPower: randInt(...ranges.shotPower),
    longShots: randInt(...ranges.longShots),
    passing: randInt(...ranges.passing),
    vision: randInt(...ranges.vision),
    crossing: randInt(...ranges.crossing),
    dribbling: randInt(...ranges.dribbling),
    ballControl: randInt(...ranges.ballControl),
    agility: randInt(...ranges.agility),
    balance: randInt(...ranges.balance),
    heading: randInt(...ranges.heading),
    strength: randInt(...ranges.strength),
    jumping: randInt(...ranges.jumping),
    stamina: randInt(...ranges.stamina),
    defensiveAwareness: randInt(...ranges.defensiveAwareness),
    standingTackle: randInt(...ranges.standingTackle),
    slidingTackle: randInt(...ranges.slidingTackle),
  };
  if (ranges.gkDiving) attrs.gkDiving = randInt(...ranges.gkDiving);
  if (ranges.gkHandling) attrs.gkHandling = randInt(...ranges.gkHandling);
  if (ranges.gkKicking) attrs.gkKicking = randInt(...ranges.gkKicking);
  if (ranges.gkReflexes) attrs.gkReflexes = randInt(...ranges.gkReflexes);
  if (ranges.gkPositioning) attrs.gkPositioning = randInt(...ranges.gkPositioning);
  return attrs;
}

function calculateOVR(attributes: PlayerAttributes, position: Position): number {
  const a = attributes;
  switch (position) {
    case 'GK': {
      const gkAvg = ((a.gkDiving || 50) + (a.gkHandling || 50) + (a.gkKicking || 50) + (a.gkReflexes || 50) + (a.gkPositioning || 50)) / 5;
      const physAvg = (a.pace + a.strength + a.jumping + a.stamina) / 4;
      const mentalAvg = (a.defensiveAwareness + a.vision) / 2;
      return Math.round(gkAvg * 0.6 + physAvg * 0.2 + mentalAvg * 0.2);
    }
    case 'CB': {
      const defAvg = (a.defensiveAwareness + a.standingTackle + a.slidingTackle + a.heading + a.strength) / 5;
      const physAvg = (a.pace + a.jumping + a.stamina) / 3;
      const techAvg = (a.passing + a.ballControl) / 2;
      return Math.round(defAvg * 0.5 + physAvg * 0.25 + techAvg * 0.25);
    }
    case 'LB':
    case 'RB': {
      const defAvg = (a.defensiveAwareness + a.standingTackle + a.slidingTackle) / 3;
      const attAvg = (a.pace + a.dribbling + a.crossing + a.passing) / 4;
      const physAvg = (a.stamina + a.strength) / 2;
      return Math.round(defAvg * 0.35 + attAvg * 0.4 + physAvg * 0.25);
    }
    case 'CDM': {
      const defAvg = (a.defensiveAwareness + a.standingTackle + a.slidingTackle + a.strength) / 4;
      const passAvg = (a.passing + a.vision) / 2;
      const physAvg = (a.stamina + a.pace) / 2;
      return Math.round(defAvg * 0.4 + passAvg * 0.3 + physAvg * 0.3);
    }
    case 'CM': {
      const passAvg = (a.passing + a.vision) / 2;
      const defAvg = (a.defensiveAwareness + a.standingTackle) / 2;
      const techAvg = (a.dribbling + a.ballControl + a.shotPower) / 3;
      const physAvg = (a.stamina + a.pace) / 2;
      return Math.round(passAvg * 0.3 + defAvg * 0.2 + techAvg * 0.3 + physAvg * 0.2);
    }
    case 'CAM': {
      const attAvg = (a.dribbling + a.ballControl + a.passing + a.vision) / 4;
      const shootAvg = (a.finishing + a.shotPower + a.longShots) / 3;
      const physAvg = (a.pace + a.agility) / 2;
      return Math.round(attAvg * 0.4 + shootAvg * 0.3 + physAvg * 0.3);
    }
    case 'LM':
    case 'RM': {
      const attAvg = (a.dribbling + a.crossing + a.passing) / 3;
      const paceAvg = (a.pace + a.acceleration + a.sprintSpeed) / 3;
      const defAvg = (a.defensiveAwareness + a.stamina) / 2;
      return Math.round(attAvg * 0.4 + paceAvg * 0.35 + defAvg * 0.25);
    }
    case 'LW':
    case 'RW': {
      const attAvg = (a.dribbling + a.ballControl + a.agility + a.passing) / 4;
      const shootAvg = (a.finishing + a.shotPower) / 2;
      const paceAvg = (a.pace + a.acceleration + a.sprintSpeed) / 3;
      return Math.round(attAvg * 0.4 + shootAvg * 0.3 + paceAvg * 0.3);
    }
    case 'ST': {
      const shootAvg = (a.finishing + a.shotPower + a.longShots) / 3;
      const physAvg = (a.pace + a.strength + a.heading + a.jumping) / 4;
      const techAvg = (a.dribbling + a.ballControl) / 2;
      return Math.round(shootAvg * 0.4 + physAvg * 0.3 + techAvg * 0.3);
    }
    case 'CF': {
      const shootAvg = (a.finishing + a.shotPower + a.longShots) / 3;
      const techAvg = (a.dribbling + a.ballControl + a.passing + a.vision) / 4;
      const physAvg = (a.pace + a.strength) / 2;
      return Math.round(shootAvg * 0.35 + techAvg * 0.35 + physAvg * 0.3);
    }
  }
}

export function generatePlayer(options: {
  name: string;
  age: number;
  nationality: string;
  preferredFoot: string;
  position: Position;
  height: number;
  weight: number;
  difficulty: Difficulty;
}): Player {
  const { name, age, nationality, preferredFoot, position, height, weight, difficulty } = options;
  const attrs = generatePositionAttributes(position);
  const baseAttrs = attrs;
  const rawOvr = calculateOVR(baseAttrs, position);
  const diffRange = difficultyOVRRange[difficulty];
  const targetOvr = randInt(diffRange[0], diffRange[1]);
  const ovrDiff = targetOvr - rawOvr;
  if (ovrDiff !== 0) {
    const keys = Object.keys(baseAttrs).filter(k => k !== 'gkDiving' && k !== 'gkHandling' && k !== 'gkKicking' && k !== 'gkReflexes' && k !== 'gkPositioning') as (keyof PlayerAttributes)[];
    for (let i = 0; i < Math.abs(ovrDiff) * 3; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const val = baseAttrs[key] as number;
      if (ovrDiff > 0 && val < 99) {
        (baseAttrs as any)[key] = val + 1;
      } else if (ovrDiff < 0 && val > 1) {
        (baseAttrs as any)[key] = val - 1;
      }
    }
    const gkKeys = ['gkDiving', 'gkHandling', 'gkKicking', 'gkReflexes', 'gkPositioning'] as (keyof PlayerAttributes)[];
    for (const k of gkKeys) {
      if (baseAttrs[k] !== undefined) {
        const v = baseAttrs[k] as number;
        const adjusted = clamp(v + Math.round(ovrDiff * 0.5), 1, 99);
        (baseAttrs as any)[k] = adjusted;
      }
    }
  }
  const finalOvr = calculateOVR(baseAttrs, position);
  const ovr = clamp(finalOvr, 1, 99);
  const marketValue = ovr * 50000 + randInt(5000, 500000);
  const weeklySalary = ovr * 200 + randInt(50, 2000);
  const physical: PhysicalState = {
    energy: randInt(80, 95),
    fitness: randInt(80, 95),
    sharpness: randInt(80, 95),
    fatigue: randInt(5, 20),
    recovery: randInt(80, 95),
    injuryRisk: randInt(1, 10),
  };

  return {
    id: generateId(),
    name,
    age,
    nationality,
    preferredFoot: preferredFoot as 'Left' | 'Right' | 'Both',
    position,
    height,
    weight,
    difficulty,
    club: null,
    ovr,
    attributes: baseAttrs,
    physical,
    injury: null,
    morale: 75,
    managerTrust: 50,
    confidence: 60,
    popularity: 20,
    form: 7,
    marketValue,
    weeklySalary,
    bankBalance: 50000,
    contractYears: 4,
    releaseClause: weeklySalary * 50,
    seasonGoals: 0,
    seasonAssists: 0,
    seasonAppearances: 0,
    careerGoals: 0,
    careerAssists: 0,
    careerAppearances: 0,
    totalXp: 0,
    level: 1,
    socialFollowers: 100,
    cars: [],
    houses: [],
    watches: [],
    businesses: [],
    awards: [],
    matchHistory: [],
    currentSeason: 1,
  };
}
