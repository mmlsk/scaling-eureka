'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { weatherLabel, weatherIcon } from '@/lib/providers/weather';
import type { WeatherData, AirQuality, UVData, IMGWAlert } from '@/types/state';

interface WeatherState {
  weather: WeatherData | null;
  airQuality: AirQuality | null;
  uvData: UVData | null;
  alerts: IMGWAlert[];
  loading: boolean;
  error: string | null;
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

export default function WeatherWidget() {
  const hydrated = useHydration();
  const [state, setState] = useState<WeatherState>({
    weather: null,
    airQuality: null,
    uvData: null,
    alerts: [],
    loading: true,
    error: null,
  });

  const fetchWeatherData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        latitude: '53.43',
        longitude: '14.55',
        timezone: 'Europe/Warsaw',
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        forecast_days: '7',
      });

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      );

      if (!weatherRes.ok) throw new Error('Weather fetch failed');
      const weatherData: WeatherData = await weatherRes.json();

      // Try air quality (non-blocking)
      let aq: AirQuality | null = null;
      try {
        const aqParams = new URLSearchParams({
          latitude: '53.43',
          longitude: '14.55',
          current: 'pm2_5,pm10,uv_index',
        });
        const aqRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?${aqParams.toString()}`,
        );
        if (aqRes.ok) {
          const aqData = await aqRes.json() as { current: { pm2_5: number; pm10: number; uv_index: number } };
          aq = {
            pm25: aqData.current.pm2_5,
            pm10: aqData.current.pm10,
            uv: aqData.current.uv_index,
          };
        }
      } catch {
        // AQ optional
      }

      setState({
        weather: weatherData,
        airQuality: aq,
        uvData: aq ? { uv: aq.uv, uvMax: aq.uv } : null,
        alerts: [],
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      void fetchWeatherData();
    }
  }, [hydrated, fetchWeatherData]);

  if (!hydrated || state.loading) {
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

  if (state.error || !state.weather) {
    return (
      <div className="widget">
        <div className="widget-header">Pogoda</div>
        <div className="widget-body" style={{ color: 'var(--az)' }}>
          {state.error ?? 'Brak danych pogodowych'}
        </div>
      </div>
    );
  }

  const { weather, airQuality, uvData, alerts } = state;
  const cur = weather.current;

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Pogoda Szczecin</span>
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
        {/* IMGW Alerts Banner */}
        {alerts.length > 0 && (
          <div
            className="rounded p-2 mb-2 text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]"
            style={{ background: 'rgba(194,49,39,0.12)', color: 'var(--az)' }}
          >
            {alerts.map((alert, idx) => (
              <div key={idx}>{alert.phenomena ?? alert.description ?? 'Alert IMGW'}</div>
            ))}
          </div>
        )}

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
