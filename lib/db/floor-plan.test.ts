import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { indexedDB as fakeIndexedDB } from 'fake-indexeddb';
import { FloorPlanDB } from './floor-plan';

describe('Floor Plan Dexie Schema', () => {
  beforeEach(() => {
    global.indexedDB = fakeIndexedDB;
  });

  it('should define rooms table with correct schema', async () => {
    const db = new FloorPlanDB();
    await db.rooms.add({
      id: 'room-1',
      user_id: 'user-1',
      name: 'Salon',
      x: 0.1,
      y: 0.2,
      width: 0.3,
      height: 0.25,
      color: '#fb923c',
      image_url: null,
      order: 1,
      deleted_at: null,
      created_at: '2026-05-04T12:00:00Z',
      updated_at: '2026-05-04T12:00:00Z',
    });
    const room = await db.rooms.get('room-1');
    expect(room?.name).toBe('Salon');
  });

  it('should define pins table with correct schema', async () => {
    const db = new FloorPlanDB();
    await db.pins.add({
      id: 'pin-1',
      user_id: 'user-1',
      room_id: 'room-1',
      title: 'Wymienić żarówki',
      x: 0.5,
      y: 0.5,
      status: 'active',
      due_date: null,
      priority: null,
      deleted_at: null,
      created_at: '2026-05-04T12:00:00Z',
      updated_at: '2026-05-04T12:00:00Z',
    });
    const pin = await db.pins.get('pin-1');
    expect(pin?.title).toBe('Wymienić żarówki');
  });

  it('should define checklistItems table', async () => {
    const db = new FloorPlanDB();
    await db.checklistItems.add({
      id: 'item-1',
      user_id: 'user-1',
      pin_id: 'pin-1',
      text: 'Kupić żarówki',
      completed: false,
      order: 1,
      deleted_at: null,
      created_at: '2026-05-04T12:00:00Z',
      updated_at: '2026-05-04T12:00:00Z',
    });
    const item = await db.checklistItems.get('item-1');
    expect(item?.completed).toBe(false);
  });

  it('should define syncQueue table with retry_count and last_error', async () => {
    const db = new FloorPlanDB();
    await db.syncQueue.add({
      table_name: 'rooms',
      action: 'create',
      record_id: 'room-1',
      data: { name: 'Salon' },
      retry_count: 0,
      last_error: null,
      created_at: '2026-05-04T12:00:00Z',
    });
    const entry = await db.syncQueue.toArray();
    expect(entry.length).toBe(1);
  });

  afterEach(async () => {
    const _db = new FloorPlanDB();
    await _db.delete();
    // @ts-expect-error -- global.indexedDB is intentionally unset after test
    global.indexedDB = undefined;
  });
});
