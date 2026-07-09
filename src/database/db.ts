import Dexie, { type EntityTable } from 'dexie';
import type { SeasonData, NewsArticle } from '../types';

export interface CareerRecord {
  id?: number;
  name: string;
  position: string;
  currentSeason: number;
  createdAt: number;
}

export interface PlayerRecord {
  id?: number;
  playerId: string;
  name: string;
  age: number;
  nationality: string;
  position: string;
  ovr: number;
  club: string;
  weeklySalary: number;
  contractYears: number;
  seasonGoals: number;
  seasonAssists: number;
  seasonAppearances: number;
  totalXp: number;
  level: number;
}

export interface SeasonRecord {
  id?: number;
  season: number;
  league: string;
  year: number;
  data: SeasonData;
}

export interface NewsRecord {
  id?: number;
  week: number;
  season: number;
  article: NewsArticle;
}

export interface SaveRecord {
  id?: number;
  name: string;
  timestamp: number;
  data: string;
}

export class FootballCareerDB extends Dexie {
  careers!: EntityTable<CareerRecord, 'id'>;
  players!: EntityTable<PlayerRecord, 'id'>;
  seasons!: EntityTable<SeasonRecord, 'id'>;
  news!: EntityTable<NewsRecord, 'id'>;
  saves!: EntityTable<SaveRecord, 'id'>;

  constructor() {
    super('FootballCareerDB');

    this.version(1).stores({
      careers: '++id, name, position, currentSeason, createdAt',
      players: '++id, &playerId, name, club, position, ovr',
      seasons: '++id, [season+league], year, league',
      news: '++id, week, season',
      saves: '++id, name, timestamp',
    });
  }
}

export const db = new FootballCareerDB();
