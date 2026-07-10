export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'ST' | 'CF';
export type PreferredFoot = 'Left' | 'Right' | 'Both';
export type Difficulty = 'Amateur' | 'Semi-Pro' | 'Professional' | 'World Class' | 'Legendary';
export type MatchResult = 'Win' | 'Draw' | 'Loss';
export type InjuryType = 'Minor' | 'Moderate' | 'Severe' | 'Critical';
export type InjuryBodyPart = 'Ankle' | 'Knee' | 'Hamstring' | 'Groin' | 'Calf' | 'Thigh' | 'Shoulder' | 'Back' | 'Head';
export type TrainingDrill = 'Sprint' | 'Passing' | 'Shooting' | 'Defending' | 'Dribbling' | 'Fitness' | 'Recovery';
export type QTEResult = 'Perfect' | 'Great' | 'Good' | 'Late' | 'Miss';
export type QTEType = 'Finish' | 'Header' | 'Volley' | 'Cross' | 'ThroughPass' | 'Penalty' | 'FreeKick' | 'LongShot' | 'Tackle' | 'Interception' | 'GoalkeeperSave' | 'SlidingBlock';
export type ActivityType = 'Training' | 'Rest' | 'Recovery' | 'Match' | 'Travel' | 'InternationalBreak';
export type TransferWindow = 'Summer' | 'Winter' | 'None';
export type TransferWindowType = 'Summer' | 'Winter' | 'None';
export type ActivityStatus = 'Training' | 'Rest' | 'Recovery' | 'Match' | 'Travel' | 'InternationalBreak';
export type QTEEventResult = 'Perfect' | 'Great' | 'Good' | 'Late' | 'Miss';
export type LeagueName = 'Premier League' | 'LaLiga' | 'Serie A' | 'Bundesliga' | 'Ligue 1' | 'Eredivisie' | 'Primeira Liga' | 'MLS' | 'Saudi Pro League' | 'Turkish Super Lig' | 'Campeonato Brasileiro Série A' | 'Championship' | 'Champions League' | 'European Championship' | 'FIFA World Cup';

export interface PlayerAttributes {
  pace: number; acceleration: number; sprintSpeed: number;
  finishing: number; shotPower: number; longShots: number;
  passing: number; vision: number; crossing: number;
  dribbling: number; ballControl: number; agility: number; balance: number;
  heading: number; strength: number; jumping: number; stamina: number;
  defensiveAwareness: number; standingTackle: number; slidingTackle: number;
  gkDiving?: number; gkHandling?: number; gkKicking?: number; gkReflexes?: number; gkPositioning?: number;
}

export interface PhysicalState {
  energy: number; fitness: number; sharpness: number; fatigue: number; recovery: number; injuryRisk: number;
}

export interface Injury {
  id: string; type: InjuryType; bodyPart: InjuryBodyPart; weeksRemaining: number; description: string;
}

export interface League {
  name: LeagueName; country: string; reputation: number; tier: number; clubs: Club[];
  emblem?: string; fixtures?: Fixture[];
}

