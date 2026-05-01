'use client';

import { useState } from 'react';
import { weatherLabel, weatherIcon } from '@/lib/providers/weather';
import { DEFAULT_LOCATION } from '@/lib/config/location';
import { useWeather } from '@/lib/queries/use-weather';
import { Sparkline } from '@/components/widget-parts/sparkline';
import { MetricList } from '@/components/widget-parts/metric-list';
import { WidgetTabs } from '@/components/widget-parts/widget-tabs';
import { LastUpdated } from '@/components/widget-parts/last-updated';
import { WidgetShell } from '@/components/ui/widget-shell';
import { Badge } from '@/components/ui/badge';

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

  if (phase < 1.85) return { name: 'Now', icon: '🌑' };
  if (phase < 7.38) return { name: 'Rosnacy sierp', icon: '🌒' };
  if (phase < 9.23) return { name: 'I kwadra', icon: '🌓' };
  if (phase < 14.77) return { name: 'Rosnacy garb', icon: '🌔' };
  if (phase < 16.61) return { name: 'Pelnia', icon: '🌕' };
  if (phase < 22.15) return { name: 'Malejacy garb', icon: '🌖' };
  if (phase < 23.99) return { name: 'III kwadra', icon: '🌗' };
  if (phase < 27.68) return { name: 'Malejacy sierp', icon: '🌘' };
  return { name: 'Now', icon: '🌑' };
}

export default function WeatherWidget() {
  const [tab, setTab] = useState<WeatherTab>('teraz');
  const { data, isLoading, error } = useWeather();

  const actions = data ? (() => {
    const pm25 = data.airQuality?.current?.pm2_5 ?? null;
    const aq = pm25 != null ? aqBadge(pm25) : null;
    const uvVal = data.airQuality?.current?.uv_index ?? data.uvData?.uv ?? null;
    const uvInfo = uvVal != null ? uvSeverity(uvVal) : null;

    return (
      <div className="flex gap-1">
        {aq && (
          <Badge variant={aq.cls === 'ok' ? 'default' : aq.cls === 'warn' ? 'secondary' : 'destructive'}>
            AQ: {aq.label}
          </Badge>
        )}
        {uvInfo && (
          <Badge variant={uvInfo.cls === 'ok' ? 'default' : uvInfo.cls === 'warn' ? 'secondary' : 'destructive'}>
            UV: {uvVal!.toFixed(1)}
          </Badge>
        )}
      </div>
    );
  })() : undefined;

  return (
    <WidgetShell
      id="weather"
      title="Pogoda"
      isLoading={isLoading || !data}
      error={error?.message}
      actions={actions}
    >
      {(() => {
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
          <>
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
                      {Math.round(cur.temperature_2m)}°C
                    </div>
                    <div className="text-muted-foreground">
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
                    { label: 'Odczuwalna', value: `${Math.round(cur.apparent_temperature)}°C` },
                    { label: 'Wiatr', value: `${Math.round(cur.wind_speed_10m)} km/h` },
                    { label: 'Wilgotnosc', value: `${cur.relative_humidity_2m}%` },
                    { label: 'Cisnienie', value: `${Math.round(cur.surface_pressure)} hPa` },
                    ...(uvVal != null && uvInfo
                      ? [{ label: 'UV', value: uvVal.toFixed(1), badge: { text: uvInfo.label, cls: uvInfo.cls } as const }]
                      : []),
                  ]}
                />
                {weather.daily?.sunrise?.[0] && weather.daily?.sunset?.[0] && (
                  <div
                    className="flex justify-between mt-2 pt-2 border-t border-border text-muted-foreground"
                    style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)' }}
                  >
                    <span>☀️ {formatTime(weather.daily.sunrise[0])}</span>
                    <span>{dayLength(weather.daily.sunrise[0], weather.daily.sunset[0])}</span>
                    <span>🌙 {formatTime(weather.daily.sunset[0])}</span>
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
                      className="flex items-center justify-between py-0.5 border-b border-border text-muted-foreground"
                      style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)' }}
                    >
                      <span className="w-12">{formatTime(time)}</span>
                      <span>{weatherIcon(weather.hourly.weather_code[i] ?? 0)}</span>
                      <span className="font-mono w-10 text-right">
                        {Math.round(weather.hourly.temperature_2m[i] ?? 0)}°C
                      </span>
                      {weather.hourly.precipitation_probability?.[i] != null && (
                        <span className="text-blue-500 w-10 text-right">
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
                  const maxTemp = Math.round(weather.daily.temperature_2m_max[idx] ?? 0);
                  const minTemp = Math.round(weather.daily.temperature_2m_min[idx] ?? 0);
                  const range = maxTemp - minTemp;

                  return (
                    <div
                      key={date}
                      className="flex items-center gap-2 border-b border-border py-0.5"
                    >
                      <span
                        className="w-16 text-muted-foreground"
                        style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)' }}
                      >
                        {dayLabel}
                      </span>
                      <span className="w-6 text-center">{weatherIcon(code ?? 0)}</span>
                      <span
                        className="font-mono text-muted-foreground w-8 text-right"
                        style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)' }}
                      >
                        {minTemp}°
                      </span>
                      <div className="flex-1 h-1 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, range * 5)}%`,
                            background: 'linear-gradient(90deg, var(--cold), var(--a2))',
                          }}
                        />
                      </div>
                      <span
                        className="font-mono w-8 text-right"
                        style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)' }}
                      >
                        {maxTemp}°
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Astronomy */}
            {tab === 'astro' && (
              <div>
                {weather.daily?.sunrise?.[0] && weather.daily?.sunset?.[0] && (
                  <MetricList
                    items={[
                      { label: 'Wschod slonca', value: formatTime(weather.daily.sunrise[0]) },
                      { label: 'Zachod slonca', value: formatTime(weather.daily.sunset[0]) },
                      { label: 'Dlugosc dnia', value: dayLength(weather.daily.sunrise[0], weather.daily.sunset[0]) },
                    ]}
                  />
                )}
                <div className="mt-3 p-2 rounded text-center bg-muted">
                  {(() => {
                    const moon = moonPhaseForDate(new Date());
                    return (
                      <>
                        <div style={{ fontSize: '1.5rem' }}>{moon.icon}</div>
                        <div className="text-muted-foreground" style={{ fontSize: 'clamp(0.55rem, 0.52rem + 0.1vw, 0.65rem)' }}>
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
          </>
        );
      })()}
    </WidgetShell>
  );
}
