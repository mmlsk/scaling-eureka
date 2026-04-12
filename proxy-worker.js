// Cloudflare Worker — CORS proxy for blocked APIs
// Deploy: wrangler deploy proxy-worker.js
// Free tier: 100k requests/day
// Usage: https://your-worker.workers.dev/?url=https://query1.finance.yahoo.com/v8/finance/chart/AAPL

const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'api.stlouisfed.org',
  'api.eia.gov'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

const RATE_LIMIT = new Map(); // IP -> { count, resetAt }
const MAX_REQUESTS_PER_MIN = 100;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_MIN) return false;
  entry.count++;
  return true;
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    // Rate limit by IP
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response('Rate limit exceeded', { status: 429, headers: CORS_HEADERS });
    }

    // Parse target URL from query param
    const reqUrl = new URL(request.url);
    const targetUrl = reqUrl.searchParams.get('url');
    if (!targetUrl) {
      return new Response('Missing ?url= parameter', { status: 400, headers: CORS_HEADERS });
    }

    let parsed;
    try { parsed = new URL(targetUrl); } catch {
      return new Response('Invalid URL', { status: 400, headers: CORS_HEADERS });
    }

    // Whitelist check
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return new Response('Host not allowed: ' + parsed.hostname, { status: 403, headers: CORS_HEADERS });
    }

    // Proxy the request
    try {
      const resp = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'LifeOS-Proxy/1.0',
          'Accept': 'application/json'
        }
      });

      const body = await resp.arrayBuffer();
      return new Response(body, {
        status: resp.status,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': resp.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'public, max-age=60'
        }
      });
    } catch (err) {
      return new Response('Upstream error: ' + err.message, { status: 502, headers: CORS_HEADERS });
    }
  }
};
