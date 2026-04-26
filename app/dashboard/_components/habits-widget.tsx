'use client';

import { useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createHabitsSlice, type HabitsSlice } from '@/store/slices/habits';
import { useHydration } from '@/hooks/useHydration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const useHabitsStore = create<HabitsSlice>()(
  persist(createHabitsSlice, { name: 'life-os-habits' }),
);

const DAYS_COUNT = 14;

export default function HabitsWidget() {
  const hydrated = useHydration();
  const habits = useHabitsStore((s) => s.habits);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const toggleHabitDay = useHabitsStore((s) => s.toggleHabitDay);

  const [newHabitName, setNewHabitName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddHabit = useCallback(() => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;
    addHabit(trimmed);
    setNewHabitName('');
    setShowInput(false);
  }, [newHabitName, addHabit]);

  // Today's progress
  const todayStats = useMemo(() => {
    const doneToday = habits.filter((h) => h.d.includes(0)).length;
    return { done: doneToday, total: habits.length };
  }, [habits]);

  const progressPct = todayStats.total > 0 ? (todayStats.done / todayStats.total) * 100 : 0;

  if (!hydrated) {
    return (
      <div className="widget" aria-label="Widget: Nawyki">
        <div className="widget-header">Nawyki</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '4rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget" aria-label="Widget: Nawyki">
      <div className="widget-header">
        <span>Nawyki</span>
        <div className="flex items-center gap-2">
          {todayStats.total > 0 && (
            <span className="pill" aria-label={`${todayStats.done} z ${todayStats.total} dzis`}>
              {todayStats.done}/{todayStats.total}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInput(!showInput)}
            aria-label="Dodaj nawyk"
          >
            + Dodaj
          </Button>
        </div>
      </div>
      <div className="widget-body">
        {showInput && (
          <div className="flex gap-2 mb-3">
            <Input
              className="flex-1"
              placeholder="Nazwa nawyku..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddHabit();
              }}
              autoFocus
              aria-label="Nazwa nowego nawyku"
            />
            <Button size="sm" onClick={handleAddHabit}>
              OK
            </Button>
          </div>
        )}

        {/* Today's progress bar */}
        {todayStats.total > 0 && (
          <div className="mb-3">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <div style={{ color: 'var(--txm)' }} className="text-center py-3">
            Brak nawykow. Dodaj pierwszy nawyk.
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit, hIdx) => (
              <div key={`${habit.n}-${hIdx}`} className="flex items-center gap-2">
                <span
                  className="w-20 truncate text-[clamp(0.55rem,0.52rem+0.1vw,0.65rem)]"
                  title={habit.n}
                >
                  {habit.n}
                </span>
                <div className="flex gap-[3px] flex-1">
                  {Array.from({ length: DAYS_COUNT }, (_, dayIdx) => {
                    const offset = DAYS_COUNT - 1 - dayIdx;
                    const isDone = habit.d.includes(offset);
                    const isToday = offset === 0;
                    return (
                      <button
                        key={dayIdx}
                        className={`habit-dot ${isDone ? 'done' : ''} ${isToday ? 'cur' : ''}`}
                        onClick={() => toggleHabitDay(hIdx, offset)}
                        title={`${offset === 0 ? 'Dzis' : `${offset}d temu`}`}
                        aria-label={`${habit.n}, ${offset === 0 ? 'dzis' : `${offset} dni temu`}: ${isDone ? 'zrobione' : 'niezrobione'}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="pill"
                    style={{ minWidth: '2rem', textAlign: 'center' }}
                    aria-label={`Seria: ${habit.s} dni`}
                  >
                    {habit.s > 0 && '\uD83D\uDD25'}{habit.s}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
