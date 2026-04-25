'use client';

import { useEIA } from '@/lib/queries/use-eia';
import { Sparkline } from '@/components/widget-parts/sparkline';
import { MetricDisplay } from '@/components/widget-parts/metric-display';
import { LastUpdated } from '@/components/widget-parts/last-updated';

function EnergyMetric({
  label,
  value,
  unit,
  delta,
  deltaUnit,
}: {
  label: string;
  value: number | null;
  unit: string;
  delta: number | null;
  deltaUnit?: string;
}) {
  if (value == null) {
    return (
      <div className="rounded p-2" style={{ background: 'var(--soff)' }}>
        <div style={{ fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)' }}>
          {label}
        </div>
        <div className="font-mono" style={{ fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)', color: 'var(--txm)' }}>
          --
        </div>
      </div>
    );
  }

  const isUp = delta != null && delta > 0;
  const isDn = delta != null && delta < 0;

  return (
    <div
      className="rounded p-2"
      style={{ background: 'var(--soff)' }}
      aria-label={`${label}: ${value.toFixed(2)} ${unit}`}
    >
      <div style={{ fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)', marginBottom: '2px' }}>
        {label}
      </div>
      <div className="flex items-end gap-1">
        <span
          className="font-mono font-semibold"
          style={{ fontSize: 'clamp(0.7rem, 0.65rem + 0.2vw, 0.9rem)' }}
        >
          {value.toFixed(2)}
        </span>
        <span style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txm)' }}>
          {unit}
        </span>
      </div>
      {delta != null && (
        <div
          className="font-mono"
          style={{
            fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)',
            color: isUp ? 'var(--az)' : isDn ? 'var(--nom)' : 'var(--txm)',
            marginTop: '1px',
          }}
        >
          {isUp ? '\u2191' : isDn ? '\u2193' : ''}{Math.abs(delta).toFixed(3)} {deltaUnit ?? unit}
        </div>
      )}
    </div>
  );
}

export default function EIAWidget() {
  const { data, isLoading, error } = useEIA();

  if (isLoading || !data) {
    return (
      <div className="widget" aria-label="Widget: Energia EIA">
        <div className="widget-header">Energia</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '3rem', width: '100%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '3rem', width: '100%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '3rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget" aria-label="Widget: Energia EIA">
        <div className="widget-header">Energia</div>
        <div className="widget-body" style={{ color: 'var(--az)' }}>
          {error instanceof Error ? error.message : 'Blad ladowania danych EIA'}
        </div>
      </div>
    );
  }

  return (
    <div className="widget" aria-label="Widget: Energia EIA">
      <div className="widget-header">
        <span>Energia (EIA)</span>
      </div>
      <div className="widget-body">
        {/* Primary metric: Gasoline */}
        <div className="mb-3">
          <MetricDisplay
            value={data.gasoline.current?.toFixed(3) ?? '--'}
            label="Benzyna US avg"
            delta={data.gasoline.delta}
            deltaLabel=" $/gal WoW"
            unit="$/gal"
            size="md"
          />
        </div>

        {/* Grid: Crude + Nat Gas */}
        <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <EnergyMetric
            label="Brent Crude"
            value={data.crude.current}
            unit="$/bbl"
            delta={data.crude.previous != null && data.crude.current != null ? data.crude.current - data.crude.previous : null}
          />
          <EnergyMetric
            label="Gas ziemny (Henry Hub)"
            value={data.natGas.current}
            unit="$/MMBtu"
            delta={data.natGas.previous != null && data.natGas.current != null ? data.natGas.current - data.natGas.previous : null}
          />
        </div>

        {/* Crude sparkline */}
        {data.crude.history.length > 2 && (
          <div className="mt-2">
            <div style={{ fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)', marginBottom: '2px' }}>
              Brent Crude 30d
            </div>
            <Sparkline
              data={data.crude.history}
              width={240}
              height={28}
              color="var(--a2)"
              ariaLabel="Trend ceny ropy Brent 30 dni"
            />
          </div>
        )}

        {/* Electricity mix placeholder */}
        {data.electricityMix && (
          <div className="mt-2">
            <div style={{ fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)', marginBottom: '4px' }}>
              Mix energetyczny US
            </div>
            <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'var(--soff)' }}>
              <div style={{ width: `${data.electricityMix.coal}%`, background: '#6b7280' }} title={`Wegiel: ${data.electricityMix.coal}%`} />
              <div style={{ width: `${data.electricityMix.gas}%`, background: 'var(--a1)' }} title={`Gaz: ${data.electricityMix.gas}%`} />
              <div style={{ width: `${data.electricityMix.nuclear}%`, background: 'var(--cold)' }} title={`Atom: ${data.electricityMix.nuclear}%`} />
              <div style={{ width: `${data.electricityMix.renewables}%`, background: 'var(--nom)' }} title={`OZE: ${data.electricityMix.renewables}%`} />
            </div>
            <div
              className="flex gap-2 mt-1 flex-wrap"
              style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txm)' }}
            >
              <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ background: '#6b7280' }} />Wegiel {data.electricityMix.coal}%</span>
              <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ background: 'var(--a1)' }} />Gaz {data.electricityMix.gas}%</span>
              <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ background: 'var(--cold)' }} />Atom {data.electricityMix.nuclear}%</span>
              <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ background: 'var(--nom)' }} />OZE {data.electricityMix.renewables}%</span>
            </div>
          </div>
        )}

        <LastUpdated timestamp={data.fetchedAt} source="EIA API" />
      </div>
    </div>
  );
}
