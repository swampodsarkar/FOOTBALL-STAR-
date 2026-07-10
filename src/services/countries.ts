// Country data via the REST Countries API (uses the provided API key).
// The base URL and key are overridable through Vite env vars so the endpoint
// can be pointed at the correct provider if needed.

const API_KEY =
  import.meta.env.VITE_REST_COUNTRIES_API_KEY ??
  'rc_live_e6d345b5a2ae49e5b4c14637a512633c';

const BASE_URL =
  import.meta.env.VITE_REST_COUNTRIES_BASE ??
  'https://api.apilayer.com/rest_countries';

export interface CountryInfo {
  name: string;
  flag: string; // emoji
  flagPng: string;
  flagSvg: string;
}

const cache: Record<string, CountryInfo> = {};

export async function fetchCountry(name: string): Promise<CountryInfo | null> {
  const key = name?.trim();
  if (!key) return null;
  if (cache[key]) return cache[key];

  try {
    const resp = await fetch(
      `${BASE_URL}/name/${encodeURIComponent(key)}?access_key=${API_KEY}`,
      { headers: { apikey: API_KEY } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const c = Array.isArray(data) ? data[0] : data;
    if (!c) return null;

    const info: CountryInfo = {
      name: c.name?.common ?? key,
      flag: c.flag ?? '',
      flagPng: c.flags?.png ?? '',
      flagSvg: c.flags?.svg ?? '',
    };
    cache[key] = info;
    return info;
  } catch {
    return null;
  }
}
