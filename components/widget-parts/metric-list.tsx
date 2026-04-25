'use client';

export interface MetricItem {
  label: string;
  value: string | number;
  badge?: { text: string; cls: 'ok' | 'warn' | 'crit' };
  color?: string;
}

interface MetricListProps {
  items: MetricItem[];
  className?: string;
}

export function MetricList({ items, className }: MetricListProps) {
  if (items.length === 0) return null;

  return (
    <div className={className}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between items-center py-1"
          style={{ borderBottom: '1px solid var(--div)' }}
        >
          <span
            style={{
              fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)',
              color: 'var(--txm)',
            }}
          >
            {item.label}
          </span>
          <div className="flex items-center gap-1">
            <span
              className="font-mono"
              style={{
                fontSize: 'clamp(0.55rem, 0.52rem + 0.1vw, 0.65rem)',
                color: item.color ?? 'var(--tx)',
              }}
            >
              {item.value}
            </span>
            {item.badge && (
              <span className={`pill ${item.badge.cls}`}>{item.badge.text}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
