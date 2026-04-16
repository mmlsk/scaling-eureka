'use client';

interface CalcCardProps {
  title: string;
  version: string;
  formula: string;
  children: React.ReactNode;
}

export function CalcCard({ title, version, formula, children }: CalcCardProps) {
  return (
    <div className="widget">
      <div className="widget-header">
        <span>{title}</span>
        <span className="calc-badge ok" title={`${formula} v${version}`}>
          v{version}
        </span>
      </div>
      <div
        style={{
          fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)',
          color: 'var(--txm)',
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        {formula}
      </div>
      <div className="widget-body">{children}</div>
    </div>
  );
}
