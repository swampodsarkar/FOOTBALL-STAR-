import { create } from 'zustand';
import {
  League,
  SeasonData,
  NewsArticle,
  TransferOffer,
  LeagueTableEntry,
} from '../types';
import {
  simulateLeagueRound,
  recordMatchResult,
  getLeagueTable,
  getLeagueTopScorers,
  resetWorldCache,
  type SimMatchResult,
} from '../simulation/worldSimulator';

interface PendingPlayerMatch {
  leagueName: string;
  clubId: string;
  opponentId: string;
  isHome: boolean;
  homeGoals: number;
  awayGoals: number;
}

interface SimulationStoreState {
  activeLeague: League | null;
  selectedLeagueName: string;
  isWorldLoading: boolean;
  worldWeek: number;
  simulationWeek: number;
  isSimulating: boolean;
  pendingPlayerMatch: PendingPlayerMatch | null;
  worldNews: NewsArticle[];
  transfers: TransferOffer[];
  leagueTables: Record<string, LeagueTableEntry[]>;
  leagueMatchResults: Record<string, SimMatchResult[]>;
  currentSeasonData: SeasonData;
}

interface SimulationStoreActions {
  loadWorldLeagues: (seasonWeek: number, league: League) => void;
  recordPlayerMatch: (payload: {
    leagueName: string;
    clubId: string;
    opponentName: string;
    isHome: boolean;
    homeGoals: number;
    awayGoals: number;
  }) => void;
  simulateWorldWeek: (seasonWeek: number, currentLeagueName: string) => void;
  getLeagueTable: (leagueName: string) => LeagueTableEntry[];
  processTransfers: () => void;
  updateWorldNews: () => void;
  getPlayerTransfers: (playerId: string) => TransferOffer[];
  acceptTransfer: (offerId: string) => void;
  rejectTransfer: (offerId: string) => void;
  resetCacheForNewSeason: (leagueName: string) => void;
}

export const useSimulationStore = create<
  SimulationStoreState & SimulationStoreActions
>()((set, get) => ({
  activeLeague: null,
  selectedLeagueName: '',
  isWorldLoading: false,
  worldWeek: 0,
  simulationWeek: 0,
  isSimulating: false,
  pendingPlayerMatch: null,
  worldNews: [],
  transfers: [],
  leagueTables: {},
  leagueMatchResults: {},
  currentSeasonData: {} as SeasonData,

  loadWorldLeagues: (seasonWeek, league) => {
    set({ isWorldLoading: true });
    try {
      resetWorldCache();
      const allResults: SimMatchResult[] = [];
      const rounds = Math.max(1, Math.min(seasonWeek, 38));
      for (let r = 0; r < rounds; r++) {
        const results = simulateLeagueRound(league, r + 1);
        allResults.push(...results);
      }
      set({
        activeLeague: league,
        selectedLeagueName: league.name,
        leagueTables: { [league.name]: getLeagueTable(league.name) },
        leagueMatchResults: { [league.name]: allResults },
        worldWeek: rounds,
        isWorldLoading: false,
        currentSeasonData: buildSeasonData(league, seasonWeek),
      });
    } catch (e) {
      console.error('Failed to load league world', e);
      set({ isWorldLoading: false });
    }
  },

  recordPlayerMatch: ({ leagueName, clubId, opponentName, isHome, homeGoals, awayGoals }) => {
    const { activeLeague } = get();
    if (!activeLeague || activeLeague.name !== leagueName) return;
    const opponent = activeLeague.clubs.find((c) => c.name === opponentName);
    if (!opponent) return;
    set({
      pendingPlayerMatch: {
        leagueName,
        clubId,
        opponentId: opponent.id,
        isHome,
        homeGoals,
        awayGoals,
      },
    });
  },

  simulateWorldWeek: (seasonWeek, currentLeagueName) => {
    const { activeLeague, pendingPlayerMatch, worldWeek, leagueMatchResults } = get();
    if (!activeLeague || activeLeague.name !== currentLeagueName) return;

    const round = worldWeek + 1;
    const skip =
      pendingPlayerMatch && pendingPlayerMatch.leagueName === currentLeagueName
        ? new Set([pendingPlayerMatch.clubId, pendingPlayerMatch.opponentId])
        : undefined;

    const roundResults = simulateLeagueRound(activeLeague, round, skip);

    if (pendingPlayerMatch) {
      const playerClub = activeLeague.clubs.find(
        (c) => c.id === pendingPlayerMatch.clubId
      );
      const opponentClub = activeLeague.clubs.find(
        (c) => c.id === pendingPlayerMatch.opponentId
      );
      if (playerClub && opponentClub) {
        const homeClub = pendingPlayerMatch.isHome ? playerClub : opponentClub;
        const awayClub = pendingPlayerMatch.isHome ? opponentClub : playerClub;
        const hg = pendingPlayerMatch.isHome
          ? pendingPlayerMatch.homeGoals
          : pendingPlayerMatch.awayGoals;
        const ag = pendingPlayerMatch.isHome
          ? pendingPlayerMatch.awayGoals
          : pendingPlayerMatch.homeGoals;
        recordMatchResult(activeLeague.name, homeClub, awayClub, hg, ag);
        roundResults.push({
          homeTeam: homeClub.name,
          awayTeam: awayClub.name,
          homeScore: hg,
          awayScore: ag,
          round,
        });
      }
    }

    const existing = leagueMatchResults[activeLeague.name] ?? [];
    set({
      leagueTables: { [activeLeague.name]: getLeagueTable(activeLeague.name) },
      leagueMatchResults: {
        ...leagueMatchResults,
        [activeLeague.name]: [...existing, ...roundResults],
      },
      pendingPlayerMatch: null,
      worldWeek: round,
      currentSeasonData: buildSeasonData(activeLeague, seasonWeek),
    });
  },

  getLeagueTable: (leagueName) => {
    const { leagueTables } = get();
    return leagueTables[leagueName] ?? [];
  },

  processTransfers: () => {
    const { transfers } = get();
    const remaining = transfers.filter((t) => t.status === 'Pending');
    set({ transfers: remaining });
  },

  updateWorldNews: () => {
    set((state) => ({
      worldNews: state.worldNews.slice(0, 49),
    }));
  },

  getPlayerTransfers: (playerId) => {
    const { transfers } = get();
    return transfers.filter((t) => t.playerId === playerId);
  },

  acceptTransfer: (offerId) =>
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === offerId ? { ...t, status: 'Accepted' as const } : t
      ),
    })),

  rejectTransfer: (offerId) =>
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === offerId ? { ...t, status: 'Rejected' as const } : t
      ),
    })),
  resetCacheForNewSeason: (leagueName) => {
    resetWorldCache();
    set((state) => ({
      worldWeek: 0,
      leagueTables: { ...state.leagueTables, [leagueName]: [] },
      leagueMatchResults: { ...state.leagueMatchResults, [leagueName]: [] },
    }));
  },
}));

function buildSeasonData(league: League, season: number): SeasonData {
  const table = getLeagueTable(league.name);
  const topScorers = getLeagueTopScorers(league, 1);
  const topScorer = topScorers[0];
  return {
    year: season,
    league: league.name,
    champion: table[0]?.clubName ?? '',
    runnerUp: table[1]?.clubName ?? '',
    topScorer: topScorer
      ? { name: topScorer.name, goals: topScorer.goals, club: topScorer.club }
      : { name: '-', goals: 0, club: '-' },
    leagueTable: table,
  };
}
