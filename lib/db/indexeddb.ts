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
  /**
   * @sensitivity MEDIUM — habit names reveal personal goals/routines
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  habits!: Table<Habit, string>;

  /**
   * @sensitivity MEDIUM — completion history reveals behavioral patterns
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  habitEntries!: Table<HabitEntry, string>;

  /**
   * @sensitivity LOW — generic task text
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  todos!: Table<Todo, string>;

  /**
   * @sensitivity HIGH — supplement/nootropic stack reveals health regimen
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  nootropicStack!: Table<Nootropic, string>;

  /**
   * @sensitivity HIGH — intake logs reveal substance use patterns
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  nootropicLog!: Table<NootropicLogEntry, string>;

  /**
   * @sensitivity HIGH — contains personal medical data (sleep patterns)
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  sleepLog!: Table<SleepEntry, string>;

  /**
   * @sensitivity MEDIUM — calendar events may contain personal appointments
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  calendarEvents!: Table<CalendarEvent, string>;

  /**
   * @sensitivity MEDIUM — freeform text may contain sensitive information
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  notes!: Table<Note, string>;

  /**
   * @sensitivity HIGH — mood/feelings data is personal medical information
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  moodEntries!: Table<MoodEntry, string>;

  /**
   * @sensitivity LOW — timer session metadata (durations, timestamps)
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  timerSessions!: Table<TimerSession, string>;

  /**
   * @sensitivity MEDIUM — generic event payloads, content varies
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention session-bound; cleared on logout via clearAllTables()
   */
  eventStore!: Table<EventStoreEntry, string>;

  /**
   * @sensitivity LOW — sync metadata (table names, operation types, timestamps)
   * @encryption-at-rest NONE (browser IndexedDB is plaintext)
   * @retention transient; entries removed after successful sync
   */
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

/**
 * Clear all IndexedDB tables. Call on logout to remove local user data.
 */
export async function clearAllTables(): Promise<void> {
  await db.transaction(
    'rw',
    db.habits,
    db.habitEntries,
    db.todos,
    db.nootropicStack,
    db.nootropicLog,
    db.sleepLog,
    db.calendarEvents,
    db.notes,
    db.moodEntries,
    db.timerSessions,
    db.eventStore,
    db.syncQueue,
    async () => {
      await Promise.all([
        db.habits.clear(),
        db.habitEntries.clear(),
        db.todos.clear(),
        db.nootropicStack.clear(),
        db.nootropicLog.clear(),
        db.sleepLog.clear(),
        db.calendarEvents.clear(),
        db.notes.clear(),
        db.moodEntries.clear(),
        db.timerSessions.clear(),
        db.eventStore.clear(),
        db.syncQueue.clear(),
      ]);
    },
  );
}
