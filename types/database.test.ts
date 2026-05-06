import { describe, it, expect } from 'vitest';
import type { NoteEmbedding } from './database';

describe('NoteEmbedding type', () => {
  it('should accept all data source types', () => {
    const sources: NoteEmbedding['source_type'][] = [
      'note', 'todo', 'habit', 'mood', 'sleep', 'calendar', 'nootropic', 'timer', 'event'
    ];
    sources.forEach(type => {
      const emb: NoteEmbedding = {
        id: 'test', user_id: 'u1', source_type: type,
        source_id: 's1', content: 'test', embedding: [], created_at: ''
      };
      expect(emb.source_type).toBe(type);
    });
  });
});
