import { writeFileSync } from 'node:fs';

const KEY = 'f501f01ef13346538118ac31dcb0d18c';
const BASE = 'https://api.football-data.org/v4';

const codes = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'DED', 'PPL', 'BSA', 'ELC', 'CL', 'EC'];

const today = new Date();
const nextYear = new Date(today);
nextYear.setFullYear(nextYear.getFullYear() + 1);
const fmt = (d) => d.toISOString().slice(0, 10);
const dateFrom = fmt(today);
const dateTo = fmt(nextYear);

async function fd(path, retries = 6) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(BASE + path, { headers: { 'X-Auth-Token': KEY } });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return res.json();
  }
  throw new Error(`${path} -> 429 (rate limited)`);
}

const out = {};
for (const code of codes) {
  try {
    const comp = await fd(`/competitions/${code}`);
    const teams = await fd(`/competitions/${code}/teams`);
    const matches = await fd(
      `/competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );

    out[code] = {
      emblem: comp.emblem || null,
      teams: (teams.teams || []).map((t) => ({
        id: t.id,
        name: t.name,
        shortName: t.shortName || null,
        tla: t.tla || null,
        crest: t.crest || null,
      })),
      matches: (matches.matches || []).map((m) => ({
        id: m.id,
        utcDate: m.utcDate,
        matchday: m.matchday ?? null,
        status: m.status,
        homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, crest: m.homeTeam.crest || null },
        awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, crest: m.awayTeam.crest || null },
        score: m.score || null,
      })),
    };
    console.log(`OK ${code}: ${out[code].teams.length} teams, ${out[code].matches.length} matches`);
  } catch (e) {
    console.log(`ERR ${code}: ${e.message}`);
    out[code] = { emblem: null, teams: [], matches: [] };
  }
  await new Promise((r) => setTimeout(r, 1000));
}

writeFileSync(
  new URL('../src/data/realFootballData.json', import.meta.url),
  JSON.stringify(out, null, 2)
);
console.log('Saved src/data/realFootballData.json');
