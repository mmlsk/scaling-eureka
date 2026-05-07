'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  text: string;
  category: 'habit' | 'health' | 'productivity' | 'general';
  priority: 'high' | 'medium' | 'low';
}

const categoryLabels: Record<Insight['category'], string> = {
  habit: 'Nawyki',
  health: 'Zdrowie',
  productivity: 'Produktywność',
  general: 'Ogólne',
};

const priorityColors: Record<Insight['priority'], string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
        }
      }

      // Parse the streamed text into insights (split by lines or bullet points)
      const lines = accumulated
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const parsedInsights: Insight[] = lines.map((line, index) => ({
        id: `insight-${index}`,
        text: line.replace(/^[•\-\*]\s*/, ''),
        category: detectCategory(line),
        priority: detectPriority(line),
      }));

      setInsights(parsedInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectCategory = (text: string): Insight['category'] => {
    const lower = text.toLowerCase();
    if (lower.includes('nawyk') || lower.includes('habit') || lower.includes('sen') || lower.includes('sleep')) {
      return 'habit';
    }
    if (lower.includes('zdrow') || lower.includes('health') || lower.includes('mood') || lower.includes('nastrój')) {
      return 'health';
    }
    if (lower.includes('zadan') || lower.includes('task') || lower.includes('produktywn') || lower.includes('productiv')) {
      return 'productivity';
    }
    return 'general';
  };

  const detectPriority = (text: string): Insight['priority'] => {
    const lower = text.toLowerCase();
    if (lower.includes('ważne') || lower.includes('important') || lower.includes('krytycz') || lower.includes('critical')) {
      return 'high';
    }
    if (lower.includes('średni') || lower.includes('medium')) {
      return 'medium';
    }
    return 'low';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        <p>Błąd: {error}</p>
        <Button variant="ghost" size="xs" onClick={fetchInsights} className="mt-1">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        <p>Brak dostępnych spostrzeżeń.</p>
        <Button variant="ghost" size="xs" onClick={fetchInsights} className="mt-1">
          Odśwież
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={cn(
            'border-l-2 pl-2 py-1 text-sm',
            priorityColors[insight.priority]
          )}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              {categoryLabels[insight.category]}
            </Badge>
          </div>
          <p className="text-muted-foreground leading-snug">{insight.text}</p>
        </div>
      ))}
      <Button
        variant="ghost"
        size="xs"
        onClick={fetchInsights}
        className="w-full mt-1 text-muted-foreground"
      >
        Odśwież spostrzeżenia
      </Button>
    </div>
  );
}
