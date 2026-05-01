import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestDb, cleanupTestDb } from '@/tests/utils/db-test-utils';
import Dexie from 'dexie';

describe('Dashboard Layout Persistence', () => {
  let db: Dexie;

  beforeEach(async () => {
    db = setupTestDb();
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('saves layout to Dexie', async () => {
    await db.dashboardLayout.put({ key: 'widget-order', value: ['analytics', 'todo', 'weather'] });
    const result = await db.dashboardLayout.get('widget-order');
    expect(result?.value).toEqual(['analytics', 'todo', 'weather']);
  });

  it('has correct schema definition', async () => {
    await db.dashboardLayout.put({ key: 'visibleWidgets', value: ['analytics'], updatedAt: new Date() });
    const entry = await db.dashboardLayout.get('visibleWidgets');
    expect(entry?.key).toBe('visibleWidgets');
    expect(entry?.value).toEqual(['analytics']);
  });
});
