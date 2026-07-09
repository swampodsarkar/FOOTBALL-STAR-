import type { Club, Fixture, League, LeagueName } from '../types';
import { createClubFromApiTeam } from '../data/leagues';

// Hardcoded football-data.org key so the app works without any server/env setup.
// NOTE: a browser app cannot truly hide a key; this is exposed in the bundle.
const API_KEY = 'f501f01ef13346538118ac31dcb0d18c';
const BASE = 'https://api.football-data.org/v4';

export interface SupportedLeague {
  code: string;
  name: LeagueName;
  country: string;
  flag: string;
}

export const SUPPORTED_LEAGUES: SupportedLeague[] = [
  { code: 'PL', name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'PD', name: 'LaLiga', country: 'Spain', flag: '🇪🇸' },
  { code: 'SA', name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { code: 'BL1', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { code: 'FL1', name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
  { code: 'DED', name: 'Eredivisie', country: 'Netherlands', flag: '🇳🇱' },
  { code: 'PPL', name: 'Primeira Liga', country: 'Portugal', flag: '🇵🇹' },
  { code: 'BSA', name: 'Campeonato Brasileiro Série A', country: 'Brazil', flag: '🇧🇷' },
  { code: 'ELC', name: 'Championship', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'CL', name: 'Champions League', country: 'Europe', flag: '🇪🇺' },
  { code: 'EC', name: 'European Championship', country: 'Europe', flag: '🇪🇺' },
  { code: 'WC', name: 'FIFA World Cup', country: 'World', flag: '🌍' },
];

interface FdTeam {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

interface FdMatch {
  id: number;
  utcDate: string;
  matchday?: number | null;
  status: string;
  homeTeam: { id: number; name: string; crest?: string };
  awayTeam: { id: number; name: string; crest?: string };
  score?: { fullTime?: { home: number | null; away: number | null } };
}

async function fdFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
  });
  if (!res.ok) {
    throw new Error(`football-data.org request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Fetch real league logos (emblems) from football-data.org in a single call.
export async function getLeagueLogos(): Promise<Record<string, string>> {
  const data = await fdFetch<{ competitions: { code: string; emblem?: string | null }[] }>(
    '/v4/competitions'
  );
  const logos: Record<string, string> = {};
  for (const c of data.competitions) {
    if (c.code && c.emblem) logos[c.code] = c.emblem;
  }
  return logos;
}

export async function getTeams(code: string): Promise<Club[]> {
  const data = await fdFetch<{ teams: FdTeam[] }>(`/v4/competitions/${code}/teams`);
  const meta = SUPPORTED_LEAGUES.find((l) => l.code === code);
  if (!meta) throw new Error(`Unsupported competition: ${code}`);
  return data.teams.map((t, i) => createClubFromApiTeam(t, meta.name, i + 1));
}

export async function getFixtures(code: string): Promise<Fixture[]> {
  const data = await fdFetch<{ matches: FdMatch[] }>(`/v4/competitions/${code}/matches`);
  const meta = SUPPORTED_LEAGUES.find((l) => l.code === code);
  if (!meta) throw new Error(`Unsupported competition: ${code}`);

  const now = Date.now();
  return data.matches
    .filter(
      (m) =>
        m.status !== 'FINISHED' &&
        m.status !== 'CANCELLED' &&
        m.status !== 'POSTPONED' &&
        new Date(m.utcDate).getTime() >= now
    )
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .map((m) => ({
      id: m.id,
      matchday: m.matchday ?? null,
      utcDate: m.utcDate,
      competition: meta.name,
      homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, crest: m.homeTeam.crest },
      awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, crest: m.awayTeam.crest },
      status: m.status,
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
    }));
}

export async function buildRealLeague(code: string): Promise<League> {
  const meta = SUPPORTED_LEAGUES.find((l) => l.code === code);
  if (!meta) throw new Error(`Unsupported competition: ${code}`);
  const clubs = await getTeams(code);
  const fixtures = await getFixtures(code);
  return {
    name: meta.name,
    country: meta.country,
    reputation: 80,
    tier: 1,
    clubs,
    fixtures,
  };
}
