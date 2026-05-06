import { describe, it, expect } from 'vitest';

describe('GET /api/ai/insights', () => {
  it('should exist as a route handler', async () => {
    const mod = await import('./route');
    expect(typeof mod.GET).toBe('function');
  });
});
