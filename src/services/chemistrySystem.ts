import type { Player, AIPlayer, MatchPerformance } from '../types';

export interface DramaEvent {
  id: string;
  type: 'teamMeeting' | 'playerClash' | 'mediaStorm' | 'fanBacklash' | 'captainSpeach' | 'contractUnrest';
  title: string;
  description: string;
  moraleEffect: number;
  chemistryEffect: number;
}

export interface TeamChemistry {
  score: number;
  label: string;
  color: string;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function calculateTeamChemistry(aiSquad: AIPlayer[]): number {
  if (aiSquad.length === 0) return 50;
  const avgMorale = aiSquad.reduce((s, p) => s + p.morale, 0) / aiSquad.length;
  const avgForm = aiSquad.reduce((s, p) => s + p.form, 0) / aiSquad.length;
  const formNormalized = (avgForm / 10) * 100;
  return clamp(Math.round(avgMorale * 0.6 + formNormalized * 0.4), 0, 100);
}

export function getChemistryInfo(score: number): TeamChemistry {
  if (score >= 80) return { score, label: 'Excellent', color: 'text-emerald-400' };
  if (score >= 60) return { score, label: 'Good', color: 'text-sky-400' };
  if (score >= 40) return { score, label: 'Average', color: 'text-amber-400' };
  if (score >= 20) return { score, label: 'Poor', color: 'text-orange-400' };
  return { score, label: 'Toxic', color: 'text-rose-400' };
}

export function generateDramaEvent(chemistry: number, recentResults: MatchPerformance[]): DramaEvent | null {
  if (chemistry > 60) return null;
  if (Math.random() > 0.3) return null;

  const recentLosses = recentResults.filter((m) => m.result === 'Loss').length;
  const recentRating = recentResults.length > 0
    ? recentResults.reduce((s, m) => s + m.rating, 0) / recentResults.length
    : 0;

  const events: DramaEvent[] = [];

  if (chemistry < 30 && recentLosses >= 2) {
    events.push({
      id: `drama-${Date.now()}-clash`,
      type: 'playerClash',
      title: 'Locker Room Tension',
      description: 'Players clashed in the dressing room after recent defeats. Morale across the squad has dropped.',
      moraleEffect: -10,
      chemistryEffect: -8,
    });
  }

  if (chemistry < 40 && recentRating < 6.0) {
    events.push({
      id: `drama-${Date.now()}-media`,
      type: 'mediaStorm',
      title: 'Media Criticism',
      description: 'The press are questioning the team spirit after a string of poor performances.',
      moraleEffect: -5,
      chemistryEffect: -5,
    });
  }

  if (chemistry < 50 && recentLosses >= 3) {
    events.push({
      id: `drama-${Date.now()}-backlash`,
      type: 'fanBacklash',
      title: 'Fan Discontent',
      description: 'Fans are voicing their frustration on social media. The atmosphere around the club is tense.',
      moraleEffect: -5,
      chemistryEffect: -3,
    });
  }

  if (chemistry >= 40 && chemistry < 60 && Math.random() < 0.4) {
    events.push({
      id: `drama-${Date.now()}-captain`,
      type: 'captainSpeach',
      title: 'Captain\'s Rallying Cry',
      description: 'The team captain has called for unity, urging everyone to stay focused and turn things around.',
      moraleEffect: 8,
      chemistryEffect: 5,
    });
  }

  if (events.length === 0) return null;
  return events[Math.floor(Math.random() * events.length)];
}

export function applyDramaToPlayer(player: Player, event: DramaEvent): Partial<Player> {
  return {
    morale: clamp(player.morale + event.moraleEffect, 0, 100),
  };
}

export function applyChemistryToMatchRating(baseRating: number, chemistry: number): number {
  const modifier = (chemistry - 50) * 0.008;
  return clamp(baseRating + modifier, 3.0, 10.0);
}

export function applyChemistryToPlayerMorale(player: Player, teamChemistry: number): number {
  const diff = (teamChemistry - 50) * 0.15;
  return clamp(player.morale + diff, 0, 100);
}
