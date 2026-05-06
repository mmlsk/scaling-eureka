import { describe, it, expect } from 'vitest';
import { useAIInsights } from './use-ai-insights';

describe('useAIInsights', () => {
  it('should export useAIInsights hook', () => {
    expect(typeof useAIInsights).toBe('function');
  });
});
