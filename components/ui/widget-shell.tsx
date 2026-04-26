'use client';

import { type ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
    <Card
      className={className}
      aria-label={`Widget: ${title}`}
      data-widget-id={id}
      size="sm"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-0">
        <button
          type="button"
          className="widget-drag-handle"
          aria-label={`Przesuń widget: ${title}`}
          {...dragHandleProps}
        >
          <span aria-hidden="true">⋮⋮</span>
        </button>
        <CardTitle className="flex-1 text-[length:clamp(0.65rem,0.62rem+0.14vw,0.78rem)] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </CardHeader>
      <CardContent role="region" aria-busy={isLoading || undefined}>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
