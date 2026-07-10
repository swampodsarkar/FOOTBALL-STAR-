import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Player,
  WeeklyActivity,
  Club,
  League,
  MatchPerformance,
  NewsArticle,
  QEEvent,
  QTEResult,
  Fixture,
} from '../types';
import { buildRealLeague, getPerformanceOffers, type ClubOffer } from '../services/footballData';
import { useSimulationStore } from './simulationStore';

type GamePhase =
  | 'splash'
  | 'welcome'
  | 'createPlayer'
  | 'selectLeague'
  | 'selectClub'
  | 'startOffers'
  | 'home'
  | 'calendar'
  | 'match'
  | 'training'
  | 'transfers'
  | 'injuries'
  | 'lifestyle'
  | 'awards'
  | 'nationalTeam'
  | 'leagueHub'
  | 'news'
  | 'social'
  | 'careerTimeline'
  | 'settings';

type TransferWindowType = 'Summer' | 'Winter' | 'None';

interface GameState {
  gamePhase: GamePhase;
  player: Player | null;
  currentLeague: League | null;
  currentClub: Club | null;
  currentWeek: number;
  currentSeason: number;
  seasonWeek: number;
  transferWindow: TransferWindowType;
  weeklyActivities: WeeklyActivity[];
  fixtures: Fixture[];
  fixtureIndex: number;
  nextMatch: {
    opponent: string;
    competition: string;
    isHome: boolean;
    week: number;
  } | null;
  matchHistory: MatchPerformance[];
  inbox: NewsArticle[];
  pendingOffers: ClubOffer[];
  isLoading: boolean;
  showQTEResult: boolean;
  lastQTEEvent: QEEvent | null;
}

interface GameActions {
  setGamePhase: (phase: GamePhase) => void;
  startNewCareer: (player: Player, league: League, club: Club) => void;
  advanceWeek: () => void;
  setWeeklyActivities: (activities: WeeklyActivity[]) => void;
  addMatchPerformance: (performance: MatchPerformance) => void;
  addInboxItem: (item: NewsArticle) => void;
  removeInboxItem: (id: string) => void;
  setLoading: (bool: boolean) => void;
  saveGame: () => void;
  loadGame: (saveId: string) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  setNextMatch: (match: {
    opponent: string;
    competition: string;
    isHome: boolean;
    week: number;
  } | null) => void;
  triggerQTEEvent: (event: QEEvent) => void;
  resolveQTE: (result: QTEResult) => void;
  scheduleNextMatch: () => void;
  addClubOffer: (offer: ClubOffer) => void;
  acceptClubOffer: (id: string) => Promise<void>;
  dismissClubOffer: (id: string) => void;
  generateClubOffers: () => void;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      gamePhase: 'splash',
      player: null,
      currentLeague: null,
      currentClub: null,
      currentWeek: 0,
      currentSeason: 1,
      seasonWeek: 0,
      transferWindow: 'None',
      weeklyActivities: [],
      fixtures: [],
      fixtureIndex: 0,
      nextMatch: null,
      matchHistory: [],
      inbox: [],
      pendingOffers: [],
      isLoading: false,
      showQTEResult: false,
      lastQTEEvent: null,

      setGamePhase: (phase) => set({ gamePhase: phase }),

      startNewCareer: (player, league, club) => {
        const playerFixtures = (league.fixtures ?? []).filter(
          (f) => f.homeTeam.id === club.apiId || f.awayTeam.id === club.apiId
        );
        set({
          gamePhase: 'home',
          player,
          currentLeague: league,
          currentClub: club,
          currentWeek: 1,
          currentSeason: 1,
          seasonWeek: 1,
          transferWindow: 'Summer',
          weeklyActivities: [],
          fixtures: playerFixtures,
          fixtureIndex: 0,
          nextMatch: null,
          matchHistory: [],
          inbox: [],
        });
        get().scheduleNextMatch();
        useSimulationStore
          .getState()
          .loadWorldLeagues(1, league.name);
      },

      advanceWeek: () => {
        const { currentWeek, seasonWeek, currentSeason } = get();
        const newWeek = currentWeek + 1;
        const newSeasonWeek = seasonWeek + 1;
        let newSeason = currentSeason;
        let transferWindow: TransferWindowType = 'None';

        if (newWeek > 52) {
          newSeason = currentSeason + 1;
          transferWindow = 'Summer';
        } else if (newSeasonWeek === 1) {
          transferWindow = 'Summer';
        } else if (newSeasonWeek >= 17 && newSeasonWeek <= 20) {
          transferWindow = 'Winter';
        }

        set({
          currentWeek: newWeek > 52 ? 1 : newWeek,
          currentSeason: newSeason,
          seasonWeek: newWeek > 52 ? 1 : newSeasonWeek,
          transferWindow,
        });

        const lg = get().currentLeague;
        useSimulationStore
          .getState()
          .simulateWorldWeek(newSeasonWeek, lg?.name ?? '');
      },

      setWeeklyActivities: (activities) => set({ weeklyActivities: activities }),

      addMatchPerformance: (performance) =>
        set((state) => ({
          matchHistory: [...state.matchHistory, performance],
        })),

      addInboxItem: (item) =>
        set((state) => ({
          inbox: [item, ...state.inbox],
        })),

      removeInboxItem: (id) =>
        set((state) => ({
          inbox: state.inbox.filter((i) => i.id !== id),
        })),

      setLoading: (bool) => set({ isLoading: bool }),

