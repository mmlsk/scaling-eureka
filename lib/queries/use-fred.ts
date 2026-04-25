'use client';

import { useQuery } from '@tanstack/react-query';
import { useHydration } from '@/hooks/useHydration';

export interface FREDSeries {
  id: string;
  name: string;
  group: 'usa' | 'rates' | 'markets';
}

export interface FREDObservation {
  date: string;
  value: string;
}

export interface FREDSeriesData {
  seriesId: string;
  name: string;
  group: 'usa' | 'rates' | 'markets';
  current: number | null;
  previous: number | null;
  delta: number | null;
  observations: number[];
  dates: string[];
}

export const FRED_SERIES: FREDSeries[] = [
  { id: 'CPIAUCSL', name: 'CPI (Inflacja)', group: 'usa' },
  { id: 'UNRATE', name: 'Bezrobocie', group: 'usa' },
  { id: 'GDP', name: 'PKB', group: 'usa' },
  { id: 'FEDFUNDS', name: 'Fed Funds Rate', group: 'rates' },
  { id: 'DGS10', name: '10Y Treasury', group: 'rates' },
  { id: 'VIXCLS', name: 'VIX', group: 'markets' },
];

export const FRED_TABS: { key: 'usa' | 'rates' | 'markets'; label: string }[] = [
  { key: 'usa', label: 'USA Makro' },
  { key: 'rates', label: 'Stopy' },
  { key: 'markets', label: 'Rynki' },
];

async function fetchFREDSeries(seriesId: string): Promise<FREDObservation[]> {
  const now = new Date();
  const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const from = yearAgo.toISOString().split('T')[0];
  const to = now.toISOString().split('T')[0];

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&observation_start=${from}&observation_end=${to}&file_type=json&sort_order=desc&limit=60`;
  const res = await fetch(`/api/proxy/fred?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`FRED fetch failed for ${seriesId}`);

  const data = await res.json();
  return (data.observations ?? []) as FREDObservation[];
}

async function fetchAllFRED(): Promise<FREDSeriesData[]> {
  const results = await Promise.allSettled(
    FRED_SERIES.map(async (series) => {
      const observations = await fetchFREDSeries(series.id);
      const validObs = observations
        .filter((o) => o.value !== '.')
        .reverse();

      const values = validObs.map((o) => parseFloat(o.value));
      const dates = validObs.map((o) => o.date);
      const current = values.length > 0 ? values[values.length - 1] : null;
      const previous = values.length > 1 ? values[values.length - 2] : null;
      const delta = current != null && previous != null ? current - previous : null;

      return {
        seriesId: series.id,
        name: series.name,
        group: series.group,
        current,
        previous,
        delta,
        observations: values.slice(-12),
        dates: dates.slice(-12),
      };
    }),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<FREDSeriesData> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export function useFRED() {
  const hydrated = useHydration();

  return useQuery({
    queryKey: ['fred-macro'],
    queryFn: fetchAllFRED,
    staleTime: 60 * 60 * 1000, // 1h — FRED data updates infrequently
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: hydrated,
  });
}
