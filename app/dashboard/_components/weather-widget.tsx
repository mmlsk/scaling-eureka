'use client';

import { useQuery } from '@tanstack/react-query';
import { useHydration } from '@/hooks/useHydration';
import { weatherLabel, weatherIcon } from '@/lib/providers/weather';
import { DEFAULT_LOCATION } from '@/lib/config/location';
import type { WeatherData, AirQuality, UVData } from '@/types/state';

interface WeatherResult {
  weather: WeatherData;
  airQuality: AirQuality | null;
  uvData: UVData | null;
}

function aqBadge(pm25: number): { label: string; cls: string } {
  if (pm25 <= 25) return { label: 'Dobra', cls: 'ok' };
  if (pm25 <= 50) return { label: 'Umiarkowana', cls: 'warn' };
  return { label: 'Zła', cls: 'crit' };
}

function uvBadge(uv: number): { label: string; cls: string } {
  if (uv <= 2) return { label: 'Niski', cls: 'ok' };
  if (uv <= 5) return { label: 'Umiarkowany', cls: 'warn' };
  return { label: 'Wysoki', cls: 'crit' };
}

async function fetchWeatherData(): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: String(DEFAULT_LOCATION.latitude),
    longitude: String(DEFAULT_LOCATION.longitude),
    timezone: DEFAULT_LOCATION.timezone,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: '7',
  });

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

  if (!weatherRes.ok) throw new Error('Weather fetch failed');
  const weather: WeatherData = await weatherRes.json();

  // Try air quality (non-blocking)
  let airQuality: AirQuality | null = null;
  let uvData: UVData | null = null;
  try {
    const aqParams = new URLSearchParams({
      latitude: String(DEFAULT_LOCATION.latitude),
      longitude: String(DEFAULT_LOCATION.longitude),
      current: 'pm2_5,pm10,uv_index',
    });
    const aqRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${aqParams.toString()}`,
    );
    if (aqRes.ok) {
      const aqData = await aqRes.json() as { current: { pm2_5: number; pm10: number; uv_index: number } };
      airQuality = {
        pm25: aqData.current.pm2_5,
        pm10: aqData.current.pm10,
        uv: aqData.current.uv_index,
      };
      uvData = { uv: airQuality.uv, uvMax: airQuality.uv };
    }
  } catch {
    // AQ optional
  }

  return { weather, airQuality, uvData };
}

export default function WeatherWidget() {
  const hydrated = useHydration();

  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', String(DEFAULT_LOCATION.latitude), String(DEFAULT_LOCATION.longitude)],
    queryFn: fetchWeatherData,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: hydrated,
  });

  if (!hydrated || isLoading) {
    return (
      <div className="widget">
        <div className="widget-header">Pogoda</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '2rem', width: '40%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '0.75rem', width: '80%', marginBottom: '0.25rem' }} />
          <div className="skeleton" style={{ height: '0.75rem', width: '60%', marginBottom: '0.5rem' }} />
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="skeleton" style={{ height: '2.5rem', flex: 1 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="widget">
        <div className="widget-header">Pogoda</div>
        <div className="widget-body" style={{ color: 'var(--az)' }}>
          {error instanceof Error ? error.message : 'Brak danych pogodowych'}
        </div>
      </div>
    );
  }

  const { weather, airQuality, uvData } = data;
  const cur = weather.current;

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Pogoda {DEFAULT_LOCATION.city}</span>
        <div className="flex gap-1">
          {airQuality && (
            <span className={`pill ${aqBadge(airQuality.pm25).cls}`}>
              AQ: {aqBadge(airQuality.pm25).label}
            </span>
          )}
          {uvData && (
            <span className={`pill ${uvBadge(uvData.uv).cls}`}>
              UV: {uvData.uv.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="widget-body">
        {/* Current conditions */}
        <div className="flex items-start gap-3 mb-3">
          <div>
            <div
              className="font-mono font-bold"
              style={{ fontSize: 'clamp(1.4rem, 1.2rem + 1vw, 2rem)' }}
            >
              {Math.round(cur.temperature_2m)}°C
            </div>
            <div style={{ color: 'var(--txm)' }}>
              {weatherIcon(cur.weather_code)} {weatherLabel(cur.weather_code)}
            </div>
          </div>
          <div className="space-y-0.5 ml-auto text-right" style={{ color: 'var(--txm)' }}>
            <div>Odczuwalna: {Math.round(cur.apparent_temperature)}°C</div>
            <div>Wiatr: {Math.round(cur.wind_speed_10m)} km/h</div>
            <div>Wilgotność: {cur.relative_humidity_2m}%</div>
          </div>
        </div>

        {/* 5-day forecast */}
        <div className="flex gap-1">
          {weather.daily.time.slice(1, 6).map((date, idx) => {
            const dayLabel = new Date(date).toLocaleDateString('pl-PL', { weekday: 'short' });
            const code = weather.daily.weather_code[idx + 1];
            const maxTemp = Math.round(weather.daily.temperature_2m_max[idx + 1]);
            const minTemp = Math.round(weather.daily.temperature_2m_min[idx + 1]);

            return (
              <div
                key={date}
                className="flex-1 text-center rounded p-1"
                style={{ background: 'var(--soff)' }}
              >
                <div className="text-[clamp(0.45rem,0.43rem+0.08vw,0.55rem)]" style={{ color: 'var(--txm)' }}>
                  {dayLabel}
                </div>
                <div className="text-[clamp(0.6rem,0.58rem+0.12vw,0.72rem)]">
                  {weatherIcon(code)}
                </div>
                <div className="font-mono text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]">
                  <span>{maxTemp}°</span>
                  <span style={{ color: 'var(--txm)' }}>/{minTemp}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
