'use client';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color,
  fillOpacity = 0.1,
  strokeWidth = 1.5,
  className,
  ariaLabel,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 1;

  const isUp = data.length > 0 && data[data.length - 1]! >= data[0]!;
  const strokeColor = color ?? (isUp ? 'var(--nom)' : 'var(--az)');

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = padding + (1 - (v - min) / range) * (height - 2 * padding);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const fillPath = points.length > 0
    ? `${linePath} L${points[points.length - 1]!.x},${height} L${points[0]!.x},${height} Z`
    : '';

  return (
    <svg
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={ariaLabel ?? 'Wykres trendu'}
      style={{ flexShrink: 0 }}
    >
      {fillOpacity > 0 && (
        <path d={fillPath} fill={strokeColor} opacity={fillOpacity} />
      )}
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
    </svg>
  );
}
