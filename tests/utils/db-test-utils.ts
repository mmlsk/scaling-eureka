import Dexie from 'dexie';
import { registerDashboardLayoutSchema } from '@/lib/db/schemas/dashboard-layout';

/**
 * Creates a test-specific Dexie instance for database tests.
 * Uses a separate database name to avoid conflicting with the main app database.
 * Includes the dashboardLayout schema for layout persistence tests.
 */
export function setupTestDb(): Dexie {
  const db = new Dexie('LifeOSDB_Test');

  // Version 1: Core tables (simplified schema for testing)
  db.version(1).stores({
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

  // Version 2: Add dashboardLayout schema
  registerDashboardLayoutSchema(db, 2);

  return db;
}

/**
 * Cleanup function to delete the test database between tests
 */
export async function cleanupTestDb(db: Dexie): Promise<void> {
  await db.delete();
}