      saveGame: () => {
        const state = get();
        const saveData = {
          player: state.player,
          currentLeague: state.currentLeague,
          currentClub: state.currentClub,
          currentWeek: state.currentWeek,
          currentSeason: state.currentSeason,
          seasonWeek: state.seasonWeek,
          transferWindow: state.transferWindow,
          weeklyActivities: state.weeklyActivities,
          nextMatch: state.nextMatch,
          matchHistory: state.matchHistory,
          inbox: state.inbox,
        };
        localStorage.setItem(
          `football-career-save-${state.player?.id ?? 'default'}`,
          JSON.stringify(saveData)
        );
      },

      loadGame: (saveId) => {
        const raw = localStorage.getItem(`football-career-save-${saveId}`);
        if (raw) {
          const data = JSON.parse(raw);
          set({
            player: data.player,
            currentLeague: data.currentLeague,
            currentClub: data.currentClub,
            currentWeek: data.currentWeek,
            currentSeason: data.currentSeason,
            seasonWeek: data.seasonWeek,
            transferWindow: data.transferWindow,
            weeklyActivities: data.weeklyActivities,
            nextMatch: data.nextMatch,
            matchHistory: data.matchHistory,
            inbox: data.inbox,
            gamePhase: 'home',
          });
          useSimulationStore
            .getState()
            .loadWorldLeagues(data.seasonWeek, data.currentLeague?.name ?? '');
        }
      },

      updatePlayer: (updates) =>
        set((state) => ({
          player: state.player ? { ...state.player, ...updates } : null,
        })),

      setNextMatch: (match) => set({ nextMatch: match }),

      triggerQTEEvent: (event) =>
        set({ lastQTEEvent: event, showQTEResult: true }),

      resolveQTE: () => {
        set({ showQTEResult: false, lastQTEEvent: null });
      },

      scheduleNextMatch: () => {
        const { fixtures, fixtureIndex, currentClub, currentWeek, currentLeague } = get();
        if (!currentClub || !currentLeague) return;
        if (fixtureIndex >= fixtures.length) {
          set({ nextMatch: null });
          return;
        }
        const f = fixtures[fixtureIndex];
        const isHome = f.homeTeam.id === currentClub.apiId;
        const opponent = isHome ? f.awayTeam.name : f.homeTeam.name;
        const week = currentWeek + 1;
        set({
          nextMatch: {
            opponent,
            competition: f.competition,
            isHome,
            week,
          },
          fixtureIndex: fixtureIndex + 1,
        });
      },

      addClubOffer: (offer) =>
        set((state) => ({ pendingOffers: [...state.pendingOffers, offer] })),

      acceptClubOffer: async (id) => {
        const { pendingOffers } = get();
        const offer = pendingOffers.find((o) => o.id === id);
        if (!offer) return;
        const league = await buildRealLeague(offer.code);
        const playerFixtures = (league.fixtures ?? []).filter(
          (f) => f.homeTeam.id === offer.club.apiId || f.awayTeam.id === offer.club.apiId
        );
        set((state) => ({
          currentClub: offer.club,
          currentLeague: league,
          fixtures: playerFixtures,
          fixtureIndex: 0,
          nextMatch: null,
          pendingOffers: state.pendingOffers.filter((o) => o.id !== id),
        }));
        get().scheduleNextMatch();
        get().addInboxItem({
          id: `offer-accepted-${offer.club.id}-${Date.now()}`,
          week: get().currentWeek,
          season: get().currentSeason,
          type: 'Transfer',
          headline: `You signed for ${offer.club.name}!`,
          body: `A new chapter begins at ${offer.club.name} in the ${offer.leagueName}.`,
          importance: 5,
          date: new Date().toISOString(),
        });
      },

      dismissClubOffer: (id) =>
        set((state) => ({
          pendingOffers: state.pendingOffers.filter((o) => o.id !== id),
        })),

      generateClubOffers: () => {
        const { matchHistory, currentClub, pendingOffers } = get();
        if (!currentClub) return;
        const recent = matchHistory.slice(-5);
        if (recent.length < 3) return;
        const avg = recent.reduce((s, m) => s + m.rating, 0) / recent.length;
        if (avg < 7.0) return; // only strong form attracts interest
        const offers = getPerformanceOffers(currentClub.reputation, 3);
        if (offers.length === 0) return;
        const existingIds = new Set(pendingOffers.map((o) => o.club.id));
        const newOffers = offers.filter((o) => !existingIds.has(o.club.id));
        if (newOffers.length === 0) return;
        set((state) => ({ pendingOffers: [...state.pendingOffers, ...newOffers] }));
        const top = newOffers[0];
        get().addInboxItem({
          id: `offer-interest-${top.club.id}-${Date.now()}`,
          week: get().currentWeek,
          season: get().currentSeason,
          type: 'Transfer',
          headline: `${top.club.name} is interested in signing you`,
          body: `Your recent form (avg ${avg.toFixed(1)} rating) has caught the eye of ${top.club.name} (${top.leagueName}).`,
          importance: 4,
          date: new Date().toISOString(),
        });
      },
    }),
    {
      name: 'football-career-game',
      partialize: (state) => ({
        player: state.player,
        currentLeague: state.currentLeague,
        currentClub: state.currentClub,
        currentWeek: state.currentWeek,
        currentSeason: state.currentSeason,
        seasonWeek: state.seasonWeek,
        transferWindow: state.transferWindow,
        weeklyActivities: state.weeklyActivities,
        fixtures: state.fixtures,
        fixtureIndex: state.fixtureIndex,
        nextMatch: state.nextMatch,
        matchHistory: state.matchHistory,
        inbox: state.inbox,
        pendingOffers: state.pendingOffers,
      }),
    }
  )
);
