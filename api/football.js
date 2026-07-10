// Serverless proxy for football-data.org. The key lives here (server-side) and
// is never shipped to the browser, which also avoids CORS entirely. Hardcoded so
// no environment variable setup is required.
const API_KEY = 'f501f01ef13346538118ac31dcb0d18c';

export default async function handler(req, res) {
  const path = (req.url || '').replace(/^\/api\/football/, '') || '/';
  const target = 'https://api.football-data.org' + path;

  const r = await fetch(target, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  const body = await r.text();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
  res.statusCode = r.status;
  res.end(body);
}
