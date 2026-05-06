import { describe, it, expect } from 'vitest';

describe('POST /api/ai/chat', () => {
  it('should exist as a route handler', async () => {
    const mod = await import('./route');
    expect(typeof mod.POST).toBe('function');
  });
});
