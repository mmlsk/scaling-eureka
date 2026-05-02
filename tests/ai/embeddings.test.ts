import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateEmbedding } from '@/lib/ai/embeddings';

describe('generateEmbedding', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should return a number array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
        model: 'text-embedding-ada-002',
        usage: { prompt_tokens: 10, total_tokens: 10 },
      }),
    });

    const result = await generateEmbedding('test', 'fake-key');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
    expect(typeof result[0]).toBe('number');
  });
});
