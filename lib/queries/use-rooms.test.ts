import { describe, it, expect } from 'vitest';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from './use-rooms';

describe('use-rooms hooks', () => {
  it('should export useRooms hook', () => {
    expect(typeof useRooms).toBe('function');
  });

  it('should export useCreateRoom mutation', () => {
    expect(typeof useCreateRoom).toBe('function');
  });

  it('should export useUpdateRoom mutation', () => {
    expect(typeof useUpdateRoom).toBe('function');
  });

  it('should export useDeleteRoom mutation', () => {
    expect(typeof useDeleteRoom).toBe('function');
  });
});
