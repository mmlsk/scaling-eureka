import { describe, it, expect, beforeEach } from 'vitest';
import { useFloorPlanUIStore } from './floor-plan-ui';

describe('floorPlanUIStore', () => {
  beforeEach(() => {
    useFloorPlanUIStore.getState().resetFloorPlanUI?.();
  });

  it('should have default selectedRoomId as null', () => {
    expect(useFloorPlanUIStore.getState().selectedRoomId).toBeNull();
  });

  it('should have default selectedPinId as null', () => {
    expect(useFloorPlanUIStore.getState().selectedPinId).toBeNull();
  });

  it('should have default filter as "all"', () => {
    expect(useFloorPlanUIStore.getState().filter).toBe('all');
  });

  it('should set selectedRoomId', () => {
    useFloorPlanUIStore.getState().setSelectedRoomId('room-1');
    expect(useFloorPlanUIStore.getState().selectedRoomId).toBe('room-1');
  });

  it('should set selectedPinId', () => {
    useFloorPlanUIStore.getState().setSelectedPinId('pin-1');
    expect(useFloorPlanUIStore.getState().selectedPinId).toBe('pin-1');
  });

  it('should set filter', () => {
    useFloorPlanUIStore.getState().setFilter('active');
    expect(useFloorPlanUIStore.getState().filter).toBe('active');
  });
});
