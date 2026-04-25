'use client';

import { useQuery } from '@tanstack/react-query';
import { useHydration } from '@/hooks/useHydration';
import { DEFAULT_LOCATION } from '@/lib/config/location';

export interface WeatherCurrent {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
  surface_pressure: number;
}

export interface WeatherHourly {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability: number[];
}

export interface WeatherDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
}

export interface WeatherExtended {
  current: WeatherCurrent;
  hourly: WeatherHourly;
  daily: WeatherDaily;
}

export interface AirQualityExtended {
  current: {
    pm2_5: number;
    pm10: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    ozone: number;
    carbon_monoxide: number;
    us_aqi: number;
    uv_index: number;
  };
  hourly: {
    time: string[];
    pm2_5: number[];
  };
}

export interface UVExtended {
  uv: number;
  uv_max: number;
  safe_exposure_time: Record<string, number | null>;
  sun_info: {
    sun_times: {
      sunrise: string;
      sunset: string;
    };
  };
}

interface WeatherResult {
  weather: WeatherExtended;
  airQuality: AirQualityExtended | null;
  uvData: UVExtended | null;
  fetchedAt: number;
}

async function fetchExtendedWeather(): Promise<WeatherResult> {
  const { latitude, longitude, timezone } = DEFAULT_LOCATION;

  // Fetch extended weather data with hourly + daily + pressure
  const weatherParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    forecast_days: '7',
    forecast_hours: '12',
  });

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`,
  );
  if (!weatherRes.ok) throw new Error('Weather fetch failed');
  const weather: WeatherExtended = await weatherRes.json();

  // Fetch extended air quality
  let airQuality: AirQualityExtended | null = null;
  try {
    const aqParams = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,us_aqi,uv_index',
      hourly: 'pm2_5',
      forecast_hours: '24',
    });
    const aqRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${aqParams.toString()}`,
    );
    if (aqRes.ok) {
      airQuality = await aqRes.json();
    }
  } catch {
    // AQ optional
  }

  // Fetch UV via OpenUV proxy
  let uvData: UVExtended | null = null;
  try {
    const uvUrl = `https://api.openuv.io/api/v1/uv?lat=${latitude}&lng=${longitude}`;
    const uvRes = await fetch(`/api/proxy/openuv?url=${encodeURIComponent(uvUrl)}`);
    if (uvRes.ok) {
      const uvJson = await uvRes.json();
      uvData = uvJson.result ?? null;
    }
  } catch {
    // UV optional
  }

  return { weather, airQuality, uvData, fetchedAt: Date.now() };
}

export function useWeather() {
  const hydrated = useHydration();

  return useQuery({
    queryKey: ['weather-extended', String(DEFAULT_LOCATION.latitude), String(DEFAULT_LOCATION.longitude)],
    queryFn: fetchExtendedWeather,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: hydrated,
  });
}
