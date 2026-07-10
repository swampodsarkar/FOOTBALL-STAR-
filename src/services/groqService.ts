const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY ?? '';
const MODEL = 'llama3-70b-8192';

let warnedNoKey = false;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function isCacheValid<T>(key: string, ttlMs: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey as string);
  }
}

async function groqFetch(prompt: string, parseJson: boolean): Promise<string | null> {
  if (!GROQ_API_KEY) {
    if (!warnedNoKey) {
      console.warn('[Groq] No VITE_GROQ_API_KEY set in .env — using fallback content');
      warnedNoKey = true;
    }
    return null;
  }
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a football journalism AI. Return concise, dramatic content. Never use markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: parseJson ? 500 : 200,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn(`[Groq] API error: ${res.status} ${res.statusText}`);
      return null;
    }
    const json = await res.json();
    return json?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.warn('[Groq] Fetch failed:', err);
    return null;
  }
}

export async function generateNewsArticle(context: string): Promise<{ headline: string; body: string } | null> {
  const cacheKey = `news-${context}`;
  const cached = isCacheValid<{ headline: string; body: string }>(cacheKey, 60 * 60 * 1000);
  if (cached) return cached;

  const raw = await groqFetch(
    `Generate a dramatic football news article about: ${context}. Return ONLY valid JSON with fields "headline" (max 10 words) and "body" (max 30 words). No markdown.`,
    true
  );
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.headline && parsed.body) {
      setCache(cacheKey, parsed);
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

export async function generatePressQuestions(
  context: string
): Promise<{ question: string; answers: { text: string; effect: string }[] }[] | null> {
  const cacheKey = `press-${context}`;
  const cached = isCacheValid<{ question: string; answers: { text: string; effect: string }[] }[]>(cacheKey, 60 * 60 * 1000);
  if (cached) return cached;

  const raw = await groqFetch(
    `Generate 3 football press conference questions for a player. Context: ${context}. Each question must have 3 answer options with the effect label in brackets: [morale+N] [pop+N] [trust+N] or negative like [morale-N]. Return ONLY valid JSON array with fields "question" (string) and "answers" (array of {text: string, effect: string}). No markdown.`,
    true
  );
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      setCache(cacheKey, parsed);
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

export async function generateSocialPost(
  context: string
): Promise<string | null> {
  const cacheKey = `social-${context}`;
  const cached = isCacheValid<string>(cacheKey, 30 * 60 * 1000);
  if (cached) return cached;

  const raw = await groqFetch(
    `Generate a short football player social media post (max 15 words). Context: ${context}. Add 1 relevant emoji. Return ONLY the text. No quotes, no markdown.`,
    false
  );
  if (raw) {
    setCache(cacheKey, raw);
    return raw;
  }
  return null;
}

export async function generateFanComments(
  playerName: string,
  sentiment: 'positive' | 'negative',
  count: number
): Promise<string[] | null> {
  const cacheKey = `fan-${playerName}-${sentiment}-${count}`;
  const cached = isCacheValid<string[]>(cacheKey, 30 * 60 * 1000);
  if (cached) return cached;

  const raw = await groqFetch(
    `Generate ${count} short ${sentiment} football fan comments about player ${playerName}. Each comment max 8 words, add 1 emoji. Return ONLY a JSON array of strings. No markdown.`,
    true
  );
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      setCache(cacheKey, parsed);
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

export async function generateTrendingTopics(): Promise<string[] | null> {
  const cacheKey = 'trending-topics';
  const cached = isCacheValid<string[]>(cacheKey, 60 * 60 * 1000);
  if (cached) return cached;

  const raw = await groqFetch(
    'Generate 5 trending football hashtag topics. Return ONLY a JSON array of strings like "#TopicName". No markdown.',
    true
  );
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      setCache(cacheKey, parsed);
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}
