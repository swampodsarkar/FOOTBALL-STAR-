import type { Club, Fixture, League, LeagueName } from '../types';
import { createClubFromApiTeam } from '../data/leagues';

// All football-data.org calls go through the serverless proxy at /api/football
// (see api/football.js). This avoids CORS and keeps the API key off the client.
const BASE = '/api/football';

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

// Cache emblems so we never re-hit the API for the same league (rate-limit safe).
const emblemCache: Record<string, string> = {};

// Retry on 429 (rate limit) with backoff; football-data.org throttles free keys.
async function fdFetch<T>(path: string, retries = 4): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(`${BASE}${path}`);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      continue;
    }
    if (!res.ok) {
      lastErr = new Error(`football-data.org request failed: ${res.status} ${res.statusText}`);
      break;
    }
    return res.json() as Promise<T>;
  }
  throw lastErr instanceof Error ? lastErr : new Error('Request failed');
}

// Fetch real league logos (emblems) from football-data.org, one per league,
// with caching + rate-limit retries. Missing logos fall back to flags in the UI.
export async function getLeagueLogos(): Promise<Record<string, string>> {
  const logos: Record<string, string> = { ...emblemCache };
  for (const lg of SUPPORTED_LEAGUES) {
    if (emblemCache[lg.code]) continue;
    try {
      const data = await fdFetch<{ emblem?: string | null }>(`/v4/competitions/${lg.code}`);
      if (data.emblem) {
        emblemCache[lg.code] = data.emblem;
        logos[lg.code] = data.emblem;
      }
    } catch {
      // keep flag fallback; skip this league's logo
    }
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
  let emblem: string | undefined = emblemCache[code];
  if (!emblem) {
    try {
      const data = await fdFetch<{ emblem?: string | null }>(`/v4/competitions/${code}`);
      if (data.emblem) {
        emblemCache[code] = data.emblem;
        emblem = data.emblem;
      }
    } catch {
      /* keep undefined; UI/logo fallback handles it */
    }
  }
  return {
    name: meta.name,
    country: meta.country,
    reputation: 80,
    tier: 1,
    clubs,
    fixtures,
    emblem,
  };
}