export interface Fixture {
  id: number;
  matchday: number | null;
  utcDate: string;
  competition: string;
  homeTeam: { id: number; name: string; crest?: string };
  awayTeam: { id: number; name: string; crest?: string };
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Club {
  id: string; name: string; shortName: string; league: LeagueName; reputation: number; rating: number;
  budget: number; weeklySalary: number; leaguePosition: number; colors: { primary: string; secondary: string };
  objectives: string[]; stadium: string; aiSquad: AIPlayer[];
  crest?: string; apiId?: number;
}

export interface AIPlayer {
  id: string; name: string; position: Position; ovr: number; age: number; nationality: string;
  form: number; morale: number; contractYears: number; weeklySalary: number; value: number;
  attributes: Partial<PlayerAttributes>; injury: Injury | null; gamesPlayed: number; goals: number; assists: number;
  cleanSheets: number; yellowCards: number; redCards: number; averageRating: number;
}

export interface Player {
  id: string; name: string; age: number; nationality: string; preferredFoot: PreferredFoot;
  position: Position; height: number; weight: number; difficulty: Difficulty;
  club: Club | null; ovr: number; attributes: PlayerAttributes;
  physical: PhysicalState; injury: Injury | null;
  morale: number; managerTrust: number; confidence: number; popularity: number;
  form: number; marketValue: number; weeklySalary: number; bankBalance: number;
  contractYears: number; releaseClause: number;
  seasonGoals: number; seasonAssists: number; seasonAppearances: number;
  careerGoals: number; careerAssists: number; careerAppearances: number;
  totalXp: number; level: number;
  socialFollowers: number;
  cars: string[]; houses: string[]; watches: string[]; businesses: string[];
  awards: string[];
  matchHistory: MatchPerformance[];
  currentSeason: number;
  internationalCaps: number;
  internationalGoals: number;
  internationalAssists: number;
  internationalMotm: number;
}

export interface MatchPerformance {
  week: number; season: number; opponent: string; result: MatchResult;
  goals: number; assists: number; keyPasses: number; shots: number;
  tackles: number; interceptions: number; saves: number;
  possessionWon: number; distanceCovered: number; passAccuracy: number;
  rating: number; manOfTheMatch: boolean; xpEarned: number; minutesPlayed: number;
}

export interface QEEvent {
  id: string; type: QTEType; minute: number; difficulty: number;
  result: QTEResult | null;
}

export interface MatchState {
  minute: number; score: { home: number; away: number };
  homeTeam: string; awayTeam: string; competition: string;
  momentum: number; possession: { home: number; away: number };
  xG: { home: number; away: number };
  shots: { home: number; away: number };
  passAccuracy: { home: number; away: number };
  playerEnergy: number; playerRating: number;
  commentary: string; isPlayerTeam: 'home' | 'away';
  qteEvents: QEEvent[]; currentQTE: QEEvent | null;
  isLive: boolean; isHalfTime: boolean; isFullTime: boolean;
  matchEvents: MatchEvent[];
}

export interface MatchEvent {
  minute: number; type: 'Goal' | 'Assist' | 'Yellow' | 'Red' | 'Sub' | 'Injury' | 'QTE';
  playerName: string; description: string; team: string;
}

export interface NewsArticle {
  id: string; week: number; season: number; type: string;
  headline: string; body: string; importance: number; date: string;
}

export interface SocialPost {
  id: string; week: number; type: string; content: string; likes: number; engagement: number;
}

export interface TransferOffer {
  id: string; fromClub: string; playerId: string; playerName: string;
  fee: number; weeklySalary: number; type: 'Transfer' | 'Loan';
  isPlayerOffer: boolean; week: number; status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
}

export interface SeasonData {
  year: number; league: string; champion: string; runnerUp: string;
  topScorer: { name: string; goals: number; club: string };
  playerOfSeason?: string;
  leagueTable: LeagueTableEntry[];
}

export interface LeagueTableEntry {
  clubId: string; clubName: string; played: number; won: number; drawn: number;
  lost: number; goalsFor: number; goalsAgainst: number; points: number; form: string[];
}

export interface SeasonStats {
  clubId: string; clubName: string; topScorer: { name: string; goals: number };
  mostAssists: { name: string; assists: number };
  cleanSheets: { name: string; cleanSheets: number };
  averageRating: { name: string; rating: number };
}

export interface GameState {
  careerStarted: boolean; currentWeek: number; currentSeason: number;
  seasonWeek: number; transferWindow: TransferWindowType;
  playerId: string | null; saves: number;
}

export interface WeeklyActivity {
  week: number; type: ActivityStatus; description: string; completed: boolean;
  results?: { xpGained: number; attributeImprovements?: Partial<PlayerAttributes>; energyChange: number };
}