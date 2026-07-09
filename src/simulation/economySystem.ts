import type { Player, Club, MatchPerformance } from '../types';

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateMarketValue(player: Player): number {
  const ovrFactor = player.ovr * player.ovr * 950;
  const ageFactor = player.age <= 21 ? 1.4 : player.age <= 25 ? 1.2 : player.age <= 29 ? 1.0 : player.age <= 32 ? 0.7 : 0.4;
  const formFactor = 0.8 + (player.form - 5) * 0.06;
  const contractFactor = player.contractYears > 2 ? 1.1 : player.contractYears > 1 ? 1.0 : 0.8;
  const popularityFactor = 1.0 + player.popularity * 0.003;
  const reputationBonus = player.club ? player.club.reputation * 800 : 0;

  const baseValue = ovrFactor * ageFactor * formFactor * contractFactor * popularityFactor + reputationBonus;
  return Math.round(clamp(baseValue, 50000, 250000000));
}

export function calculateWeeklySalary(player: Player): number {
  const ovrBase = player.ovr * 350;
  const ageFactor = player.age <= 21 ? 0.7 : player.age <= 27 ? 1.0 : player.age <= 31 ? 0.9 : 0.7;
  const repMultiplier = player.club ? 0.8 + player.club.reputation * 0.01 : 1.0;
  const formBonus = (player.form - 5) * 200;

  const salary = (ovrBase * ageFactor * repMultiplier) + formBonus;
  return Math.round(clamp(salary, 500, 550000));
}

export function processWeeklySalary(player: Player): Player {
  const salary = calculateWeeklySalary(player);
  return {
    ...player,
    weeklySalary: salary,
    bankBalance: player.bankBalance + salary,
  };
}

export function processMatchBonus(player: Player, matchPerformance: MatchPerformance): Player {
  let bonus = 0;

  if (matchPerformance.manOfTheMatch) {
    bonus += 5000;
  }

  if (matchPerformance.goals > 0) {
    const goalBonus = matchPerformance.goals * 2000;
    bonus += goalBonus;
  }

  if (matchPerformance.assists > 0) {
    bonus += matchPerformance.assists * 1000;
  }

  const ratingBonus = Math.max(0, (matchPerformance.rating - 7.0) * 3000);
  bonus += Math.round(ratingBonus);

  switch (matchPerformance.result) {
    case 'Win': bonus += 3000; break;
    case 'Draw': bonus += 1000; break;
    case 'Loss': bonus += 0; break;
  }

  bonus += matchPerformance.minutesPlayed * 10;

  const playerBonus = Math.round(clamp(bonus, 0, 100000));
  return {
    ...player,
    bankBalance: player.bankBalance + playerBonus,
  };
}

export function calculateSponsorIncome(popularity: number, ovr: number): number {
  const popularityFactor = popularity * 120;
  const ovrFactor = ovr * ovr * 1.5;
  const monthly = Math.round(popularityFactor + ovrFactor);
  return clamp(monthly, 500, 200000);
}

export function calculateExpenses(bankBalance: number): number {
  const weeklyRate = 0.002;
  const base = Math.round(bankBalance * weeklyRate);
  const random = randInt(50, 300);
  return clamp(base + random, 50, 50000);
}

export function processTransfer(player: Player, newClub: Club, fee: number, signingBonus: number, newSalary: number, contractYears: number): Player {
  const releaseClause = newSalary * 50;

  return {
    ...player,
    club: newClub,
    marketValue: fee,
    weeklySalary: newSalary,
    bankBalance: player.bankBalance + signingBonus,
    contractYears,
    releaseClause,
  };
}

export function calculateReleaseClause(salary: number, reputation: number): number {
  const multiplier = 35 + reputation * 0.3;
  return Math.round(clamp(salary * multiplier, 50000, 300000000));
}
