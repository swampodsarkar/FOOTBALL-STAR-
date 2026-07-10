import { readFileSync, writeFileSync } from 'node:fs';

const KEY = 'f501f01ef13346538118ac31dcb0d18c';
const BASE = 'https://api.football-data.org/v4';

async function fd(path, retries = 8) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(BASE + path, { headers: { 'X-Auth-Token': KEY } });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return res.json();
  }
  throw new Error(`${path} -> 429`);
}

const file = new URL('../src/data/realFootballData.json', import.meta.url);
const out = JSON.parse(readFileSync(file, 'utf8'));

for (const code of ['BL1', 'BSA']) {
  try {
    const comp = await fd(`/competitions/${code}`);
    const teams = await fd(`/competitions/${code}/teams`);
    out[code].emblem = comp.emblem || null;
    out[code].teams = (teams.teams || []).map((t) => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName || null,
      tla: t.tla || null,
      crest: t.crest || null,
    }));
    console.log(`OK ${code}: emblem=${!!out[code].emblem}, teams=${out[code].teams.length}`);
  } catch (e) {
    console.log(`ERR ${code}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 1500));
}

writeFileSync(file, JSON.stringify(out, null, 2));
console.log('Updated');
