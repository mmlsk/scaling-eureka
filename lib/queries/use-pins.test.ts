import { describe, it, expect } from 'vitest';
import { usePins, usePinWithItems, useCreatePin, useUpdatePin, useCreateChecklistItem, useToggleChecklistItem } from './use-pins';

describe('use-pins hooks', () => {
  it('should export usePins hook', () => {
    expect(typeof usePins).toBe('function');
  });

  it('should export usePinWithItems hook', () => {
    expect(typeof usePinWithItems).toBe('function');
  });

  it('should export useCreatePin mutation', () => {
    expect(typeof useCreatePin).toBe('function');
  });

  it('should export useUpdatePin mutation', () => {
    expect(typeof useUpdatePin).toBe('function');
  });

  it('should export useCreateChecklistItem mutation', () => {
    expect(typeof useCreateChecklistItem).toBe('function');
  });

  it('should export useToggleChecklistItem mutation', () => {
    expect(typeof useToggleChecklistItem).toBe('function');
  });
});
