import type { AIPlayer } from '../types';
import { NATIONAL_TEAMS } from './nationalTeamService';

export interface TournamentDef {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  eligibleConfederations: string[];
  seasonInterval: number;
  seasonOffset: number;
  startWeek: number;
  endWeek: number;
}

export interface TournamentMatch {
  round: 'Quarter-Final' | 'Semi-Final' | 'Final' | 'Group';
  group?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  played: boolean;
}

export interface TournamentBracket {
  tournament: TournamentDef;
  season: number;
  teams: string[];
  matches: TournamentMatch[];
  winner: string | null;
}

const TOURNAMENTS: TournamentDef[] = [
  { id: 'world_cup', name: 'FIFA World Cup', shortName: 'World Cup', icon: '🌍', eligibleConfederations: ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'], seasonInterval: 4, seasonOffset: 0, startWeek: 25, endWeek: 30 },
  { id: 'euros', name: 'UEFA European Championship', shortName: 'Euros', icon: '🇪🇺', eligibleConfederations: ['UEFA'], seasonInterval: 4, seasonOffset: 2, startWeek: 26, endWeek: 30 },
  { id: 'copa_america', name: 'Copa América', shortName: 'Copa América', icon: '🏆', eligibleConfederations: ['CONMEBOL'], seasonInterval: 4, seasonOffset: 2, startWeek: 26, endWeek: 30 },
];

export function getTournamentForSeason(season: number): TournamentDef | null {
  for (const t of TOURNAMENTS) {
    if (season >= t.seasonOffset && (season - t.seasonOffset) % t.seasonInterval === 0) {
      return t;
    }
  }
  return null;
}

export function isTournamentWindow(season: number, seasonWeek: number): TournamentDef | null {
  const t = getTournamentForSeason(season);
  if (!t) return null;
  if (seasonWeek >= t.startWeek && seasonWeek <= t.endWeek) return t;
  return null;
}

function getTeamStrengthFromNation(name: string): number {
  const nt = NATIONAL_TEAMS[name];
  if (!nt) return 70;
  return nt.ranking; // ranking 1-10 mapped to ~95-75 strength
}

function simulateTournamentMatch(homeTeam: string, awayTeam: string): { homeScore: number; awayScore: number } {
  const homeStr = getTeamStrengthFromNation(homeTeam) / 10;
  const awayStr = getTeamStrengthFromNation(awayTeam) / 10;
  const homeRate = Math.max(0.1, homeStr * 1.3 + 0.2);
  const awayRate = Math.max(0.1, awayStr * 1.0 + 0.1);

  let homeScore = 0, awayScore = 0;
  for (let i = 0; i < 5; i++) {
    if (Math.random() < homeRate / 4) homeScore++;
    if (Math.random() < awayRate / 4) awayScore++;
  }
  return { homeScore, awayScore };
}

function pickTopTeams(count: number): string[] {
  const sorted = Object.entries(NATIONAL_TEAMS).sort((a, b) => a[1].ranking - b[1].ranking);
  return sorted.slice(0, count).map(([name]) => name);
}

export function generateTournamentBracket(season: number, tournament: TournamentDef): TournamentBracket {
  const teams = pickTopTeams(8);
  const matches: TournamentMatch[] = [];

  for (let i = 0; i < 4; i++) {
    const home = teams[i * 2];
    const away = teams[i * 2 + 1];
    const result = simulateTournamentMatch(home, away);
    matches.push({ round: 'Quarter-Final', homeTeam: home, awayTeam: away, homeScore: result.homeScore, awayScore: result.awayScore, played: true });
  }

  const semiWinners: string[] = [];
  for (let i = 0; i < 4; i += 2) {
    const qf1 = matches[i];
    const qf2 = matches[i + 1];
    const winner1 = qf1.homeScore >= qf1.awayScore ? qf1.homeTeam : qf1.awayTeam;
    const winner2 = qf2.homeScore >= qf2.awayScore ? qf2.homeTeam : qf2.awayTeam;
    const result = simulateTournamentMatch(winner1, winner2);
    matches.push({ round: 'Semi-Final', homeTeam: winner1, awayTeam: winner2, homeScore: result.homeScore, awayScore: result.awayScore, played: true });
    semiWinners.push(result.homeScore >= result.awayScore ? winner1 : winner2);
  }

  const finalResult = simulateTournamentMatch(semiWinners[0], semiWinners[1]);
  matches.push({ round: 'Final', homeTeam: semiWinners[0], awayTeam: semiWinners[1], homeScore: finalResult.homeScore, awayScore: finalResult.awayScore, played: true });

  const winner = finalResult.homeScore >= finalResult.awayScore ? semiWinners[0] : semiWinners[1];

  return { tournament, season, teams, matches, winner };
}

export function generateTournamentNews(bracket: TournamentBracket, week: number, season: number): { headline: string; body: string }[] {
  const news: { headline: string; body: string }[] = [];
  const t = bracket.tournament;

  for (const match of bracket.matches) {
    if (match.played) {
      if (match.round === 'Final') {
        news.push({
          headline: `${match.homeTeam} win the ${t.name}!`,
          body: `${match.homeTeam} defeated ${match.awayTeam} ${match.homeScore}-${match.awayScore} in the final to claim the ${t.name} trophy.`,
        });
      } else {
        news.push({
          headline: `${t.shortName}: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`,
          body: `${match.homeTeam} faced ${match.awayTeam} in the ${match.round} of the ${t.name}.`,
        });
      }
    }
  }
  return news;
}
