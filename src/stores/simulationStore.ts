import { create } from 'zustand';
import { League, SeasonData, NewsArticle, TransferOffer, LeagueTableEntry } from '../types';

interface SimulationStoreState {
  leagues: League[];
  currentSeasonData: SeasonData;
  simulationWeek: number;
  isSimulating: boolean;
  worldNews: NewsArticle[];
  transfers: TransferOffer[];
  leagueTables: Record<string, LeagueTableEntry[]>;
}

interface SimulationStoreActions {
  simulateWorldWeek: () => void;
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
  currentSeasonData: {} as SeasonData,
  simulationWeek: 0,
  isSimulating: false,
  worldNews: [],
  transfers: [],
  leagueTables: {},

  simulateWorldWeek: () => {
    const { simulationWeek } = get();
    set({
      simulationWeek: simulationWeek + 1,
    });
  },

  getLeagueTable: (leagueName) => {
    const { leagueTables } = get();
    return leagueTables[leagueName] ?? [];
  },

  processTransfers: () => {
    const { transfers } = get();
    const remaining = transfers.filter((t) => {
      return t.status === 'Pending';
    });
    set({ transfers: remaining });
  },

  updateWorldNews: () => {
    set((state) => ({
      worldNews: state.worldNews.slice(0, 49),
    }));
  },

  getPlayerTransfers: (playerId) => {
    const { transfers } = get();
    return transfers.filter(
      (t) => t.playerId === playerId
    );
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
