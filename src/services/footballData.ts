import realData from '../data/realFootballData.json';
import type { Club, Fixture, League, LeagueName } from '../types';
import { createClubFromApiTeam } from '../data/leagues';

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

interface BakedTeam {
  id: number;
  name: string;
  shortName?: string | null;
  tla?: string | null;
  crest?: string | null;
}

interface BakedMatch {
  id: number;
  utcDate: string;
  matchday?: number | null;
  status: string;
  homeTeam: { id: number; name: string; crest?: string | null };
  awayTeam: { id: number; name: string; crest?: string | null };
  score?: { fullTime?: { home: number | null; away: number | null } } | null;
}

// Real football-data.org data baked in at build time (see scripts/fetchData.mjs).
// The deployed app makes NO runtime API calls — no CORS, no rate limits, no proxy.
interface BakedLeague {
  emblem: string | null;
  teams: BakedTeam[];
  matches: BakedMatch[];
}
const DATA = realData as Record<string, BakedLeague>;

// Real league logos (emblems) baked from football-data.org.
export async function getLeagueLogos(): Promise<Record<string, string>> {
  const logos: Record<string, string> = {};
  for (const lg of SUPPORTED_LEAGUES) {
    const emblem = DATA[lg.code]?.emblem;
    if (emblem) logos[lg.code] = emblem;
  }
  return logos;
}

export async function buildRealLeague(code: string): Promise<League> {
  const meta = SUPPORTED_LEAGUES.find((l) => l.code === code);
  if (!meta) throw new Error(`Unsupported competition: ${code}`);
  const data = DATA[code];
  if (!data) throw new Error(`No baked data for: ${code}`);

  const clubs: Club[] = data.teams.map((t, i) =>
    createClubFromApiTeam(
      {
        id: t.id,
        name: t.name,
        shortName: t.shortName ?? undefined,
        tla: t.tla ?? undefined,
        crest: t.crest ?? undefined,
      },
      meta.name,
      i + 1
    )
  );

  const now = Date.now();
  const fixtures: Fixture[] = data.matches
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
      homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, crest: m.homeTeam.crest ?? undefined },
      awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, crest: m.awayTeam.crest ?? undefined },
      status: m.status,
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
    }));

  return {
    name: meta.name,
    country: meta.country,
    reputation: 80,
    tier: 1,
    clubs,
    fixtures,
    emblem: data.emblem ?? undefined,
  };
}
