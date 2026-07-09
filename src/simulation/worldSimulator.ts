import type { AIPlayer, Club, League, LeagueTableEntry, NewsArticle, Injury } from '../types';

let newsIdCounter = 0;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function poissonGoals(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function generateInjuryForAI(): Injury | null {
  if (Math.random() > 0.08) return null;
  const types: Array<'Minor' | 'Moderate' | 'Severe' | 'Critical'> = ['Minor', 'Moderate', 'Severe', 'Critical'];
  const bodyParts: Array<'Ankle' | 'Knee' | 'Hamstring' | 'Groin' | 'Calf' | 'Thigh' | 'Shoulder' | 'Back' | 'Head'> = [
    'Ankle', 'Knee', 'Hamstring', 'Groin', 'Calf', 'Thigh', 'Shoulder', 'Back', 'Head',
  ];
  const type = types[Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : Math.random() < 0.85 ? 2 : 3];
  const bodyPart = pick(bodyParts);
  let weeks: number;
  switch (type) {
    case 'Minor': weeks = randInt(1, 2); break;
    case 'Moderate': weeks = randInt(3, 6); break;
    case 'Severe': weeks = randInt(7, 16); break;
    case 'Critical': weeks = randInt(17, 40); break;
  }
  return {
    id: `ai-injury-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    bodyPart,
    weeksRemaining: weeks,
    description: `${type} ${bodyPart} injury (${weeks} weeks)`,
  };
}

function simulateSingleMatch(homeStrength: number, awayStrength: number): { homeGoals: number; awayGoals: number; scorerHome: number[]; scorerAway: number[]; cardsHome: number; cardsAway: number } {
  const homeLambda = Math.max(0.1, (homeStrength / 90) * 1.4 + 0.3);
  const awayLambda = Math.max(0.1, (awayStrength / 90) * 1.1 + 0.1);
  const homeGoals = poissonGoals(homeLambda);
  const awayGoals = poissonGoals(awayLambda);
  const scorerHome: number[] = [];
  const scorerAway: number[] = [];
  for (let i = 0; i < homeGoals; i++) scorerHome.push(randInt(1, 11));
  for (let i = 0; i < awayGoals; i++) scorerAway.push(randInt(1, 11));
  const cardsHome = poissonGoals(0.3);
  const cardsAway = poissonGoals(0.35);
  return { homeGoals, awayGoals, scorerHome, scorerAway, cardsHome: Math.min(cardsHome, 3), cardsAway: Math.min(cardsAway, 3) };
}

function getTeamStrength(club: Club): number {
  const squad = club.aiSquad || [];
  if (squad.length === 0) return club.rating || 70;
  return squad.reduce((s, p) => s + p.ovr, 0) / squad.length;
}

export function simulateLeagueWeek(league: League, week: number): void {
  const clubs = league.clubs;
  const numClubs = clubs.length;
  if (numClubs < 2) return;

  const fixtures: [Club, Club][] = [];
  const shuffled = [...clubs].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    fixtures.push([shuffled[i], shuffled[i + 1]]);
  }
  if (shuffled.length % 2 !== 0 && fixtures.length > 0) {
    const last = fixtures.pop()!;
    if (Math.random() < 0.5) {
      fixtures.push([last[0], shuffled[shuffled.length - 1]]);
    } else {
      fixtures.push([last[1], shuffled[shuffled.length - 1]]);
    }
  }

  for (const [home, away] of fixtures) {
    const homeStr = getTeamStrength(home) + 3;
    const awayStr = getTeamStrength(away);
    const result = simulateSingleMatch(homeStr, awayStr);

    const homeEntry = getOrCreateEntry(home, league.name, week);
    const awayEntry = getOrCreateEntry(away, league.name, week);

    homeEntry.played++;
    awayEntry.played++;
    homeEntry.goalsFor += result.homeGoals;
    homeEntry.goalsAgainst += result.awayGoals;
    awayEntry.goalsFor += result.awayGoals;
    awayEntry.goalsAgainst += result.homeGoals;

    if (result.homeGoals > result.awayGoals) {
      homeEntry.won++;
      homeEntry.points += 3;
      awayEntry.lost++;
      homeEntry.form.push('W');
      awayEntry.form.push('L');
    } else if (result.homeGoals < result.awayGoals) {
      awayEntry.won++;
      awayEntry.points += 3;
      homeEntry.lost++;
      homeEntry.form.push('L');
      awayEntry.form.push('W');
    } else {
      homeEntry.drawn++;
      awayEntry.drawn++;
      homeEntry.points += 1;
      awayEntry.points += 1;
      homeEntry.form.push('D');
      awayEntry.form.push('D');
    }

    if (homeEntry.form.length > 5) homeEntry.form.shift();
    if (awayEntry.form.length > 5) awayEntry.form.shift();
  }
}

const tableCache: Map<string, Map<string, LeagueTableEntry>> = new Map();

function getOrCreateEntry(club: Club, leagueName: string, week: number): LeagueTableEntry {
  const key = `${leagueName}-${week}`;
  if (!tableCache.has(key)) {
    tableCache.set(key, new Map());
  }
  const cache = tableCache.get(key)!;
  if (!cache.has(club.id)) {
    cache.set(club.id, {
      clubId: club.id,
      clubName: club.name,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0, form: [],
    });
  }
  return cache.get(club.id)!;
}

export function simulateWorldWeek(leagues: League[], currentSeason: number, currentWeek: number): void {
  for (const league of leagues) {
    simulateLeagueWeek(league, currentWeek);
  }
  generateWorldNews(leagues, currentWeek, currentSeason);
}

export function generateWorldNews(leagues: League[], week: number, season: number): NewsArticle[] {
  const articles: NewsArticle[] = [];

  for (const league of leagues) {
    const standings = getStandings(league.name, tableCache.get(`${league.name}-${week}`) || new Map());
    if (standings.length === 0) continue;

    if (week >= 5 && week <= 38 && Math.random() < 0.15) {
      const top = standings[0];
      const second = standings[1];
      if (top && second && top.points - second.points <= 3) {
        articles.push(createArticle(week, season, 'League', `${top.clubName} lead ${league.name} by just ${top.points - second.points} point${top.points - second.points !== 1 ? 's' : ''}!`, 8));
      }
    }

    if (week > 20 && Math.random() < 0.12) {
      const bottom = standings[standings.length - 1];
      if (bottom) {
        articles.push(createArticle(week, season, 'League', `${bottom.clubName} in relegation trouble: ${bottom.points} points from ${bottom.played} games.`, 6));
      }
    }

    if (Math.random() < 0.1) {
      const topScorer = findTopScorer(league);
      if (topScorer) {
        articles.push(createArticle(week, season, 'Top Scorer', `${topScorer.name} leads ${league.name} scoring charts with ${topScorer.goals} goals!`, 5));
      }
    }

    if (Math.random() < 0.08) {
      const topAssister = findTopAssister(league);
      if (topAssister) {
        articles.push(createArticle(week, season, 'Assists', `${topAssister.name} tops ${league.name} assists table with ${topAssister.assists} assists.`, 4));
      }
    }

    if (Math.random() < 0.06) {
      const club = pick(league.clubs);
      const action = pick(['sacked', 'leaves by mutual consent', 'resigns']);
      articles.push(createArticle(week, season, 'Manager', `${club.name} ${action} after poor run of form.`, 7));
    }

    if (Math.random() < 0.08) {
      const club = pick(league.clubs);
      const player = club.aiSquad ? pick(club.aiSquad) : null;
      if (player && club) {
        const potentialClub = pick(leagues.flatMap(l => l.clubs).filter(c => c.id !== club.id));
        if (potentialClub) {
          const fee = randInt(10, 150);
          articles.push(createArticle(week, season, 'Transfer', `${player.name} linked with ${potentialClub.name} for $${fee}M.`, 5));
        }
      }
    }

    if (Math.random() < 0.05) {
      const club = pick(league.clubs);
      const player = club.aiSquad ? pick(club.aiSquad) : null;
      if (player) {
        const inj = generateInjuryForAI();
        if (inj) {
          articles.push(createArticle(week, season, 'Injury', `${player.name} out for ${inj.weeksRemaining} weeks with ${inj.description}.`, 6));
        }
      }
    }

    if (Math.random() < 0.03 && week > 10) {
      const transfer = pick(['breaking transfer record', 'signing sensational midfielder', 'complete defender signing', 'secure wonderkid']);
      articles.push(createArticle(week, season, 'Transfer', `Big money move: ${pick(league.clubs).name} ${transfer}.`, 6));
    }
  }

  return articles;
}

function findTopScorer(league: League): { name: string; goals: number } | null {
  let top: { name: string; goals: number } | null = null;
  for (const club of league.clubs) {
    for (const player of club.aiSquad || []) {
      if (!top || player.goals > top.goals) {
        top = { name: player.name, goals: player.goals };
      }
    }
  }
  return top;
}

function findTopAssister(league: League): { name: string; assists: number } | null {
  let top: { name: string; assists: number } | null = null;
  for (const club of league.clubs) {
    for (const player of club.aiSquad || []) {
      if (!top || player.assists > top.assists) {
        top = { name: player.name, assists: player.assists };
      }
    }
  }
  return top;
}

function createArticle(week: number, season: number, type: string, headline: string, importance: number): NewsArticle {
  return {
    id: `news-${++newsIdCounter}-${Date.now()}`,
    week,
    season,
    type,
    headline,
    body: headline,
    importance,
    date: `Season ${season}, Week ${week}`,
  };
}

export function updateAIPlayerStats(players: AIPlayer[]): void {
  for (const player of players) {
    player.form = clamp(player.form + randInt(-1, 1), 1, 10);
    player.morale = clamp(player.morale + randInt(-5, 5), 0, 100);

    if (player.injury) {
      player.injury.weeksRemaining--;
      if (player.injury.weeksRemaining <= 0) {
        player.injury = null;
      }
    } else if (Math.random() < 0.02) {
      const inj = generateInjuryForAI();
      if (inj) player.injury = inj;
    }

    player.ovr = clamp(player.ovr + randInt(-1, 1), 40, 99);
    player.value = Math.round(player.ovr * player.ovr * 850 + player.weeklySalary * 40);
    player.gamesPlayed += Math.random() < 0.7 ? 1 : 0;
  }
}

export function simulateAITransfers(leagues: League[], week: number): void {
  if (week < 4 || (week >= 20 && week <= 35)) return;

  const allPlayers: { player: AIPlayer; club: Club }[] = [];
  for (const league of leagues) {
    for (const club of league.clubs) {
      for (const player of club.aiSquad || []) {
        allPlayers.push({ player, club });
      }
    }
  }

  const numTransfers = Math.min(randInt(3, 8), Math.floor(allPlayers.length / 10));
  for (let i = 0; i < numTransfers; i++) {
    const seller = pick(allPlayers);
    const buyerClub = pick(leagues.flatMap(l => l.clubs).filter(c => c.id !== seller.club.id));
    if (!buyerClub || !seller.player) continue;

    const fee = Math.round(seller.player.value * randFloat(0.7, 1.5));
    const newSalary = Math.round(seller.player.weeklySalary * randFloat(0.8, 1.4));
    const contractYears = randInt(1, 4);

    const existingIdx = seller.club.aiSquad.findIndex(p => p.id === seller.player.id);
    if (existingIdx >= 0) {
      seller.club.aiSquad.splice(existingIdx, 1);
    }

    const transferredPlayer: AIPlayer = {
      ...seller.player,
      contractYears,
      weeklySalary: newSalary,
      value: fee,
    };

    buyerClub.aiSquad.push(transferredPlayer);
    buyerClub.budget -= fee;
    seller.club.budget += fee;
  }
}

export function getStandings(_leagueName: string, seasonData: Map<string, LeagueTableEntry>): LeagueTableEntry[] {
  const entries = Array.from(seasonData.values());
  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
  return entries;
}
