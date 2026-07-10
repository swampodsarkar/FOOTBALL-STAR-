// Country data via the REST Countries API (https://api.restcountries.com).
// The API key is sent as a Bearer token. The base URL/key are overridable
// through Vite env vars.

const API_KEY =
  import.meta.env.VITE_REST_COUNTRIES_API_KEY ??
  'rc_live_e6d345b5a2ae49e5b4c14637a512633c';

const BASE_URL =
  import.meta.env.VITE_REST_COUNTRIES_BASE ??
  'https://api.restcountries.com/countries/v5';

export interface CountryInfo {
  name: string;
  flag: string; // emoji
  flagPng: string;
  flagSvg: string;
}

interface ApiCountry {
  names?: { common?: string };
  flag?: { emoji?: string; url_png?: string; url_svg?: string };
}

function mapCountry(c: ApiCountry): CountryInfo | null {
  const name = c.names?.common;
  if (!name) return null;
  return {
    name,
    flag: c.flag?.emoji ?? '',
    flagPng: c.flag?.url_png ?? '',
    flagSvg: c.flag?.url_svg ?? '',
  };
}

const cache: Record<string, CountryInfo> = {};

export async function fetchCountry(name: string): Promise<CountryInfo | null> {
  const key = name?.trim();
  if (!key) return null;
  if (cache[key]) return cache[key];

  try {
    const resp = await fetch(`${BASE_URL}?q=${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    const obj = json?.data?.objects?.[0] as ApiCountry | undefined;
    const info = obj ? mapCountry(obj) : null;
    if (info) cache[key] = info;
    return info;
  } catch {
    return null;
  }
}

// Fetch the full list of countries (name + flag) from the REST Countries API,
// paginating through all pages. Returns null on failure so callers can fall back.
export async function fetchAllCountries(): Promise<CountryInfo[] | null> {
  try {
    const all: CountryInfo[] = [];
    let offset = 0;
    for (let i = 0; i < 40; i++) {
      const resp = await fetch(`${BASE_URL}?offset=${offset}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (!resp.ok) break;
      const json = await resp.json();
      const objects = (json?.data?.objects ?? []) as ApiCountry[];
      for (const o of objects) {
        const info = mapCountry(o);
        if (info) all.push(info);
      }
      if (!json?.data?.meta?.more) break;
      offset += objects.length;
    }
    return all.length > 0 ? all : null;
  } catch {
    return null;
  }
}
