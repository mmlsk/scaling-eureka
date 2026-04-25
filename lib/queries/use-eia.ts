'use client';

import { useQuery } from '@tanstack/react-query';
import { useHydration } from '@/hooks/useHydration';

export interface EIADataPoint {
  period: string;
  value: number;
}

export interface EIAOverview {
  gasoline: { current: number | null; previous: number | null; delta: number | null };
  crude: { current: number | null; previous: number | null; history: number[] };
  natGas: { current: number | null; previous: number | null };
  electricityMix: { coal: number; gas: number; nuclear: number; renewables: number } | null;
  fetchedAt: number;
}

async function fetchEIAData(endpoint: string, params: Record<string, string>): Promise<EIADataPoint[]> {
  const query = new URLSearchParams({
    ...params,
    length: '30',
    sort: JSON.stringify([{ column: 'period', direction: 'desc' }]),
  });

  const url = `https://api.eia.gov${endpoint}?${query.toString()}`;
  const res = await fetch(`/api/proxy/eia?url=${encodeURIComponent(url)}`);
  if (!res.ok) return [];

  const data = await res.json();
  return (data.response?.data ?? []).map((d: Record<string, unknown>) => ({
    period: String(d.period ?? ''),
    value: parseFloat(String(d.value ?? '0')),
  }));
}

async function fetchEIAOverview(): Promise<EIAOverview> {
  const [gasolineData, crudeData, natGasData] = await Promise.allSettled([
    fetchEIAData('/v2/petroleum/pri/gnd/data/', {
      'data[]': 'value',
      facets: JSON.stringify({ product: ['EPM0'], duoarea: ['NUS'] }),
      frequency: 'weekly',
    }),
    fetchEIAData('/v2/petroleum/pri/spt/data/', {
      'data[]': 'value',
      facets: JSON.stringify({ product: ['EPCBRENT'], duoarea: ['NUS'] }),
      frequency: 'daily',
    }),
    fetchEIAData('/v2/natural-gas/pri/sum/data/', {
      'data[]': 'value',
      facets: JSON.stringify({ process: ['PRS'], duoarea: ['NUS'] }),
      frequency: 'monthly',
    }),
  ]);

  const gasoline = gasolineData.status === 'fulfilled' ? gasolineData.value : [];
  const crude = crudeData.status === 'fulfilled' ? crudeData.value : [];
  const natGas = natGasData.status === 'fulfilled' ? natGasData.value : [];

  return {
    gasoline: {
      current: gasoline[0]?.value ?? null,
      previous: gasoline[1]?.value ?? null,
      delta: gasoline[0] && gasoline[1] ? gasoline[0].value - gasoline[1].value : null,
    },
    crude: {
      current: crude[0]?.value ?? null,
      previous: crude[1]?.value ?? null,
      history: crude.slice(0, 30).map((d) => d.value).reverse(),
    },
    natGas: {
      current: natGas[0]?.value ?? null,
      previous: natGas[1]?.value ?? null,
    },
    electricityMix: null, // Electricity mix requires a separate complex query
    fetchedAt: Date.now(),
  };
}

export function useEIA() {
  const hydrated = useHydration();

  return useQuery({
    queryKey: ['eia-energy'],
    queryFn: fetchEIAOverview,
    staleTime: 60 * 60 * 1000, // 1h — EIA data is weekly/monthly
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: hydrated,
  });
}
