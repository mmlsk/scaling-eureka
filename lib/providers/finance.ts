import type {
  PolymarketEvent,
  InsiderTrade,
  SECFiling,
  TrumpNewsItem,
} from '@/types/api';
import type { PizzaIndex } from '@/types/state';

// ── Pizza Index ──
export const PIZZA_INDEX: PizzaIndex[] = [
  { city: 'Warszawa', price: 32 },
  { city: 'Krakow', price: 30 },
  { city: 'Szczecin', price: 28 },
  { city: 'Gdansk', price: 31 },
];

// ── Polymarket Response Shape ──
interface PolymarketAPIResponse {
  title: string;
  markets?: {
    question: string;
    outcomePrices: string;
  }[];
  [key: string]: unknown;
}

// ── Finnhub Insider Response Shape ──
interface FinnhubInsiderResponse {
  data: {
    symbol: string;
    name: string;
    share: number;
    transactionType: string;
    value: number;
    filingDate: string;
    [key: string]: unknown;
  }[];
}

// ── Finnhub Filing Response Shape ──
interface FinnhubFilingItem {
  symbol: string;
  form: string;
  filedDate: string;
  reportUrl: string;
  [key: string]: unknown;
}

// ── Finnhub News Response Shape ──
interface FinnhubNewsItem {
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  url: string;
  [key: string]: unknown;
}

/**
 * Fetch prediction market events from Polymarket's Gamma API.
 */
export async function fetchPolymarket(): Promise<PolymarketEvent[]> {
  const url = 'https://gamma-api.polymarket.com/events?limit=20&active=true&closed=false';
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Polymarket API failed: ${res.status} ${res.statusText}`);
  }

  const raw: PolymarketAPIResponse[] = await res.json();

  const events: PolymarketEvent[] = raw.map((event) => ({
    title: event.title,
    markets: event.markets?.map((m) => ({
      question: m.question,
      outcomePrices: m.outcomePrices,
    })),
  }));

  return events;
}

/**
 * Fetch insider transactions from Finnhub for given tickers.
 */
export async function fetchInsiders(
  tickers: string[],
  apiKey: string,
): Promise<InsiderTrade[]> {
  const allTrades: InsiderTrade[] = [];

  for (const ticker of tickers) {
    const url = `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${encodeURIComponent(ticker)}&token=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);

    if (!res.ok) {
      continue;
    }

    const data: FinnhubInsiderResponse = await res.json();

    if (data.data) {
      const trades: InsiderTrade[] = data.data.slice(0, 10).map((t) => ({
        symbol: t.symbol ?? ticker,
        name: t.name,
        shares: t.share,
        type: t.transactionType,
        value: t.value,
        date: t.filingDate,
      }));
      allTrades.push(...trades);
    }
  }

  return allTrades;
}

/**
 * Fetch SEC filings from Finnhub for given tickers.
 */
export async function fetchSECFilings(
  tickers: string[],
  apiKey: string,
): Promise<SECFiling[]> {
  const allFilings: SECFiling[] = [];

  for (const ticker of tickers) {
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = new Date().toISOString().split('T')[0];
    const url = `https://finnhub.io/api/v1/stock/filings?symbol=${encodeURIComponent(ticker)}&from=${from}&to=${to}&token=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);

    if (!res.ok) {
      continue;
    }

    const data: FinnhubFilingItem[] = await res.json();

    const filings: SECFiling[] = data.slice(0, 5).map((f) => ({
      symbol: f.symbol ?? ticker,
      form: f.form,
      date: f.filedDate,
      url: f.reportUrl,
    }));
    allFilings.push(...filings);
  }

  return allFilings;
}

/**
 * Fetch Trump-related news from Finnhub general news feed.
 */
export async function fetchTrumpNews(apiKey: string): Promise<TrumpNewsItem[]> {
  const url = `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Finnhub news failed: ${res.status} ${res.statusText}`);
  }

  const raw: FinnhubNewsItem[] = await res.json();

  const trumpNews: TrumpNewsItem[] = raw
    .filter((item) => {
      const text = `${item.headline} ${item.summary}`.toLowerCase();
      return text.includes('trump');
    })
    .map((item) => ({
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      datetime: item.datetime,
      url: item.url,
    }));

  return trumpNews;
}

export const FinanceProviders = {
  fetchPolymarket,
  fetchInsiders,
  fetchSECFilings,
  fetchTrumpNews,
  PIZZA_INDEX,
} as const;
