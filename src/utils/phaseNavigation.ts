import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';

type GamePhase =
  | 'splash'
  | 'welcome'
  | 'createPlayer'
  | 'selectLeague'
  | 'selectClub'
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

const phaseRoute: Record<GamePhase, string> = {
  splash: '/',
  welcome: '/welcome',
  createPlayer: '/career/new/player',
  selectLeague: '/career/new/league',
  selectClub: '/career/new/club',
  home: '/career/home',
  calendar: '/career/calendar',
  match: '/career/match',
  training: '/career/training',
  transfers: '/career/transfers',
  injuries: '/career/injuries',
  lifestyle: '/career/lifestyle',
  awards: '/career/awards',
  nationalTeam: '/career/national',
  leagueHub: '/career/league',
  news: '/career/news',
  social: '/career/social',
  careerTimeline: '/career/timeline',
  settings: '/career/settings',
};

export function usePhaseNavigation() {
  const navigate = useNavigate();
  const setGamePhase = useGameStore((s) => s.setGamePhase);

  const goTo = useCallback((phase: GamePhase) => {
    setGamePhase(phase);
    navigate(phaseRoute[phase]);
  }, [setGamePhase, navigate]);

  return { goTo, navigate };
}
