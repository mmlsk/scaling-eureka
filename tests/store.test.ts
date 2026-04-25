import { describe, it, expect, beforeEach } from 'vitest';
import { useLifeOsStore } from '@/store/useLifeOsStore';

describe('useLifeOsStore — sleep midnight crossing', () => {
  beforeEach(() => {
    useLifeOsStore.setState({ sleepLog: [] });
  });

  it('calculates duration when bedtime > waketime (crosses midnight)', () => {
    const { addSleepEntry, getSleepDuration } = useLifeOsStore.getState();
    addSleepEntry({
      bedtime: '23:30',
      waketime: '07:15',
      date: '2026-04-25',
    });
    const duration = getSleepDuration('2026-04-25');
    expect(duration).toBeCloseTo(7.75, 2); // 7h 45min
  });

  it('handles edge: bedtime exactly at midnight', () => {
    const { addSleepEntry, getSleepDuration } = useLifeOsStore.getState();
    addSleepEntry({ bedtime: '00:00', waketime: '08:00', date: '2026-04-25' });
    expect(getSleepDuration('2026-04-25')).toBe(8);
  });

  it('handles edge: same-day sleep (nap)', () => {
    const { addSleepEntry, getSleepDuration } = useLifeOsStore.getState();
    addSleepEntry({ bedtime: '14:00', waketime: '15:30', date: '2026-04-25' });
    expect(getSleepDuration('2026-04-25')).toBeCloseTo(1.5, 2);
  });
});

describe('useLifeOsStore — timer preset cycling', () => {
  it('cycles through presets in order: 25min → 50min → 90min → 25min', () => {
    const { setTimerPreset, cyclePreset, getTimerPreset } = useLifeOsStore.getState();
    setTimerPreset(25);
    expect(getTimerPreset()).toBe(25);
    cyclePreset();
    expect(getTimerPreset()).toBe(50);
    cyclePreset();
    expect(getTimerPreset()).toBe(90);
    cyclePreset();
    expect(getTimerPreset()).toBe(25);
  });
});
