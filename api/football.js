export default async function handler(req, res) {
  const path = (req.url || '').replace(/^\/api\/football/, '') || '/';
  const target = 'https://api.football-data.org' + path;

  const r = await fetch(target, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '' },
  });

  const body = await r.text();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
  res.statusCode = r.status;
  res.end(body);
}
