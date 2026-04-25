'use client';

import { useQuery } from '@tanstack/react-query';
import { useHydration } from '@/hooks/useHydration';
import { DEFAULT_LOCATION } from '@/lib/config/location';

export interface AQSensorData {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number;
  aqi: number;
  hourlyPm25: number[];
  hourlyTime: string[];
}

/** US EPA AQI breakpoints for PM2.5 (24h average) */
function calcAQI(pm25: number): number {
  const breakpoints = [
    { lo: 0, hi: 12, aqiLo: 0, aqiHi: 50 },
    { lo: 12.1, hi: 35.4, aqiLo: 51, aqiHi: 100 },
    { lo: 35.5, hi: 55.4, aqiLo: 101, aqiHi: 150 },
    { lo: 55.5, hi: 150.4, aqiLo: 151, aqiHi: 200 },
    { lo: 150.5, hi: 250.4, aqiLo: 201, aqiHi: 300 },
    { lo: 250.5, hi: 500.4, aqiLo: 301, aqiHi: 500 },
  ];

  for (const bp of breakpoints) {
    if (pm25 >= bp.lo && pm25 <= bp.hi) {
      return Math.round(
        ((bp.aqiHi - bp.aqiLo) / (bp.hi - bp.lo)) * (pm25 - bp.lo) + bp.aqiLo,
      );
    }
  }
  return 500;
}

export function aqiCategory(aqi: number): { label: string; cls: 'ok' | 'warn' | 'crit'; color: string } {
  if (aqi <= 50) return { label: 'Dobra', cls: 'ok', color: '#4ade80' };
  if (aqi <= 100) return { label: 'Umiarkowana', cls: 'warn', color: '#facc15' };
  if (aqi <= 150) return { label: 'Niezdrowa (wrz.)', cls: 'warn', color: '#fb923c' };
  if (aqi <= 200) return { label: 'Niezdrowa', cls: 'crit', color: '#f87171' };
  if (aqi <= 300) return { label: 'Bardzo niezdrowa', cls: 'crit', color: '#a855f7' };
  return { label: 'Niebezpieczna', cls: 'crit', color: '#7f1d1d' };
}

export function pollutantBadge(value: number, thresholds: { good: number; moderate: number }): 'ok' | 'warn' | 'crit' {
  if (value <= thresholds.good) return 'ok';
  if (value <= thresholds.moderate) return 'warn';
  return 'crit';
}

async function fetchAirQuality(): Promise<AQSensorData> {
  const { latitude, longitude } = DEFAULT_LOCATION;
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,us_aqi',
    hourly: 'pm2_5',
    forecast_hours: '24',
  });

  const res = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`,
  );
  if (!res.ok) throw new Error('Air quality fetch failed');

  const data = await res.json();
  const cur = data.current;
  const pm25 = cur.pm2_5 ?? 0;

  return {
    pm25,
    pm10: cur.pm10 ?? 0,
    no2: cur.nitrogen_dioxide ?? 0,
    so2: cur.sulphur_dioxide ?? 0,
    o3: cur.ozone ?? 0,
    co: cur.carbon_monoxide ?? 0,
    aqi: cur.us_aqi ?? calcAQI(pm25),
    hourlyPm25: (data.hourly?.pm2_5 ?? []).filter((v: number | null) => v != null),
    hourlyTime: data.hourly?.time ?? [],
  };
}

export function useAirQuality() {
  const hydrated = useHydration();

  return useQuery({
    queryKey: ['air-quality', String(DEFAULT_LOCATION.latitude), String(DEFAULT_LOCATION.longitude)],
    queryFn: fetchAirQuality,
    staleTime: 15 * 60 * 1000, // 15 min — OpenAQ rate limits
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: hydrated,
  });
}
