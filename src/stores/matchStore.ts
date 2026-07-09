import { create } from 'zustand';
import { MatchState, MatchEvent } from '../types';

interface MatchStoreState {
  isMatchActive: boolean;
  matchState: MatchState | null;
  commentary: string[];
  matchEvents: MatchEvent[];
  completionTimer: number;
}

interface MatchStoreActions {
  startMatch: (matchState: MatchState) => void;
  updateMatchState: (updates: Partial<MatchState>) => void;
  addCommentary: (line: string) => void;
  addMatchEvent: (event: MatchEvent) => void;
  setTimer: (seconds: number) => void;
  endMatch: () => void;
  resetMatch: () => void;
}

export const useMatchStore = create<MatchStoreState & MatchStoreActions>()(
  (set) => ({
    isMatchActive: false,
    matchState: null,
    commentary: [],
    matchEvents: [],
    completionTimer: 0,

    startMatch: (matchState) =>
      set({
        isMatchActive: true,
        matchState,
        commentary: [],
        matchEvents: [],
        completionTimer: 0,
      }),

    updateMatchState: (updates) =>
      set((state) => ({
        matchState: state.matchState
          ? { ...state.matchState, ...updates }
          : null,
      })),

    addCommentary: (line) =>
      set((state) => ({
        commentary: [...state.commentary, line],
      })),

    addMatchEvent: (event) =>
      set((state) => ({
        matchEvents: [...state.matchEvents, event],
      })),

    setTimer: (seconds) => set({ completionTimer: seconds }),

    endMatch: () =>
      set({
        isMatchActive: false,
      }),

    resetMatch: () =>
      set({
        isMatchActive: false,
        matchState: null,
        commentary: [],
        matchEvents: [],
        completionTimer: 0,
      }),
  })
);
