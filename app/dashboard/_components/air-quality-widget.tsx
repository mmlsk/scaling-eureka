'use client';

import { useAirQuality, aqiCategory, pollutantBadge } from '@/lib/queries/use-air-quality';
import { DEFAULT_LOCATION } from '@/lib/config/location';
import { Sparkline } from '@/components/widget-parts/sparkline';
import { LastUpdated } from '@/components/widget-parts/last-updated';

function AQIGauge({ aqi }: { aqi: number }) {
  const cat = aqiCategory(aqi);
  const pct = Math.min(100, (aqi / 500) * 100);

  return (
    <div aria-label={`Indeks jakosci powietrza: ${aqi} - ${cat.label}`}>
      <div className="flex items-end gap-2 mb-1">
        <span
          className="font-mono font-bold"
          style={{ fontSize: 'clamp(1.2rem, 1rem + 0.8vw, 1.8rem)', color: cat.color }}
        >
          {aqi}
        </span>
        <span className={`pill ${cat.cls}`}>{cat.label}</span>
      </div>
      <div
        className="h-1.5 rounded-full w-full"
        style={{ background: 'var(--soff)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: cat.color }}
        />
      </div>
      <div
        className="flex justify-between mt-0.5"
        style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txf)' }}
      >
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>200</span>
        <span>500</span>
      </div>
    </div>
  );
}

export default function AirQualityWidget() {
  const { data, isLoading, error } = useAirQuality();

  if (isLoading || !data) {
    return (
      <div className="widget" aria-label="Widget: Jakosc powietrza">
        <div className="widget-header">Jakosc powietrza</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '2rem', width: '40%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '0.75rem', width: '100%', marginBottom: '0.25rem' }} />
          <div className="skeleton" style={{ height: '3rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget" aria-label="Widget: Jakosc powietrza">
        <div className="widget-header">Jakosc powietrza</div>
        <div className="widget-body" style={{ color: 'var(--az)' }}>
          {error instanceof Error ? error.message : 'Blad ladowania danych'}
        </div>
      </div>
    );
  }

  const pollutants: {
    key: string;
    label: string;
    value: number;
    unit: string;
    thresholds: { good: number; moderate: number };
  }[] = [
    { key: 'pm25', label: 'PM2.5', value: data.pm25, unit: '\u00B5g/m\u00B3', thresholds: { good: 15, moderate: 35 } },
    { key: 'pm10', label: 'PM10', value: data.pm10, unit: '\u00B5g/m\u00B3', thresholds: { good: 45, moderate: 100 } },
    { key: 'no2', label: 'NO\u2082', value: data.no2, unit: '\u00B5g/m\u00B3', thresholds: { good: 25, moderate: 50 } },
    { key: 'so2', label: 'SO\u2082', value: data.so2, unit: '\u00B5g/m\u00B3', thresholds: { good: 40, moderate: 80 } },
    { key: 'o3', label: 'O\u2083', value: data.o3, unit: '\u00B5g/m\u00B3', thresholds: { good: 60, moderate: 120 } },
    { key: 'co', label: 'CO', value: data.co, unit: '\u00B5g/m\u00B3', thresholds: { good: 4000, moderate: 10000 } },
  ];

  return (
    <div className="widget" aria-label="Widget: Jakosc powietrza">
      <div className="widget-header">
        <span>Jakosc powietrza {DEFAULT_LOCATION.city}</span>
      </div>
      <div className="widget-body">
        {/* AQI Gauge */}
        <AQIGauge aqi={data.aqi} />

        {/* PM2.5 sparkline */}
        {data.hourlyPm25.length > 2 && (
          <div className="mt-3 mb-2">
            <div style={{ fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)', marginBottom: '2px' }}>
              PM2.5 ostatnie 24h
            </div>
            <Sparkline
              data={data.hourlyPm25}
              width={240}
              height={28}
              color="var(--a1)"
              ariaLabel="Trend PM2.5 z ostatnich 24 godzin"
            />
          </div>
        )}

        {/* Pollutants grid */}
        <div
          className="grid gap-1 mt-2"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
        >
          {pollutants.map((p) => {
            const badge = pollutantBadge(p.value, p.thresholds);
            return (
              <div
                key={p.key}
                className="rounded p-1.5 text-center"
                style={{ background: 'var(--soff)' }}
                aria-label={`${p.label}: ${p.value.toFixed(1)} ${p.unit}`}
              >
                <div
                  style={{
                    fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)',
                    color: 'var(--txm)',
                    marginBottom: '1px',
                  }}
                >
                  {p.label}
                </div>
                <div
                  className="font-mono font-semibold"
                  style={{ fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)' }}
                >
                  {p.value.toFixed(1)}
                </div>
                <div className={`pill ${badge}`} style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)' }}>
                  {badge === 'ok' ? 'WHO OK' : badge === 'warn' ? 'Uwaga' : 'Przekr.'}
                </div>
              </div>
            );
          })}
        </div>

        <LastUpdated timestamp={Date.now()} source="Open-Meteo AQ" />
      </div>
    </div>
  );
}
