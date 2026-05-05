import { describe, it, expect } from 'vitest';
import type { Room, Pin, ChecklistItem, PartialRoom, PartialPin } from './floor-plan';

describe('Floor Plan Types', () => {
  it('should define Room type with correct fields', () => {
    const room: Room = {
      id: 'uuid-1',
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
    };
    expect(room.name).toBe('Salon');
    expect(room.x).toBe(0.1);
  });

  it('should define Pin type with items array', () => {
    const pin: Pin = {
      id: 'uuid-2',
      user_id: 'user-1',
      room_id: 'uuid-1',
      title: 'Wymienić żarówki',
      x: 0.5,
      y: 0.5,
      status: 'active',
      due_date: null,
      priority: null,
      deleted_at: null,
      created_at: '2026-05-04T12:00:00Z',
      updated_at: '2026-05-04T12:00:00Z',
      items: [],
    };
    expect(pin.status).toBe('active');
  });

  it('should define ChecklistItem type', () => {
    const item: ChecklistItem = {
      id: 'uuid-3',
      user_id: 'user-1',
      pin_id: 'uuid-2',
      text: 'Kupić żarówki LED',
      completed: false,
      order: 1,
      deleted_at: null,
      created_at: '2026-05-04T12:00:00Z',
      updated_at: '2026-05-04T12:00:00Z',
    };
    expect(item.completed).toBe(false);
  });

  it('should define PartialRoom type', () => {
    const partial: PartialRoom = { id: 'uuid-1', name: 'New Name' };
    expect(partial.id).toBe('uuid-1');
  });

  it('should define PartialPin type', () => {
    const partial: PartialPin = { id: 'uuid-2', title: 'New Title' };
    expect(partial.id).toBe('uuid-2');
  });
});
