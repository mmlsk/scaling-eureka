import Dexie from 'dexie';
import type { Room, Pin, ChecklistItem } from '@/lib/types/floor-plan';

export class FloorPlanDB extends Dexie {
  rooms!: Dexie.Table<Room, string>;
  pins!: Dexie.Table<Pin, string>;
  checklistItems!: Dexie.Table<ChecklistItem, string>;
  syncQueue!: Dexie.Table<{
    id?: number;
    table_name: string;
    action: 'create' | 'update' | 'delete';
    record_id: string;
    data: Record<string, unknown>;
    retry_count: number;
    last_error: string | null;
    created_at: string;
  }, number>;

  constructor() {
    super('FloorPlanDB');
    this.version(1).stores({
      rooms: 'id, user_id, name, x, y, width, height, color, order, deleted_at, created_at, updated_at',
      pins: 'id, user_id, room_id, title, x, y, status, deleted_at, created_at, updated_at',
      checklistItems: 'id, user_id, pin_id, text, completed, order, deleted_at, created_at, updated_at',
      syncQueue: '++id, user_id, table_name, action, record_id, retry_count, last_error, created_at',
    });
  }
}

export const floorPlanDb = new FloorPlanDB();
