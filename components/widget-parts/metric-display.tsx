'use client';

interface MetricDisplayProps {
  value: string | number;
  label: string;
  delta?: number | null;
  deltaLabel?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MetricDisplay({
  value,
  label,
  delta,
  deltaLabel,
  unit,
  size = 'md',
}: MetricDisplayProps) {
  const fontSize =
    size === 'lg'
      ? 'clamp(1.4rem, 1.2rem + 1vw, 2rem)'
      : size === 'md'
        ? 'clamp(1rem, 0.9rem + 0.5vw, 1.4rem)'
        : 'clamp(0.75rem, 0.7rem + 0.3vw, 1rem)';

  const isPositive = delta != null && delta > 0;
  const isNegative = delta != null && delta < 0;

  return (
    <div className="metric-display" aria-label={`${label}: ${value}${unit ?? ''}`}>
      <div
        className="font-mono font-bold"
        style={{ fontSize, color: 'var(--tx)', lineHeight: 1.1 }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: '0.6em',
              color: 'var(--txm)',
              marginLeft: '2px',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      <div
        className="flex items-center gap-1"
        style={{ marginTop: '2px' }}
      >
        <span
          style={{
            fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)',
            color: 'var(--txm)',
          }}
        >
          {label}
        </span>
        {delta != null && (
          <span
            className="font-mono"
            style={{
              fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)',
              color: isPositive
                ? 'var(--nom)'
                : isNegative
                  ? 'var(--az)'
                  : 'var(--txm)',
            }}
          >
            {isPositive ? '+' : ''}
            {typeof delta === 'number' ? delta.toFixed(2) : delta}
            {deltaLabel ?? '%'}
          </span>
        )}
      </div>
    </div>
  );
}
