import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL_MS = 60_000; // 60s in-memory cache
const cache = new Map<string, { ts: number; data: unknown }>();

const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'api.stlouisfed.org',
  'api.eia.gov',
  'finnhub.io',
  'api.polygon.io',
  'www.alphavantage.co',
  'api.openuv.io',
  'api.openaq.org',
];

const API_KEY_MAP: Record<string, { env: string; param: string }> = {
  polygon: { env: 'NEXT_PUBLIC_POLYGON_KEY', param: 'apiKey' },
  finnhub: { env: 'NEXT_PUBLIC_FINNHUB_KEY', param: 'token' },
  alphavantage: { env: 'NEXT_PUBLIC_ALPHAVANTAGE_KEY', param: 'apikey' },
  fred: { env: 'NEXT_PUBLIC_FRED_KEY', param: 'api_key' },
  eia: { env: 'NEXT_PUBLIC_EIA_KEY', param: 'api_key' },
  openaq: { env: 'NEXT_PUBLIC_OPENAQ_KEY', param: 'apikey' },
  openuv: { env: 'NEXT_PUBLIC_OPENUV_KEY', param: 'x-access-token' },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'missing url' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(target.hostname)) {
    return NextResponse.json({ error: 'host not allowed' }, { status: 403 });
  }

  // In-memory cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
    });
  }

  // API key injection
  const keyConfig = API_KEY_MAP[provider];
  if (keyConfig) {
    const apiKey = process.env[keyConfig.env];
    if (apiKey) {
      if (keyConfig.param === 'x-access-token') {
        // Header-based key (OpenUV)
      } else {
        target.searchParams.set(keyConfig.param, apiKey);
      }
    }
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'LifeOS-Proxy/2.0',
      Accept: 'application/json',
    };

    // OpenUV uses header-based auth
    if (provider === 'openuv') {
      const apiKey = process.env.NEXT_PUBLIC_OPENUV_KEY;
      if (apiKey) headers['x-access-token'] = apiKey;
    }

    const res = await fetch(target.toString(), { headers });
    const data = await res.json();

    cache.set(url, { ts: Date.now(), data });

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'upstream error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
