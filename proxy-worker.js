// Cloudflare Worker — CORS proxy for blocked APIs
// Deploy: wrangler deploy proxy-worker.js
// Free tier: 100k requests/day
// Usage: https://your-worker.workers.dev/?url=https://query1.finance.yahoo.com/v8/finance/chart/AAPL

// Setup: wrangler kv:namespace create RATE_LIMIT_KV
// Add to wrangler.toml: [[kv_namespaces]] binding = "RATE_LIMIT_KV" id = "<namespace-id>"

const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'api.stlouisfed.org',
  'api.eia.gov',
  'finnhub.io'
];

const ALLOWED_ORIGINS = [
  'https://mmlsk.github.io',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000'
];

const MAX_REQUESTS_PER_MIN = 100;

function getCorsHeaders(origin) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

async function checkRateLimit(ip, env) {
  // Use KV for rate limiting (persists across isolates)
  if (!env.RATE_LIMIT_KV) {
    // Fallback: allow if KV not configured
    return true;
  }
  const key = `rl:${ip}`;
  const entry = await env.RATE_LIMIT_KV.get(key, { type: 'json' });
  const now = Date.now();
  if (!entry || now > entry.resetAt) {
    await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: 1, resetAt: now + 60000 }), { expirationTtl: 120 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_MIN) return false;
  entry.count++;
  await env.RATE_LIMIT_KV.put(key, JSON.stringify(entry), { expirationTtl: 120 });
  return true;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const CORS_HEADERS = getCorsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    // Rate limit by IP (KV-backed)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!await checkRateLimit(ip, env)) {
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
