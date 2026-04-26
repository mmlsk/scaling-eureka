import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

const CACHE_TTL_S = 60;

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
  'www.googleapis.com',
];

type AuthMethod = 'query' | 'header';
const API_KEY_MAP: Record<string, { env: string; param: string; method: AuthMethod }> = {
  polygon:      { env: 'POLYGON_KEY',           param: 'apiKey',          method: 'query' },
  finnhub:      { env: 'FINNHUB_NEWS_KEY',      param: 'token',           method: 'query' },
  alphavantage: { env: 'ALPHA_VANTAGE_KEY',     param: 'apikey',          method: 'query' },
  fred:         { env: 'FRED_API_KEY',          param: 'api_key',         method: 'query' },
  eia:          { env: 'EIA_API_KEY',           param: 'api_key',         method: 'query' },
  openaq:       { env: 'NEXT_PUBLIC_OPENAQ_KEY', param: 'X-API-Key',      method: 'header' },
  openuv:       { env: 'NEXT_PUBLIC_OPENUV_KEY', param: 'x-access-token', method: 'header' },
  googlecal:    { env: 'GOOGLE_CAL_API_KEY',    param: 'key',             method: 'query' },
};

const fetchUpstream = unstable_cache(
  async (url: string, headersJson: string) => {
    const headers: Record<string, string> = JSON.parse(headersJson);
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}`);
    }
    return await res.json();
  },
  ['proxy-upstream'],
  { revalidate: CACHE_TTL_S, tags: ['proxy'] },
);

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

  // API key injection
  const authHeaders: Record<string, string> = {
    'User-Agent': 'LifeOS-Proxy/2.0',
    Accept: 'application/json',
  };

  const keyConfig = API_KEY_MAP[provider];
  if (keyConfig) {
    const apiKey = process.env[keyConfig.env];
    if (apiKey) {
      if (keyConfig.method === 'header') {
        authHeaders[keyConfig.param] = apiKey;
      } else {
        target.searchParams.set(keyConfig.param, apiKey);
      }
    }
  }

  try {
    const data = await fetchUpstream(target.toString(), JSON.stringify(authHeaders));
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'upstream failed', detail: (err as Error).message },
      { status: 502 },
    );
  }
}
