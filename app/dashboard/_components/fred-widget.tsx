'use client';

import { useState } from 'react';
import { useFRED, FRED_TABS, type FREDSeriesData } from '@/lib/queries/use-fred';
import { Sparkline } from '@/components/widget-parts/sparkline';
import { WidgetTabs } from '@/components/widget-parts/widget-tabs';
import { LastUpdated } from '@/components/widget-parts/last-updated';

type FREDTab = 'usa' | 'rates' | 'markets';

function FREDSeriesRow({ series }: { series: FREDSeriesData }) {
  const isPositive = series.delta != null && series.delta > 0;
  const isNegative = series.delta != null && series.delta < 0;

  return (
    <div
      className="flex items-center gap-2 py-1.5"
      style={{ borderBottom: '1px solid var(--div)' }}
      aria-label={`${series.name}: ${series.current?.toFixed(2) ?? 'brak danych'}`}
    >
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div
          style={{
            fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)',
            color: 'var(--txm)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {series.name}
        </div>
        <div className="flex items-center gap-1">
          <span
            className="font-mono font-semibold"
            style={{ fontSize: 'clamp(0.65rem, 0.62rem + 0.14vw, 0.78rem)' }}
          >
            {series.current?.toFixed(2) ?? '--'}
          </span>
          {series.delta != null && (
            <span
              className="font-mono"
              style={{
                fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)',
                color: isPositive ? 'var(--nom)' : isNegative ? 'var(--az)' : 'var(--txm)',
              }}
            >
              {isPositive ? '+' : ''}{series.delta.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        {series.observations.length > 2 && (
          <Sparkline
            data={series.observations}
            width={70}
            height={22}
            ariaLabel={`Trend ${series.name} 12 miesiecy`}
          />
        )}
      </div>
    </div>
  );
}

export default function FREDWidget() {
  const [tab, setTab] = useState<FREDTab>('usa');
  const { data, isLoading, error, dataUpdatedAt } = useFRED();

  if (isLoading || !data) {
    return (
      <div className="widget" aria-label="Widget: FRED Makroekonomia">
        <div className="widget-header">FRED Makro</div>
        <div className="widget-body">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: '2.5rem', width: '100%', marginBottom: '0.5rem' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget" aria-label="Widget: FRED Makroekonomia">
        <div className="widget-header">FRED Makro</div>
        <div className="widget-body" style={{ color: 'var(--az)' }}>
          {error instanceof Error ? error.message : 'Blad ladowania danych FRED'}
        </div>
      </div>
    );
  }

  const filtered = data.filter((s) => s.group === tab);

  return (
    <div className="widget" aria-label="Widget: FRED Makroekonomia">
      <div className="widget-header">
        <span>FRED Makro</span>
        <span className="pill">{data.length} serii</span>
      </div>
      <div className="widget-body">
        <div style={{ marginBottom: '0.5rem' }}>
          <WidgetTabs tabs={FRED_TABS} activeTab={tab} onTabChange={setTab} />
        </div>

        <div className="max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div style={{ color: 'var(--txm)' }} className="text-center py-3">
              Brak danych dla tej kategorii. Sprawdz klucz API FRED.
            </div>
          ) : (
            filtered.map((series) => (
              <FREDSeriesRow key={series.seriesId} series={series} />
            ))
          )}
        </div>

        <LastUpdated timestamp={dataUpdatedAt || null} source="FRED API" />
      </div>
    </div>
  );
}
