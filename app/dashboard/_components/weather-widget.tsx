'use client';

import { useState } from 'react';
import { weatherLabel, weatherIcon } from '@/lib/providers/weather';
import { DEFAULT_LOCATION } from '@/lib/config/location';
import { useWeather } from '@/lib/queries/use-weather';
import { Sparkline } from '@/components/widget-parts/sparkline';
import { MetricList } from '@/components/widget-parts/metric-list';
import { WidgetTabs } from '@/components/widget-parts/widget-tabs';
import { LastUpdated } from '@/components/widget-parts/last-updated';

type WeatherTab = 'teraz' | 'godziny' | 'tydzien' | 'astro';

function uvSeverity(uv: number): { label: string; cls: 'ok' | 'warn' | 'crit'; color: string } {
  if (uv <= 2) return { label: 'Niski', cls: 'ok', color: '#4ade80' };
  if (uv <= 5) return { label: 'Umiarkowany', cls: 'warn', color: '#facc15' };
  if (uv <= 7) return { label: 'Wysoki', cls: 'warn', color: '#fb923c' };
  if (uv <= 10) return { label: 'Bardzo wysoki', cls: 'crit', color: '#f87171' };
  return { label: 'Ekstremalny', cls: 'crit', color: '#a855f7' };
}

function aqBadge(pm25: number): { label: string; cls: 'ok' | 'warn' | 'crit' } {
  if (pm25 <= 25) return { label: 'Dobra', cls: 'ok' };
  if (pm25 <= 50) return { label: 'Umiarkowana', cls: 'warn' };
  return { label: 'Zla', cls: 'crit' };
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function dayLength(sunrise: string, sunset: string): string {
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  const diff = Math.floor((set - rise) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}min`;
}

function moonPhaseForDate(date: Date): { name: string; icon: string } {
  // Simplified moon phase calculation (synodic month = 29.53 days)
  const known = new Date('2000-01-06T12:00:00Z').getTime(); // Known new moon
  const diff = (date.getTime() - known) / (1000 * 60 * 60 * 24);
  const phase = ((diff % 29.53) + 29.53) % 29.53;

  if (phase < 1.85) return { name: 'Now', icon: '\uD83C\uDF11' };
  if (phase < 7.38) return { name: 'Rosnacy sierp', icon: '\uD83C\uDF12' };
  if (phase < 9.23) return { name: 'I kwadra', icon: '\uD83C\uDF13' };
  if (phase < 14.77) return { name: 'Rosnacy garb', icon: '\uD83C\uDF14' };
  if (phase < 16.61) return { name: 'Pelnia', icon: '\uD83C\uDF15' };
  if (phase < 22.15) return { name: 'Malejacy garb', icon: '\uD83C\uDF16' };
  if (phase < 23.99) return { name: 'III kwadra', icon: '\uD83C\uDF17' };
  if (phase < 27.68) return { name: 'Malejacy sierp', icon: '\uD83C\uDF18' };
  return { name: 'Now', icon: '\uD83C\uDF11' };
}

export default function WeatherWidget() {
  const [tab, setTab] = useState<WeatherTab>('teraz');
  const { data, isLoading, error } = useWeather();

  if (isLoading || !data) {
    return (
      <div className="widget" aria-label="Widget: Pogoda">
        <div className="widget-header">Pogoda</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '2rem', width: '40%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '0.75rem', width: '80%', marginBottom: '0.25rem' }} />
          <div className="skeleton" style={{ height: '0.75rem', width: '60%' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget" aria-label="Widget: Pogoda">
        <div className="widget-header">Pogoda</div>
        <div className="widget-body" style={{ color: 'var(--az)' }}>
          {error instanceof Error ? error.message : 'Blad ladowania pogody'}
        </div>
      </div>
    );
  }

  const { weather, airQuality, uvData, fetchedAt } = data;
  const cur = weather.current;
  const uvVal = airQuality?.current?.uv_index ?? uvData?.uv ?? null;
  const uvInfo = uvVal != null ? uvSeverity(uvVal) : null;
  const pm25 = airQuality?.current?.pm2_5 ?? null;
  const aq = pm25 != null ? aqBadge(pm25) : null;

  const TABS: { key: WeatherTab; label: string }[] = [
    { key: 'teraz', label: 'Teraz' },
    { key: 'godziny', label: '12h' },
    { key: 'tydzien', label: '7 dni' },
    { key: 'astro', label: 'Astro' },
  ];

  return (
    <div className="widget" aria-label="Widget: Pogoda">
      <div className="widget-header">
        <span>Pogoda {DEFAULT_LOCATION.city}</span>
        <div className="flex gap-1">
          {aq && <span className={`pill ${aq.cls}`}>AQ: {aq.label}</span>}
          {uvInfo && <span className={`pill ${uvInfo.cls}`}>UV: {uvVal!.toFixed(1)}</span>}
        </div>
      </div>
      <div className="widget-body">
        {/* Tabs */}
        <div style={{ marginBottom: '0.5rem' }}>
          <WidgetTabs tabs={TABS} activeTab={tab} onTabChange={setTab} />
        </div>

        {/* Tab: Teraz */}
        {tab === 'teraz' && (
          <>
            <div className="flex items-start gap-3 mb-3">
              <div>
                <div
                  className="font-mono font-bold"
                  style={{ fontSize: 'clamp(1.4rem, 1.2rem + 1vw, 2rem)' }}
                >
                  {Math.round(cur.temperature_2m)}\u00B0C
                </div>
                <div style={{ color: 'var(--txm)' }}>
                  {weatherIcon(cur.weather_code)} {weatherLabel(cur.weather_code)}
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                {weather.hourly && (
                  <Sparkline
                    data={weather.hourly.temperature_2m.slice(0, 12)}
                    width={80}
                    height={28}
                    ariaLabel="Temperatura na najblizsze 12 godzin"
                  />
                )}
              </div>
            </div>
            <MetricList
              items={[
                { label: 'Odczuwalna', value: `${Math.round(cur.apparent_temperature)}\u00B0C` },
                { label: 'Wiatr', value: `${Math.round(cur.wind_speed_10m)} km/h` },
                { label: 'Wilgotnosc', value: `${cur.relative_humidity_2m}%` },
                { label: 'Cisnienie', value: `${Math.round(cur.surface_pressure)} hPa` },
                ...(uvVal != null
                  ? [{ label: 'UV', value: uvVal.toFixed(1), badge: uvInfo ? { text: uvInfo.label, cls: uvInfo.cls } as const : undefined }]
                  : []),
              ]}
            />
            {weather.daily?.sunrise?.[0] && weather.daily?.sunset?.[0] && (
              <div
                className="flex justify-between mt-2 pt-2"
                style={{ borderTop: '1px solid var(--div)', fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)', color: 'var(--txm)' }}
              >
                <span>\u2600\uFE0F {formatTime(weather.daily.sunrise[0])}</span>
                <span>{dayLength(weather.daily.sunrise[0], weather.daily.sunset[0])}</span>
                <span>\uD83C\uDF19 {formatTime(weather.daily.sunset[0])}</span>
              </div>
            )}
          </>
        )}

        {/* Tab: 12h forecast */}
        {tab === 'godziny' && weather.hourly && (
          <div>
            <div className="mb-2">
              <Sparkline
                data={weather.hourly.temperature_2m.slice(0, 12)}
                width={260}
                height={40}
                ariaLabel="Prognoza temperatury na 12 godzin"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {weather.hourly.time.slice(0, 12).map((time, i) => (
                <div
                  key={time}
                  className="flex items-center justify-between py-0.5"
                  style={{ borderBottom: '1px solid var(--div)', fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)' }}
                >
                  <span style={{ color: 'var(--txm)', width: '3rem' }}>
                    {formatTime(time)}
                  </span>
                  <span>{weatherIcon(weather.hourly.weather_code[i])}</span>
                  <span className="font-mono" style={{ width: '2.5rem', textAlign: 'right' }}>
                    {Math.round(weather.hourly.temperature_2m[i])}\u00B0C
                  </span>
                  {weather.hourly.precipitation_probability?.[i] != null && (
                    <span style={{ color: 'var(--cold)', width: '2.5rem', textAlign: 'right' }}>
                      {weather.hourly.precipitation_probability[i]}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: 7-day forecast */}
        {tab === 'tydzien' && (
          <div className="space-y-1">
            {weather.daily.time.map((date, idx) => {
              const dayLabel = new Date(date).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' });
              const code = weather.daily.weather_code[idx];
              const maxTemp = Math.round(weather.daily.temperature_2m_max[idx]);
              const minTemp = Math.round(weather.daily.temperature_2m_min[idx]);
              const range = maxTemp - minTemp;

              return (
                <div
                  key={date}
                  className="flex items-center gap-2"
                  style={{ borderBottom: '1px solid var(--div)', padding: '3px 0' }}
                >
                  <span
                    style={{ width: '4rem', fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)', color: 'var(--txm)' }}
                  >
                    {dayLabel}
                  </span>
                  <span style={{ width: '1.5rem', textAlign: 'center' }}>
                    {weatherIcon(code)}
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)', color: 'var(--txm)', width: '2rem', textAlign: 'right' }}
                  >
                    {minTemp}\u00B0
                  </span>
                  <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--soff)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, range * 5)}%`,
                        background: 'linear-gradient(90deg, var(--cold), var(--a2))',
                      }}
                    />
                  </div>
                  <span
                    className="font-mono"
                    style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)', width: '2rem' }}
                  >
                    {maxTemp}\u00B0
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Astronomy */}
        {tab === 'astro' && (
          <div>
            {weather.daily?.sunrise?.[0] && (
              <MetricList
                items={[
                  { label: 'Wschod slonca', value: formatTime(weather.daily.sunrise[0]) },
                  { label: 'Zachod slonca', value: formatTime(weather.daily.sunset[0]) },
                  { label: 'Dlugosc dnia', value: dayLength(weather.daily.sunrise[0], weather.daily.sunset[0]) },
                ]}
              />
            )}
            <div
              className="mt-3 p-2 rounded text-center"
              style={{ background: 'var(--soff)' }}
            >
              {(() => {
                const moon = moonPhaseForDate(new Date());
                return (
                  <>
                    <div style={{ fontSize: '1.5rem' }}>{moon.icon}</div>
                    <div style={{ fontSize: 'clamp(0.55rem, 0.52rem + 0.1vw, 0.65rem)', color: 'var(--txm)' }}>
                      {moon.name}
                    </div>
                  </>
                );
              })()}
            </div>
            {uvData && (
              <MetricList
                className="mt-2"
                items={[
                  { label: 'UV teraz', value: uvData.uv.toFixed(1), badge: { text: uvSeverity(uvData.uv).label, cls: uvSeverity(uvData.uv).cls } },
                  { label: 'UV max dzis', value: uvData.uv_max.toFixed(1) },
                ]}
              />
            )}
          </div>
        )}

        <LastUpdated timestamp={fetchedAt} source="Open-Meteo" />
      </div>
    </div>
  );
}
