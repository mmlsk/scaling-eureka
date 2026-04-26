'use client';

import { type ReactNode } from 'react';

interface WidgetShellProps {
  id: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  dragHandleProps?: Record<string, unknown>;
}

export function WidgetShell({
  id,
  title,
  children,
  actions,
  isLoading,
  error,
  className,
  dragHandleProps,
}: WidgetShellProps) {
  return (
    <article
      className={`widget ${className ?? ''}`}
      aria-label={`Widget: ${title}`}
      data-widget-id={id}
    >
      <header className="widget-header">
        <button
          type="button"
          className="widget-drag-handle"
          aria-label={`Przesuń widget: ${title}`}
          {...dragHandleProps}
        >
          <span aria-hidden="true">⋮⋮</span>
        </button>
        <h3 className="widget-title">{title}</h3>
        {actions && <div className="widget-actions">{actions}</div>}
      </header>
      <div className="widget-body" role="region" aria-busy={isLoading || undefined}>
        {isLoading ? (
          <div className="widget-skeleton" aria-hidden="true">
            <div className="skeleton-line" style={{ width: '60%', height: '1rem', marginBottom: '0.5rem' }} />
            <div className="skeleton-line" style={{ width: '85%', height: '1rem', marginBottom: '0.5rem' }} />
            <div className="skeleton-line" style={{ width: '40%', height: '1rem' }} />
          </div>
        ) : error ? (
          <div className="widget-error" role="alert">{error}</div>
        ) : (
          children
        )}
      </div>
    </article>
  );
}
