import Dexie, { type Table } from 'dexie';
import type {
  Habit,
  HabitEntry,
  Todo,
  Nootropic,
  NootropicLogEntry,
  SleepEntry,
  CalendarEvent,
  Note,
  MoodEntry,
  TimerSession,
  EventStoreEntry,
  SyncQueueEntry,
} from '@/types/database';

export class LifeOSDB extends Dexie {
  habits!: Table<Habit, string>;
  habitEntries!: Table<HabitEntry, string>;
  todos!: Table<Todo, string>;
  nootropicStack!: Table<Nootropic, string>;
  nootropicLog!: Table<NootropicLogEntry, string>;
  sleepLog!: Table<SleepEntry, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  notes!: Table<Note, string>;
  moodEntries!: Table<MoodEntry, string>;
  timerSessions!: Table<TimerSession, string>;
  eventStore!: Table<EventStoreEntry, string>;
  syncQueue!: Table<SyncQueueEntry, number>;

  constructor() {
    super('LifeOSDB');

    this.version(1).stores({
      habits: 'id, user_id, name, created_at, archived',
      habitEntries: 'id, habit_id, date, completed',
      todos: 'id, user_id, done, priority, created_at, archived',
      nootropicStack: 'id, user_id, name, order, active',
      nootropicLog: 'id, nootropic_id, date, status',
      sleepLog: 'id, user_id, date',
      calendarEvents: 'id, user_id, date, source',
      notes: 'id, user_id, updated_at',
      moodEntries: 'id, user_id, date',
      timerSessions: 'id, user_id, date, started_at',
      eventStore: 'id, user_id, sheet, created_at',
      syncQueue: '++id, table, operation, record_id, synced, created_at',
    });
  }
}

export const db = new LifeOSDB();
