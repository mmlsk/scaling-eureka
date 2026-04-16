import type { QuoteResult, TickerConfig, YahooChartResult, FinnhubQuote } from '@/types/api';

// ── Ticker Lists ──
export const TICKERS: TickerConfig[] = [
  { sym: 'NVDA', name: 'NVIDIA' },
  { sym: 'TSLA', name: 'Tesla' },
  { sym: 'AAPL', name: 'Apple' },
  { sym: 'SPY', name: 'S&P 500 ETF' },
  { sym: 'AMD', name: 'AMD' },
  { sym: 'BTC-USD', name: 'Bitcoin' },
];

export const MACRO_LIST: TickerConfig[] = [
  { sym: '^GSPC', name: 'S&P 500' },
  { sym: '^NDX', name: 'Nasdaq 100' },
  { sym: '^VIX', name: 'VIX' },
  { sym: 'GC=F', name: 'Gold' },
  { sym: 'CL=F', name: 'Crude Oil' },
  { sym: 'DX-Y.NYB', name: 'Dollar Index' },
  { sym: 'EURUSD=X', name: 'EUR/USD' },
  { sym: 'PLN=X', name: 'USD/PLN' },
];

// ── API Key Configuration ──
interface StockAPIKeys {
  finnhub?: string;
  alphaVantage?: string;
  polygon?: string;
}

// ── Finnhub Symbol Converter ──
/**
 * Converts Yahoo-style symbols to Finnhub format.
 * e.g. BTC-USD -> BINANCE:BTCUSDT
 */
export function finnhubSym(sym: string): string {
  const FINNHUB_MAP: Record<string, string> = {
    'BTC-USD': 'BINANCE:BTCUSDT',
    'ETH-USD': 'BINANCE:ETHUSDT',
    'SOL-USD': 'BINANCE:SOLUSDT',
    'DOGE-USD': 'BINANCE:DOGEUSDT',
  };
  return FINNHUB_MAP[sym] ?? sym;
}

// ── Alpha Vantage Response Shape ──
interface AlphaVantageGlobalQuote {
  'Global Quote': {
    '05. price': string;
    '08. previous close': string;
    '10. change percent': string;
  };
}

// ── Polygon Response Shape ──
interface PolygonTickerResponse {
  ticker: string;
  results: {
    c: number;
    o: number;
    h: number;
    l: number;
    v: number;
  }[];
  previousClose?: {
    results: {
      c: number;
    }[];
  };
}

interface PolygonPrevCloseResponse {
  results: {
    c: number;
  }[];
}

// ── Provider Functions ──

async function fetchFinnhub(sym: string, apiKey: string): Promise<QuoteResult> {
  const mappedSym = finnhubSym(sym);
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(mappedSym)}&token=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Finnhub failed: ${res.status}`);
  }

  const data: FinnhubQuote = await res.json();

  if (!data.c || data.c === 0) {
    throw new Error('Finnhub returned zero price');
  }

  return {
    price: data.c,
    prev: data.pc,
    chg: data.dp,
    provider: 'finnhub',
  };
}

async function fetchAlphaVantage(sym: string, apiKey: string): Promise<QuoteResult> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(sym)}&apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Alpha Vantage failed: ${res.status}`);
  }

  const data: AlphaVantageGlobalQuote = await res.json();
  const quote = data['Global Quote'];

  if (!quote || !quote['05. price']) {
    throw new Error('Alpha Vantage returned no data');
  }

  const price = parseFloat(quote['05. price']);
  const prev = parseFloat(quote['08. previous close']);
  const chgPct = parseFloat(quote['10. change percent'].replace('%', ''));

  return {
    price,
    prev,
    chg: chgPct,
    provider: 'alphavantage',
  };
}

async function fetchPolygon(sym: string, apiKey: string): Promise<QuoteResult> {
  const cleanSym = sym.replace('^', '').replace('=', '');
  const today = new Date().toISOString().split('T')[0];

  const [tickerRes, prevRes] = await Promise.all([
    fetch(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(cleanSym)}/range/1/day/${today}/${today}?apiKey=${encodeURIComponent(apiKey)}`),
    fetch(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(cleanSym)}/prev?apiKey=${encodeURIComponent(apiKey)}`),
  ]);

  if (!tickerRes.ok || !prevRes.ok) {
    throw new Error(`Polygon failed: ticker=${tickerRes.status} prev=${prevRes.status}`);
  }

  const tickerData: PolygonTickerResponse = await tickerRes.json();
  const prevData: PolygonPrevCloseResponse = await prevRes.json();

  const latestClose = tickerData.results?.[0]?.c;
  const previousClose = prevData.results?.[0]?.c;

  if (!latestClose || !previousClose) {
    throw new Error('Polygon returned incomplete data');
  }

  const chg = ((latestClose - previousClose) / previousClose) * 100;

  return {
    price: latestClose,
    prev: previousClose,
    chg,
    provider: 'polygon',
  };
}

/**
 * Fetch quote from Yahoo Finance with CORS-resilient proxy fallbacks.
 */
export async function fetchYahoo(
  sym: string,
  range: string = '5d',
  interval: string = '1d',
): Promise<QuoteResult> {
  const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=${interval}`;

  const proxyUrls = [
    baseUrl,
    `https://corsproxy.io/?${encodeURIComponent(baseUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(baseUrl)}`,
  ];

  let lastError: Error | null = null;

  for (const url of proxyUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!res.ok) {
        throw new Error(`Yahoo fetch failed: ${res.status}`);
      }

      const json = await res.json() as { chart: { result: YahooChartResult[] } };
      const result = json.chart?.result?.[0];

      if (!result) {
        throw new Error('Yahoo returned no chart result');
      }

      const meta = result.meta;
      const price = meta.regularMarketPrice;
      const prev = meta.chartPreviousClose ?? meta.previousClose;

      if (!price || price === 0) {
        throw new Error('Yahoo returned zero price');
      }

      const chg = prev ? ((price - prev) / prev) * 100 : 0;

      const closes = result.indicators?.quote?.[0]?.close
        ?.filter((c): c is number => c !== null) ?? [];

      return {
        price,
        prev,
        chg,
        closes,
        vol: meta.regularMarketVolume,
        provider: 'yahoo',
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('All Yahoo proxies failed');
}

/**
 * Fetch quote trying providers in order: Finnhub -> Alpha Vantage -> Polygon -> Yahoo.
 */
export async function fetchQuote(sym: string, keys: StockAPIKeys): Promise<QuoteResult> {
  const providers: Array<{ name: string; fn: () => Promise<QuoteResult> }> = [];

  if (keys.finnhub) {
    providers.push({
      name: 'finnhub',
      fn: () => fetchFinnhub(sym, keys.finnhub!),
    });
  }

  if (keys.alphaVantage) {
    providers.push({
      name: 'alphavantage',
      fn: () => fetchAlphaVantage(sym, keys.alphaVantage!),
    });
  }

  if (keys.polygon) {
    providers.push({
      name: 'polygon',
      fn: () => fetchPolygon(sym, keys.polygon!),
    });
  }

  // Yahoo is always the final fallback (no API key needed)
  providers.push({
    name: 'yahoo',
    fn: () => fetchYahoo(sym),
  });

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      return await provider.fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error(`All providers failed for ${sym}`);
}

export const StockProviders = {
  fetchQuote,
  fetchYahoo,
  finnhubSym,
  TICKERS,
  MACRO_LIST,
} as const;
