import { create } from 'zustand';
import {
  League,
  SeasonData,
  NewsArticle,
  TransferOffer,
  LeagueTableEntry,
} from '../types';
import { SUPPORTED_LEAGUES, buildRealLeague } from '../services/footballData';
import {
  simulateLeagueRound,
  recordMatchResult,
  getLeagueTable,
  getLeagueTopScorers,
  resetWorldCache,
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
  leagues: League[];
  availableLeagues: League[];
  selectedLeagueName: string;
  isWorldLoading: boolean;
  worldWeek: number;
  simulationWeek: number;
  isSimulating: boolean;
  pendingPlayerMatch: PendingPlayerMatch | null;
  worldNews: NewsArticle[];
  transfers: TransferOffer[];
  leagueTables: Record<string, LeagueTableEntry[]>;
  currentSeasonData: SeasonData;
}

interface SimulationStoreActions {
  loadWorldLeagues: (seasonWeek: number, currentLeagueName: string) => Promise<void>;
  selectLeague: (name: string) => void;
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
}

export const useSimulationStore = create<
  SimulationStoreState & SimulationStoreActions
>()((set, get) => ({
  leagues: [],
  availableLeagues: [],
  selectedLeagueName: '',
  isWorldLoading: false,
  worldWeek: 0,
  simulationWeek: 0,
  isSimulating: false,
  pendingPlayerMatch: null,
  worldNews: [],
  transfers: [],
  leagueTables: {},
  currentSeasonData: {} as SeasonData,

  loadWorldLeagues: async (seasonWeek, currentLeagueName) => {
    set({ isWorldLoading: true });
    try {
      const leagues = await Promise.all(
        SUPPORTED_LEAGUES.map((lg) => buildRealLeague(lg.code))
      );
      resetWorldCache();
      const rounds = Math.max(1, Math.min(seasonWeek, 38));
      for (let r = 0; r < rounds; r++) {
        for (const league of leagues) {
          simulateLeagueRound(league, r + 1);
        }
      }
      const leagueTables: Record<string, LeagueTableEntry[]> = {};
      for (const league of leagues) {
        leagueTables[league.name] = getLeagueTable(league.name);
      }
      const playerLeague = leagues.find((l) => l.name === currentLeagueName);
      set({
        leagues,
        availableLeagues: leagues,
        selectedLeagueName: currentLeagueName,
        leagueTables,
        worldWeek: rounds,
        isWorldLoading: false,
        currentSeasonData: playerLeague
          ? buildSeasonData(playerLeague, seasonWeek)
          : ({} as SeasonData),
      });
    } catch (e) {
      console.error('Failed to load world leagues', e);
      set({ isWorldLoading: false });
    }
  },

  selectLeague: (name) => set({ selectedLeagueName: name }),

  recordPlayerMatch: ({ leagueName, clubId, opponentName, isHome, homeGoals, awayGoals }) => {
    const { availableLeagues } = get();
    const league = availableLeagues.find((l) => l.name === leagueName);
    if (!league) return;
    const opponent = league.clubs.find((c) => c.name === opponentName);
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
    const { availableLeagues, pendingPlayerMatch, worldWeek } = get();
    if (availableLeagues.length === 0) return;

    const round = worldWeek + 1;
    const skip =
      pendingPlayerMatch && pendingPlayerMatch.leagueName === currentLeagueName
        ? new Set([pendingPlayerMatch.clubId, pendingPlayerMatch.opponentId])
        : undefined;

    for (const league of availableLeagues) {
      simulateLeagueRound(
        league,
        round,
        skip && league.name === currentLeagueName ? skip : undefined
      );
    }

    if (pendingPlayerMatch) {
      const league = availableLeagues.find(
        (l) => l.name === pendingPlayerMatch.leagueName
      );
      const playerClub = league?.clubs.find(
        (c) => c.id === pendingPlayerMatch.clubId
      );
      const opponentClub = league?.clubs.find(
        (c) => c.id === pendingPlayerMatch.opponentId
      );
      if (league && playerClub && opponentClub) {
        const homeClub = pendingPlayerMatch.isHome ? playerClub : opponentClub;
        const awayClub = pendingPlayerMatch.isHome ? opponentClub : playerClub;
        const hg = pendingPlayerMatch.isHome
          ? pendingPlayerMatch.homeGoals
          : pendingPlayerMatch.awayGoals;
        const ag = pendingPlayerMatch.isHome
          ? pendingPlayerMatch.awayGoals
          : pendingPlayerMatch.homeGoals;
        recordMatchResult(league.name, homeClub, awayClub, hg, ag);
      }
    }

    const leagueTables: Record<string, LeagueTableEntry[]> = {};
    for (const league of availableLeagues) {
      leagueTables[league.name] = getLeagueTable(league.name);
    }

    const playerLeague = availableLeagues.find((l) => l.name === currentLeagueName);
    set({
      leagueTables,
      pendingPlayerMatch: null,
      worldWeek: round,
      currentSeasonData: playerLeague
        ? buildSeasonData(playerLeague, seasonWeek)
        : ({} as SeasonData),
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
