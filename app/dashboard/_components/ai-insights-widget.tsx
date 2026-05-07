'use client';

import { useAIInsights } from '@/lib/queries/use-ai-insights';
import { WidgetShell } from '@/components/ui/widget-shell';
import { Badge } from '@/components/ui/badge';

export default function AIInsightsWidget() {
  const { data: insights, isLoading, error } = useAIInsights();

  const actions = insights && insights.length > 0 ? (
    <Badge variant={insights.length > 3 ? 'destructive' : 'secondary'}>
      {insights.length} insights
    </Badge>
  ) : undefined;

  return (
    <WidgetShell
      id="ai-insights"
      title="Spostrzeżenia AI"
      isLoading={isLoading}
      error={error?.message || null}
      actions={actions}
    >
      {!insights || insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">No insights yet</p>
      ) : (
        <div className="space-y-2">
          {insights.slice(0, 5).map((insight) => (
            <div
              key={insight.id}
              className="p-2 border border-border rounded-md"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{insight.title}</span>
                <Badge
                  variant={
                    insight.priority === 'high'
                      ? 'destructive'
                      : insight.priority === 'medium'
                      ? 'secondary'
                      : 'default'
                  }
                  className="text-xs"
                >
                  {insight.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </div>
          ))}
          {insights.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              +{insights.length - 5} more insights
            </p>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
