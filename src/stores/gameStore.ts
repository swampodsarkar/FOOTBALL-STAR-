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
import { saveCloud, loadCloud } from '../services/firebase';
import { calculateMarketValue } from '../services/marketValue';
import { useSimulationStore } from './simulationStore';
import { isFIFAWindow, calculateSelectionScore, getCallUpStatus, resolveNationality, NATIONAL_TEAMS } from '../services/nationalTeamService';
import { getQualification, getZoneAtPosition } from '../services/qualificationRules';
import { processWeeklySalary, calculateExpenses } from '../simulation/economySystem';
import { isTournamentWindow, generateTournamentBracket, generateTournamentNews } from '../services/internationalTournament';
import { calculateTeamChemistry, generateDramaEvent, applyDramaToPlayer } from '../services/chemistrySystem';

function getOrdinal(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

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
  | 'settings'
  | 'press';

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
  isFIFAWindow: boolean;
  nationalTeamStatus: 'Called Up' | 'On Standby' | 'Not Called';
  nationalTeamCountry: string;
  selectionScore: number;
  fifaWindowName: string;
  activeTournament: { id: string; name: string; icon: string; stage: string } | null;
  teamChemistry: number;
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
  loadFromCloud: () => Promise<void>;
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
      isFIFAWindow: false,
      nationalTeamStatus: 'Not Called',
      nationalTeamCountry: '',
      selectionScore: 0,
      fifaWindowName: '',
      activeTournament: null,
      teamChemistry: 50,

      setGamePhase: (phase) => set({ gamePhase: phase }),

      startNewCareer: (player, league, club) => {
        const playerFixtures = (league.fixtures ?? []).filter(
          (f) => f.homeTeam.id === club.apiId || f.awayTeam.id === club.apiId
        );
        const canonNat = resolveNationality(player.nationality);
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
          nationalTeamCountry: NATIONAL_TEAMS[canonNat] ? canonNat : '',
        });
        get().scheduleNextMatch();
        useSimulationStore
          .getState()
          .loadWorldLeagues(1, league);
      },

      advanceWeek: () => {
        const { currentWeek, seasonWeek, currentSeason, player, currentLeague } = get();
        const newWeek = currentWeek + 1;
        const newSeasonWeek = seasonWeek + 1;
        const isSeasonEnd = newWeek > 52;
        let newSeason = currentSeason;
        let transferWindow: TransferWindowType = 'None';

        if (isSeasonEnd) {
          newSeason = currentSeason + 1;
          transferWindow = 'Summer';
        } else if (newSeasonWeek === 1) {
          transferWindow = 'Summer';
        } else if (newSeasonWeek >= 17 && newSeasonWeek <= 20) {
          transferWindow = 'Winter';
        }

        // --- Season-end: calculate qualification ---
        if (isSeasonEnd && currentLeague) {
          const sim = useSimulationStore.getState();
          const table = sim.leagueTables[currentLeague.name];
          if (table && table.length > 0) {
            const rules = getQualification(currentLeague.name);
            if (rules) {
              const qualifiers: Record<string, string[]> = {};
              const relegated: string[] = [];

              table.forEach((entry, idx) => {
                const pos = idx + 1;
                const zone = getZoneAtPosition(currentLeague.name, pos);
                if (!qualifiers[zone]) qualifiers[zone] = [];
                qualifiers[zone].push(entry.clubName);
                if (zone === 'Relegation') relegated.push(entry.clubName);
                if (zone === 'Relegation Playoff') relegated.push(`${entry.clubName} (playoff)`);
              });

              const champion = table[0]?.clubName ?? 'Unknown';
              get().addInboxItem({
                id: `season-end-champ-${Date.now()}`,
                week: seasonWeek, season: currentSeason,
                type: 'Season End',
                headline: `${champion} wins the ${currentLeague.name}!`,
                body: `${champion} are champions of the ${currentSeason}${getOrdinal(currentSeason)} season!`,
                importance: 10,
                date: new Date().toISOString(),
              });

              for (const [zone, clubs] of Object.entries(qualifiers)) {
                if (zone === 'Midtable' || zone === 'Relegation' || zone === 'Relegation Playoff') continue;
                get().addInboxItem({
                  id: `season-end-qual-${zone}-${Date.now()}`,
                  week: seasonWeek, season: currentSeason,
                  type: 'Qualification',
                  headline: `${zone}: ${clubs.join(', ')}`,
                  body: `These clubs have qualified for the ${zone} from the ${currentLeague.name}.`,
                  importance: 7,
                  date: new Date().toISOString(),
                });
              }

              if (relegated.length > 0) {
                get().addInboxItem({
                  id: `season-end-rel-${Date.now()}`,
                  week: seasonWeek, season: currentSeason,
                  type: 'Relegation',
                  headline: `Relegated: ${relegated.join(', ')}`,
                  body: `These clubs have been relegated from the ${currentLeague.name}.`,
                  importance: 8,
                  date: new Date().toISOString(),
                });
              }
            }
          }
          // Reset simulation cache for new season
          useSimulationStore.getState().resetCacheForNewSeason?.(currentLeague.name);
        }

        // --- FIFA Window detection ---
        const refWeek = isSeasonEnd ? 1 : newSeasonWeek;
        const window = isFIFAWindow(refWeek);
        let natStatus = 'Not Called' as 'Called Up' | 'On Standby' | 'Not Called';
        let natCountry = '';
        let selScore = 0;
        let fifaName = '';

        if (window && player) {
          fifaName = window.name;
          const canonNat = resolveNationality(player.nationality);
          if (NATIONAL_TEAMS[canonNat]) {
            selScore = Math.round(calculateSelectionScore(player));
            const status = getCallUpStatus(selScore, player);
            natStatus = status;
            natCountry = canonNat;

            if (status === 'Called Up') {
              const existing = get().inbox;
              if (!existing.some((n) => n.type === 'National Team Call-Up')) {
                get().addInboxItem({
                  id: `nt-callup-${Date.now()}`,
                  week: refWeek, season: newSeason,
                  type: 'National Team Call-Up',
                  headline: `Called up to ${canonNat} national team!`,
                  body: `You have been selected for the ${canonNat} squad during the ${window.name} FIFA window. Your selection score: ${selScore}/100.`,
                  importance: 8,
                  date: new Date().toISOString(),
                });
              }
            } else if (status === 'On Standby') {
              get().addInboxItem({
                id: `nt-standby-${Date.now()}`,
                week: refWeek, season: newSeason,
                type: 'National Team Standby',
                headline: `On standby for ${canonNat} national team`,
                body: `You are on standby for the ${canonNat} squad. Keep performing well to secure a spot.`,
                importance: 5,
                date: new Date().toISOString(),
              });
            }
          }
        } else {
          natStatus = 'Not Called';
          natCountry = '';
          selScore = 0;
          fifaName = '';
        }

        // --- International Tournament detection ---
        const refSeason = isSeasonEnd ? newSeason : currentSeason;
        const activeTournament = isTournamentWindow(refSeason, refWeek);
        let tournamentInfo = get().activeTournament;
        if (activeTournament && !tournamentInfo) {
          const bracket = generateTournamentBracket(refSeason, activeTournament);
          const news = generateTournamentNews(bracket, refWeek, refSeason);
          for (const item of news) {
            get().addInboxItem({
              id: `tournament-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              week: refWeek, season: refSeason,
              type: 'International Tournament',
              headline: item.headline,
              body: item.body,
              importance: 9,
              date: new Date().toISOString(),
            });
          }
          tournamentInfo = { id: activeTournament.id, name: activeTournament.name, icon: activeTournament.icon, stage: 'In Progress' };
        } else if (!activeTournament) {
          tournamentInfo = null;
        }

        // --- Team Chemistry ---
        let chemistry = 50;
        if (currentLeague) {
          const sim = useSimulationStore.getState();
          const table = sim.leagueTables[currentLeague.name];
          if (table && table.length > 0) {
            const club = currentLeague.clubs.find((c) => c.id === currentClub?.id);
            if (club?.aiSquad) {
              chemistry = calculateTeamChemistry(club.aiSquad);
            }
          }
        }
        const drama = player ? generateDramaEvent(chemistry, player.matchHistory.slice(-5)) : null;
        if (drama && player) {
          get().updatePlayer(applyDramaToPlayer(player, drama));
          get().addInboxItem({
            id: `drama-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            week: refWeek, season: refSeason,
            type: 'Drama',
            headline: drama.title,
            body: drama.description,
            importance: 6,
            date: new Date().toISOString(),
          });
        }

        set({
          currentWeek: isSeasonEnd ? 1 : newWeek,
          currentSeason: newSeason,
          seasonWeek: isSeasonEnd ? 1 : newSeasonWeek,
          transferWindow,
          isFIFAWindow: !!window,
          nationalTeamStatus: natStatus,
          nationalTeamCountry: natCountry,
          selectionScore: selScore,
          fifaWindowName: fifaName,
          activeTournament: tournamentInfo,
          teamChemistry: chemistry,
        });

        if (player) {
          const newMV = calculateMarketValue(player);
          const salaried = processWeeklySalary({ ...player, marketValue: newMV });
          const expenses = calculateExpenses(salaried.bankBalance);
          get().updatePlayer({
            marketValue: newMV,
            bankBalance: salaried.bankBalance - expenses,
          });
        }

        const lg = get().currentLeague;
        useSimulationStore.getState().simulateWorldWeek(refWeek, lg?.name ?? '');
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
          `football-star-pro-save-${state.player?.id ?? 'default'}`,
          JSON.stringify(saveData)
        );
        saveCloud(saveData);
      },

      loadFromCloud: async () => {
        const raw = await loadCloud();
        if (!raw) return;
        const data = raw as any;
        set({
          player: data.player,
          currentLeague: data.currentLeague,
          currentClub: data.currentClub,
          currentWeek: data.currentWeek,
          currentSeason: data.currentSeason,
          seasonWeek: data.seasonWeek,
          transferWindow: data.transferWindow,
          weeklyActivities: data.weeklyActivities ?? [],
          nextMatch: data.nextMatch,
          matchHistory: data.matchHistory ?? [],
          inbox: data.inbox ?? [],
          gamePhase: 'home',
        });
        if (data.currentLeague) {
          useSimulationStore.getState().loadWorldLeagues(data.seasonWeek, data.currentLeague);
        }
      },

      loadGame: (saveId) => {
        const raw = localStorage.getItem(`football-star-pro-save-${saveId}`);
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
          if (data.currentLeague) {
            useSimulationStore
              .getState()
              .loadWorldLeagues(data.seasonWeek, data.currentLeague);
          }
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
        useSimulationStore.getState().loadWorldLeagues(get().seasonWeek, league);
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
      name: 'football-star-pro-game',
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
        isFIFAWindow: state.isFIFAWindow,
        nationalTeamStatus: state.nationalTeamStatus,
        nationalTeamCountry: state.nationalTeamCountry,
        selectionScore: state.selectionScore,
        fifaWindowName: state.fifaWindowName,
      }),
    }
  )
);
