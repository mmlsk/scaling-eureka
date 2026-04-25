'use client';

import { useState, useEffect } from 'react';

interface LastUpdatedProps {
  timestamp: number | Date | null;
  source?: string;
}

function formatRelativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return 'teraz';
  if (diff < 60) return `${diff}s temu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h temu`;
  return `${Math.floor(diff / 86400)}d temu`;
}

export function LastUpdated({ timestamp, source }: LastUpdatedProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timestamp) return;
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, [timestamp]);

  if (!timestamp) return null;

  const ts = timestamp instanceof Date ? timestamp.getTime() : timestamp;

  return (
    <div
      className="flex items-center justify-between"
      style={{
        fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)',
        color: 'var(--txf)',
        marginTop: '0.5rem',
        paddingTop: '0.25rem',
        borderTop: '1px solid var(--div)',
      }}
      aria-label={`Ostatnia aktualizacja: ${formatRelativeTime(ts)}`}
    >
      <span>{formatRelativeTime(ts)}</span>
      {source && <span>{source}</span>}
    </div>
  );
}
