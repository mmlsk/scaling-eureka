// lib/queries/use-ai-insights.ts
import { useQuery } from '@tanstack/react-query';

export interface Insight {
  id: string;
  type: 'pattern' | 'suggestion' | 'warning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export function useAIInsights() {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const res = await fetch('/api/ai/insights');
      if (!res.ok) throw new Error('Failed to fetch insights');
      return res.json() as Promise<Insight[]>;
    },
  });
}
