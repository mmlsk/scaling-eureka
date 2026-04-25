'use client';

import { useQuery } from '@tanstack/react-query';
import { useHydration } from '@/hooks/useHydration';
import { fetchYahoo, TICKERS, MACRO_LIST } from '@/lib/providers/stocks';
import type { QuoteResult, TickerConfig } from '@/types/api';

export interface StockRow {
  config: TickerConfig;
  quote: QuoteResult | null;
}

export interface NewsItem {
  headline: string;
  source: string;
  datetime: number;
  url: string;
  summary: string;
}

export interface RecommendationTrend {
  period: string;
  buy: number;
  hold: number;
  sell: number;
  strongBuy: number;
  strongSell: number;
}

async function fetchStockRows(tickers: TickerConfig[]): Promise<StockRow[]> {
  const results = await Promise.allSettled(
    tickers.map((t) => fetchYahoo(t.sym)),
  );

  return tickers.map((config, idx) => {
    const result = results[idx];
    return {
      config,
      quote: result.status === 'fulfilled' ? result.value : null,
    };
  });
}

async function fetchMarketNews(): Promise<NewsItem[]> {
  try {
    const url = `https://finnhub.io/api/v1/news?category=general`;
    const res = await fetch(`/api/proxy/finnhub?url=${encodeURIComponent(url)}`);
    if (!res.ok) return [];
    const data: NewsItem[] = await res.json();
    return data.slice(0, 5);
  } catch {
    return [];
  }
}

async function fetchRecommendations(symbol: string): Promise<RecommendationTrend[]> {
  try {
    const url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${encodeURIComponent(symbol)}`;
    const res = await fetch(`/api/proxy/finnhub?url=${encodeURIComponent(url)}`);
    if (!res.ok) return [];
    const data: RecommendationTrend[] = await res.json();
    return data.slice(0, 4);
  } catch {
    return [];
  }
}

export function useStocks(tab: 'portfel' | 'makro') {
  const hydrated = useHydration();
  const tickers = tab === 'portfel' ? TICKERS : MACRO_LIST;

  return useQuery({
    queryKey: ['stocks', tab],
    queryFn: () => fetchStockRows(tickers),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 120 * 1000,
    enabled: hydrated,
  });
}

export function useMarketNews() {
  const hydrated = useHydration();

  return useQuery({
    queryKey: ['market-news'],
    queryFn: fetchMarketNews,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: hydrated,
  });
}

export function useRecommendations(symbol: string) {
  const hydrated = useHydration();

  return useQuery({
    queryKey: ['recommendations', symbol],
    queryFn: () => fetchRecommendations(symbol),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: hydrated && !!symbol,
  });
}

export { TICKERS, MACRO_LIST };
