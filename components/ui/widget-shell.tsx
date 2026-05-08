'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
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
      className={cn(className)}
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
          <div className="space-y-3">
            {/* Polish: Enhanced loading state with header + content skeletons */}
            {/* Header skeleton simulating widget title */}
            <Skeleton variant="text" className="h-6 w-32" />
            {/* Content skeletons with varying widths */}
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-5/6" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        ) : (
          <div
            data-loading={isLoading}
            className="hover:scale-[1.02] transition-transform duration-200 animate-in fade-in duration-300"
          >
            {/* Polish: Fade-in transition when content loads */}
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
