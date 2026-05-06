import type { Habit, Todo, SleepEntry, MoodEntry, CalendarEvent, Nootropic, TimerSession, EventStoreEntry } from '@/types/database';

export function generateTextRepresentation(
  sourceType: string,
  record: Record<string, unknown>,
  relatedData?: Record<string, unknown>[],
): string {
  switch (sourceType) {
    case 'habit': {
      const h = record as Partial<Habit>;
      const entries = (relatedData as Partial<{ completed: boolean }[]>) || [];
      const completedCount = entries.filter(e => e.completed).length;
      const rate = entries.length > 0 ? Math.round((completedCount / entries.length) * 100) : 0;
      return `Habit: ${h.name || 'Unknown'}. Status: ${h.archived ? 'archived' : 'active'}. Completion rate: ${rate}%.`;
    }
    case 'todo': {
      const t = record as Partial<Todo>;
      return `Todo: ${t.text || 'Unknown'}. Status: ${t.done ? 'done' : 'active'}. priority: ${t.priority || 0}.`;
    }
    case 'sleep': {
      const s = record as Partial<SleepEntry>;
      return `Sleep: ${s.date || 'unknown'}. Duration: ${s.total_minutes || 0}min. Quality: ${s.quality || 'unknown'}.`;
    }
    case 'mood': {
      const m = record as Partial<MoodEntry>;
      const feelings = (m.feelings as string[]) || [];
      return `Mood: ${m.date || 'unknown'}. Feelings: ${feelings.join(', ')}.`;
    }
    case 'calendar': {
      const c = record as Partial<CalendarEvent>;
      return `Event: ${c.title || 'Unknown'}. Date: ${c.date || 'unknown'}. Time: ${c.time || 'all day'}.`;
    }
    case 'nootropic': {
      const n = record as Partial<Nootropic>;
      return `Nootropic: ${n.name || 'Unknown'}. Dose: ${n.dose || 'unknown'}. Active: ${n.active}.`;
    }
    case 'timer': {
      const t = record as Partial<TimerSession>;
      return `Timer session: ${t.work_minutes || 0}min work, ${t.break_minutes || 0}min break. Date: ${t.date || 'unknown'}.`;
    }
    case 'event': {
      const e = record as Partial<EventStoreEntry>;
      return `Event: ${e.sheet || 'unknown'}. Data: ${JSON.stringify(e.data || {})}.`;
    }
    default:
      return JSON.stringify(record);
  }
}
