import { describe, it, expect } from 'vitest';
import { generateTextRepresentation } from './embedding-generator';
import type { Habit, Todo, SleepEntry, MoodEntry } from '@/types/database';

describe('Embedding Generator', () => {
  it('should generate text for habit', () => {
    const habit: Partial<Habit> = { name: 'Exercise', archived: false };
    const entries = [{ date: '2026-05-01', completed: true }];
    const text = generateTextRepresentation('habit', habit, entries);
    expect(text).toContain('Exercise');
    expect(text).toContain('active');
  });

  it('should generate text for todo', () => {
    const todo: Partial<Todo> = { text: 'Finish report', done: false, priority: 1 };
    const text = generateTextRepresentation('todo', todo, []);
    expect(text).toContain('Finish report');
    expect(text).toContain('priority: 1');
  });

  it('should generate text for sleep', () => {
    const sleep: Partial<SleepEntry> = { date: '2026-05-01', total_minutes: 480, quality: 'good' };
    const text = generateTextRepresentation('sleep', sleep, []);
    expect(text).toContain('480');
    expect(text).toContain('good');
  });

  it('should generate text for mood', () => {
    const mood: Partial<MoodEntry> = { date: '2026-05-01', feelings: ['happy', 'energetic'] };
    const text = generateTextRepresentation('mood', mood, []);
    expect(text).toContain('happy');
    expect(text).toContain('energetic');
  });

  it('should handle unknown source type', () => {
    const text = generateTextRepresentation('unknown', { foo: 'bar' }, []);
    expect(text).toContain('bar');
  });
});
