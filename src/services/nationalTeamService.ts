import type { Player } from '../types';

export interface FIFAWindow {
  month: number;
  name: string;
}

export const FIFA_WINDOWS: FIFAWindow[] = [
  { month: 9, name: 'September' },
  { month: 10, name: 'October' },
  { month: 11, name: 'November' },
  { month: 3, name: 'March' },
  { month: 6, name: 'June' },
];

export function isFIFAWindow(seasonWeek: number): FIFAWindow | null {
  const weekToMonth: Record<number, number> = {};
  let week = 1;
  for (let month = 1; month <= 12; month++) {
    const days = month === 2 ? 28 : month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
    const weeksInMonth = Math.ceil(days / 7);
    for (let w = 0; w < weeksInMonth; w++) {
      weekToMonth[week] = month;
      week++;
      if (week > 52) break;
    }
    if (week > 52) break;
  }
  const month = weekToMonth[seasonWeek];
  if (!month) return null;
  return FIFA_WINDOWS.find((w) => w.month === month) ?? null;
}

export function calculateSelectionScore(player: Player): number {
  const ovrScore = (player.ovr / 99) * 40;
  const formScore = (player.form / 100) * 30;
  const recent = player.matchHistory.slice(-5);
  const avgRating = recent.length > 0
    ? recent.reduce((s, m) => s + m.rating, 0) / recent.length
    : 0;
  const ratingScore = (avgRating / 10) * 20;
  const fitnessScore = (player.physical.fitness / 100) * 10;
  return ovrScore + formScore + ratingScore + fitnessScore;
}

export type CallUpStatus = 'Called Up' | 'On Standby' | 'Not Called';

export function getCallUpStatus(score: number, player: Player): CallUpStatus {
  if (player.injury) return 'Not Called';
  if (score > 85) return 'Called Up';
  if (score >= 75) return 'Called Up';
  if (score >= 65) return 'On Standby';
  return 'Not Called';
}

export interface NationalTeamInfo {
  country: string;
  flag: string;
  worldRanking: number;
  manager: string;
  confederation: string;
}

export const NATIONAL_TEAMS: Record<string, NationalTeamInfo> = {
  'Brazil': { country: 'Brazil', flag: '🇧🇷', worldRanking: 3, manager: 'Fernando Diniz', confederation: 'CONMEBOL' },
  'Argentina': { country: 'Argentina', flag: '🇦🇷', worldRanking: 1, manager: 'Lionel Scaloni', confederation: 'CONMEBOL' },
  'France': { country: 'France', flag: '🇫🇷', worldRanking: 2, manager: 'Didier Deschamps', confederation: 'UEFA' },
  'England': { country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', worldRanking: 4, manager: 'Gareth Southgate', confederation: 'UEFA' },
  'Spain': { country: 'Spain', flag: '🇪🇸', worldRanking: 8, manager: 'Luis de la Fuente', confederation: 'UEFA' },
  'Germany': { country: 'Germany', flag: '🇩🇪', worldRanking: 9, manager: 'Julian Nagelsmann', confederation: 'UEFA' },
  'Italy': { country: 'Italy', flag: '🇮🇹', worldRanking: 10, manager: 'Luciano Spalletti', confederation: 'UEFA' },
  'Portugal': { country: 'Portugal', flag: '🇵🇹', worldRanking: 7, manager: 'Roberto Martínez', confederation: 'UEFA' },
  'Netherlands': { country: 'Netherlands', flag: '🇳🇱', worldRanking: 6, manager: 'Ronald Koeman', confederation: 'UEFA' },
  'Belgium': { country: 'Belgium', flag: '🇧🇪', worldRanking: 5, manager: 'Domenico Tedesco', confederation: 'UEFA' },
};

export const NATIONALITY_ALIASES: Record<string, string> = {
  'United Kingdom': 'England',
  'United States': 'USA',
  'South Korea': 'Korea Republic',
};

export function resolveNationality(nationality: string): string {
  return NATIONALITY_ALIASES[nationality] ?? nationality;
}
