import type { Player } from '../types';

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function lastNMatchesAvg(player: Player, n: number): number {
  const recent = player.matchHistory.slice(-n);
  if (recent.length === 0) return 0;
  return recent.reduce((s, m) => s + m.rating, 0) / recent.length;
}

export function calculateMarketValue(player: Player): number {
  const ovr = player.ovr;
  const age = player.age;
  const form = player.form;

  // Base value from OVR
  let baseValue = ovr * ovr * 950;

  // Age factor
  let ageFactor: number;
  if (age <= 16) ageFactor = 0.5;
  else if (age <= 22) ageFactor = 0.8 + (age - 16) * 0.1;
  else if (age <= 28) ageFactor = 1.4 - (age - 22) * 0.03;
  else if (age <= 32) ageFactor = 1.0 - (age - 28) * 0.08;
  else ageFactor = 0.6 - (age - 33) * 0.08;

  ageFactor = clamp(ageFactor, 0.2, 1.6);

  // Form factor from last 10 matches
  const avgRating = lastNMatchesAvg(player, 10);
  let formFactor = 1.0;
  if (avgRating >= 9.0) formFactor = 1.15;
  else if (avgRating >= 8.5) formFactor = 1.10;
  else if (avgRating >= 8.0) formFactor = 1.06;
  else if (avgRating >= 7.5) formFactor = 1.03;
  else if (avgRating < 6.0) formFactor = 0.90;
  else if (avgRating < 6.5) formFactor = 0.95;

  // Goals bonus (position-dependent)
  const seasonGoals = player.seasonGoals;
  const position = player.position;
  let goalsBonus = 1.0;
  if (position === 'ST' || position === 'CF') {
    if (seasonGoals >= 30) goalsBonus = 1.12;
    else if (seasonGoals >= 20) goalsBonus = 1.08;
    else if (seasonGoals >= 10) goalsBonus = 1.04;
  } else if (['LM', 'RM', 'LW', 'RW', 'CAM'].includes(position)) {
    if (player.seasonAssists >= 15) goalsBonus = 1.07;
    else if (player.seasonAssists >= 10) goalsBonus = 1.04;
  } else if (['CB', 'LB', 'RB', 'CDM'].includes(position)) {
    if (player.matchHistory.filter((m) => {
      const idx = player.matchHistory.indexOf(m);
      return idx >= 0 && m.goals === 0 && m.saves === 0;
    }).length >= 15) goalsBonus = 1.08;
  } else if (position === 'GK') {
    const cleanSheets = player.matchHistory.filter((m) => m.saves > 0 && m.goals === 0).length;
    if (cleanSheets >= 20) goalsBonus = 1.10;
  }

  // Injury factor
  let injuryFactor = 1.0;
  if (player.injury) {
    const weeks = player.injury.weeksRemaining;
    if (weeks >= 24) injuryFactor = 0.75;
    else if (weeks >= 16) injuryFactor = 0.85;
    else if (weeks >= 8) injuryFactor = 0.92;
    else if (weeks >= 4) injuryFactor = 0.97;

    // ACL check
    if (player.injury.description.toLowerCase().includes('acl') ||
        player.injury.bodyPart === 'Knee' && player.injury.type === 'Severe') {
      injuryFactor = 0.75;
    }
  }

  // Awards factor
  let awardsBonus = 1.0;
  for (const award of player.awards) {
    const a = award.toLowerCase();
    if (a.includes('ballon')) awardsBonus = 1.25;
    else if (a.includes('golden boot') || a.includes('golden')) awardsBonus = 1.10;
    else if (a.includes('player of the season') || a.includes('player of season')) awardsBonus = 1.12;
    else if (a.includes('young player')) awardsBonus = 1.08;
  }

  // Contract length factor
  let contractFactor = 1.0;
  if (player.contractYears > 2) contractFactor = 1.10;
  else if (player.contractYears > 1) contractFactor = 1.0;
  else contractFactor = 0.85;

  // Club reputation factor
  const clubFactor = player.club ? 1.0 + (player.club.reputation - 50) * 0.002 : 0.8;

  // Form effect on top
  const formEffect = 1.0 + (form - 50) * 0.002;

  const finalValue = baseValue * ageFactor * formFactor * goalsBonus * injuryFactor * awardsBonus * contractFactor * clubFactor * formEffect;

  return Math.round(clamp(finalValue, 50000, 300_000_000));
}
