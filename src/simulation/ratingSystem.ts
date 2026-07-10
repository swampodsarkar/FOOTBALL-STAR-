const BASE_RATING = 6.5;
const MIN_RATING = 3.0;
const MAX_RATING = 10.0;

export interface RatingEvent {
  type: RatingEventType;
  count: number;
}

export type RatingEventType =
  | 'goal'
  | 'assist'
  | 'keyPass'
  | 'bigChanceCreated'
  | 'successfulDribble'
  | 'accuratePassHigh'
  | 'cleanSheet'
  | 'save'
  | 'penaltySave'
  | 'interception'
  | 'tackleWon'
  | 'clearance'
  | 'matchWinnerGoal'
  | 'playerOfMatch'
  | 'missedBigChance'
  | 'wrongPass'
  | 'lostPossession'
  | 'yellowCard'
  | 'redCard'
  | 'ownGoal'
  | 'penaltyMiss'
  | 'errorLeadingGoal'
  | 'dribbledPast';

const RATING_DELTAS: Record<RatingEventType, number> = {
  goal: 0.8,
  assist: 0.5,
  keyPass: 0.15,
  bigChanceCreated: 0.20,
  successfulDribble: 0.08,
  accuratePassHigh: 0.20,
  cleanSheet: 0.60,
  save: 0.08,
  penaltySave: 0.80,
  interception: 0.08,
  tackleWon: 0.07,
  clearance: 0.04,
  matchWinnerGoal: 0.40,
  playerOfMatch: 0.50,
  missedBigChance: -0.30,
  wrongPass: -0.04,
  lostPossession: -0.03,
  yellowCard: -0.25,
  redCard: -1.20,
  ownGoal: -1.00,
  penaltyMiss: -0.80,
  errorLeadingGoal: -0.80,
  dribbledPast: -0.05,
};

export function applyRatingEvents(events: RatingEvent[]): number {
  let rating = BASE_RATING;
  for (const evt of events) {
    rating += (RATING_DELTAS[evt.type] ?? 0) * evt.count;
  }
  return clamp(rating, MIN_RATING, MAX_RATING);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function getRatingLabel(rating: number): string {
  if (rating >= 9.5) return 'Legendary';
  if (rating >= 9.0) return 'World Class';
  if (rating >= 8.5) return 'Excellent';
  if (rating >= 8.0) return 'Great';
  if (rating >= 7.5) return 'Very Good';
  if (rating >= 7.0) return 'Good';
  if (rating >= 6.5) return 'Average';
  if (rating >= 6.0) return 'Poor';
  return 'Terrible';
}

export function getRatingColor(label: string): string {
  switch (label) {
    case 'Legendary': return 'text-amber-300';
    case 'World Class': return 'text-emerald-400';
    case 'Excellent': return 'text-sky-400';
    case 'Great': return 'text-indigo-400';
    case 'Very Good': return 'text-teal-400';
    case 'Good': return 'text-green-400';
    case 'Average': return 'text-gray-400';
    case 'Poor': return 'text-orange-400';
    case 'Terrible': return 'text-rose-400';
    default: return 'text-gray-400';
  }
}

export { BASE_RATING, MIN_RATING, MAX_RATING, RATING_DELTAS };
