export interface CompetitionInfo {
  code: string;
  name: string;
  country: string;
  flag: string;
  type: 'LEAGUE' | 'CUP';
  description: string;
}

export const SUPPORTED_COMPETITIONS: CompetitionInfo[] = [
  { code: 'PL', name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', type: 'LEAGUE', description: 'Top flight of English football' },
  { code: 'CL', name: 'UEFA Champions League', country: 'Europe', flag: '🇪🇺', type: 'CUP', description: 'Europe’s elite club competition' },
  { code: 'BL1', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', type: 'LEAGUE', description: 'Top flight of German football' },
  { code: 'DED', name: 'Eredivisie', country: 'Netherlands', flag: '🇳🇱', type: 'LEAGUE', description: 'Top flight of Dutch football' },
  { code: 'BSA', name: 'Campeonato Brasileiro Série A', country: 'Brazil', flag: '🇧🇷', type: 'LEAGUE', description: 'Top flight of Brazilian football' },
  { code: 'PD', name: 'Primera División', country: 'Spain', flag: '🇪🇸', type: 'LEAGUE', description: 'LaLiga — top flight of Spanish football' },
  { code: 'FL1', name: 'Ligue 1', country: 'France', flag: '🇫🇷', type: 'LEAGUE', description: 'Top flight of French football' },
  { code: 'ELC', name: 'Championship', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', type: 'LEAGUE', description: 'Second tier of English football' },
  { code: 'PPL', name: 'Primeira Liga', country: 'Portugal', flag: '🇵🇹', type: 'LEAGUE', description: 'Top flight of Portuguese football' },
  { code: 'EC', name: 'European Championship', country: 'Europe', flag: '🇪🇺', type: 'CUP', description: 'UEFA European national teams tournament' },
  { code: 'SA', name: 'Serie A', country: 'Italy', flag: '🇮🇹', type: 'LEAGUE', description: 'Top flight of Italian football' },
  { code: 'WC', name: 'FIFA World Cup', country: 'World', flag: '🌍', type: 'CUP', description: 'Global national teams tournament' },
];

export function getCompetition(code: string): CompetitionInfo | undefined {
  return SUPPORTED_COMPETITIONS.find((c) => c.code === code);
}
