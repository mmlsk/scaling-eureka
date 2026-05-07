import { describe, it, expect } from 'vitest';

describe('AI Insights Page', () => {
  it('should export a page component', async () => {
    const mod = await import('./page');
    expect(typeof mod.default).toBe('function');
  });
});
