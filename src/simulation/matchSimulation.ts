import type { Player, Club, QTEType } from '../types';

export function playerRelevantAttribute(player: Player, qteType: QTEType | string): number {
  const a = player.attributes;
  switch (qteType) {
    case 'Finish':
    case 'Volley':
    case 'Header':
    case 'Penalty':
      return a.finishing;
    case 'ThroughPass':
    case 'Cross':
      return a.passing;
    case 'LongShot':
      return a.longShots;
    case 'Tackle':
    case 'SlidingBlock':
    case 'Interception':
      return a.standingTackle;
    case 'GoalkeeperSave':
      return a.gkReflexes ?? 50;
    default:
      return a.finishing;
  }
}

export function squadAverage(club: Club): number {
  if (!club.aiSquad || club.aiSquad.length === 0) return club.rating || 70;
  return club.aiSquad.reduce((s, p) => s + p.ovr, 0) / club.aiSquad.length;
}

export function playerTeamStrength(player: Player, club: Club): number {
  const base = squadAverage(club);
  return Math.round(base * 0.88 + player.ovr * 0.12);
}

export function opponentStrengthFromClub(opponent: Club | undefined, fallbackName: string): number {
  if (opponent) return Math.round(squadAverage(opponent));
  let h = 0;
  for (let i = 0; i < fallbackName.length; i++) {
    h = (h * 31 + fallbackName.charCodeAt(i)) >>> 0;
  }
  return 70 + (h % 20);
}

export function playerTeamWinProbability(playerStrength: number, opponentStrength: number): number {
  return 1 / (1 + Math.pow(10, (opponentStrength - playerStrength) / 25));
}

export interface QTESkillOutcome {
  didScore: boolean;
  ratingBoost: number;
  momentumBoost: number;
}

export function resolveQTESkill(
  timingResult: 'Perfect' | 'Great' | 'Good' | 'Late' | 'Miss',
  skill: number,
  difficulty: number
): QTESkillOutcome {
  const base: Record<typeof timingResult, { goalChance: number; rating: number; momentum: number }> = {
    Perfect: { goalChance: 1, rating: 0.5, momentum: 10 },
    Great: { goalChance: 0.92, rating: 0.3, momentum: 7 },
    Good: { goalChance: 0.45, rating: 0.1, momentum: 3 },
    Late: { goalChance: 0.12, rating: -0.1, momentum: -3 },
    Miss: { goalChance: 0.02, rating: -0.2, momentum: -5 },
  };

  const b = base[timingResult];
  const skillAdj = (skill - 70) / 60;
  const diffPenalty = (difficulty - 5) / 25;
  const goalChance = Math.max(0, Math.min(1, b.goalChance + skillAdj * 0.4 - diffPenalty * 0.3));
  const didScore = Math.random() < goalChance;

  const ratingBoost = b.rating + skillAdj * 0.25;
  const momentumBoost = b.momentum + Math.round(skillAdj * 6);

  return { didScore, ratingBoost, momentumBoost };
}
