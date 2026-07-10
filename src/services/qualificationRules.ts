import type { LeagueName } from '../types';

export type Zone =
  | 'Champions League'
  | 'Champions League Qualifier'
  | 'Europa League'
  | 'Conference League'
  | 'Midtable'
  | 'Relegation Playoff'
  | 'Relegation';

export interface LeagueQualification {
  leagueName: LeagueName;
  totalTeams: number;
  zones: { position: number; zone: Zone }[];
}

const RULES: Record<string, Omit<LeagueQualification, 'leagueName'>> = {
  'Premier League': {
    totalTeams: 20,
    zones: [
      { position: 1, zone: 'Champions League' },
      { position: 2, zone: 'Champions League' },
      { position: 3, zone: 'Champions League' },
      { position: 4, zone: 'Champions League' },
      { position: 5, zone: 'Europa League' },
      { position: 6, zone: 'Conference League' },
      { position: 18, zone: 'Relegation' },
      { position: 19, zone: 'Relegation' },
      { position: 20, zone: 'Relegation' },
    ],
  },
  'LaLiga': {
    totalTeams: 20,
    zones: [
      { position: 1, zone: 'Champions League' },
      { position: 2, zone: 'Champions League' },
      { position: 3, zone: 'Champions League' },
      { position: 4, zone: 'Champions League' },
      { position: 5, zone: 'Europa League' },
      { position: 6, zone: 'Conference League' },
      { position: 18, zone: 'Relegation' },
      { position: 19, zone: 'Relegation' },
      { position: 20, zone: 'Relegation' },
    ],
  },
  'Serie A': {
    totalTeams: 20,
    zones: [
      { position: 1, zone: 'Champions League' },
      { position: 2, zone: 'Champions League' },
      { position: 3, zone: 'Champions League' },
      { position: 4, zone: 'Champions League' },
      { position: 5, zone: 'Europa League' },
      { position: 6, zone: 'Conference League' },
      { position: 18, zone: 'Relegation' },
      { position: 19, zone: 'Relegation' },
      { position: 20, zone: 'Relegation' },
    ],
  },
  'Bundesliga': {
    totalTeams: 18,
    zones: [
      { position: 1, zone: 'Champions League' },
      { position: 2, zone: 'Champions League' },
      { position: 3, zone: 'Champions League' },
      { position: 4, zone: 'Champions League' },
      { position: 5, zone: 'Europa League' },
      { position: 6, zone: 'Conference League' },
      { position: 16, zone: 'Relegation Playoff' },
      { position: 17, zone: 'Relegation' },
      { position: 18, zone: 'Relegation' },
    ],
  },
  'Ligue 1': {
    totalTeams: 18,
    zones: [
      { position: 1, zone: 'Champions League' },
      { position: 2, zone: 'Champions League' },
      { position: 3, zone: 'Champions League' },
      { position: 4, zone: 'Champions League Qualifier' },
      { position: 5, zone: 'Europa League' },
      { position: 6, zone: 'Conference League' },
      { position: 17, zone: 'Relegation' },
      { position: 18, zone: 'Relegation' },
    ],
  },
  'Primeira Liga': {
    totalTeams: 18,
    zones: [
      { position: 1, zone: 'Champions League' },
      { position: 2, zone: 'Champions League Qualifier' },
      { position: 3, zone: 'Europa League' },
      { position: 4, zone: 'Conference League' },
    ],
  },
  'Eredivisie': {
    totalTeams: 18,
    zones: [
      { position: 1, zone: 'Champions League' },
      { position: 2, zone: 'Champions League' },
      { position: 3, zone: 'Champions League Qualifier' },
      { position: 4, zone: 'Europa League' },
      { position: 5, zone: 'Conference League' },
    ],
  },
};

export function getQualification(leagueName: string): LeagueQualification | null {
  const rule = RULES[leagueName];
  if (!rule) return null;
  return { leagueName: leagueName as LeagueName, ...rule };
}

export function getZoneAtPosition(leagueName: string, position: number): Zone {
  const rule = RULES[leagueName];
  if (!rule) return 'Midtable';
  const matched = rule.zones.find((z) => z.position === position);
  if (matched) return matched.zone;
  // Between defined positions — midtable
  const definedPositions = rule.zones.map((z) => z.position);
  const minDefined = Math.min(...definedPositions);
  const maxDefined = Math.max(...definedPositions);
  if (position < minDefined) return rule.zones.find((z) => z.position === minDefined)?.zone ?? 'Midtable';
  if (position > maxDefined) return rule.zones.find((z) => z.position === maxDefined)?.zone ?? 'Midtable';
  return 'Midtable';
}

export function getZoneBorderClass(zone: Zone): string {
  switch (zone) {
    case 'Champions League': return 'border-l-4 border-l-sky-500';
    case 'Champions League Qualifier': return 'border-l-4 border-l-cyan-500';
    case 'Europa League': return 'border-l-4 border-l-emerald-500';
    case 'Conference League': return 'border-l-4 border-l-amber-500';
    case 'Relegation Playoff': return 'border-l-4 border-l-orange-500';
    case 'Relegation': return 'border-l-4 border-l-rose-500';
    default: return 'border-l-4 border-l-transparent';
  }
}

export function getZoneBgClass(zone: Zone): string {
  switch (zone) {
    case 'Champions League': return 'bg-sky-500';
    case 'Champions League Qualifier': return 'bg-cyan-500';
    case 'Europa League': return 'bg-emerald-500';
    case 'Conference League': return 'bg-amber-500';
    case 'Relegation Playoff': return 'bg-orange-500';
    case 'Relegation': return 'bg-rose-500';
    default: return 'bg-gray-700';
  }
}

export function getZoneLabel(zone: Zone): string {
  switch (zone) {
    case 'Champions League': return 'Champions League';
    case 'Champions League Qualifier': return 'CL Qualifier';
    case 'Europa League': return 'Europa League';
    case 'Conference League': return 'Conference League';
    case 'Relegation Playoff': return 'Relegation Playoff';
    case 'Relegation': return 'Relegation';
    default: return '';
  }
}

export function getZonesUsed(leagueName: string): { zone: Zone; bgClass: string; label: string }[] {
  const rule = RULES[leagueName];
  if (!rule) return [];
  const seen = new Set<Zone>();
  const result: { zone: Zone; bgClass: string; label: string }[] = [];
  for (const z of rule.zones) {
    if (!seen.has(z.zone)) {
      seen.add(z.zone);
      result.push({ zone: z.zone, bgClass: getZoneBgClass(z.zone), label: getZoneLabel(z.zone) });
    }
  }
  return result;
}

export function getChampionsLeagueStageLabel(stage: number): string {
  const stages = [
    '', 'League Phase (8 matches)', 'Round of 16', 'Quarter Final', 'Semi Final', 'Final',
  ];
  return stages[stage] ?? 'Unknown';
}
