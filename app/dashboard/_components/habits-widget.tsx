'use client';

import { useState, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createHabitsSlice, type HabitsSlice } from '@/store/slices/habits';
import { useHydration } from '@/hooks/useHydration';

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

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Nawyki</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '4rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Nawyki</span>
        <button className="btn-secondary" onClick={() => setShowInput(!showInput)}>
          + Dodaj
        </button>
      </div>
      <div className="widget-body">
        {showInput && (
          <div className="flex gap-2 mb-3">
            <input
              className="input-field flex-1"
              placeholder="Nazwa nawyku..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddHabit();
              }}
              autoFocus
            />
            <button className="btn-primary" onClick={handleAddHabit}>
              OK
            </button>
          </div>
        )}

        {habits.length === 0 ? (
          <div style={{ color: 'var(--txm)' }} className="text-center py-3">
            Brak nawyków. Dodaj pierwszy nawyk.
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
                        title={`${offset === 0 ? 'Dziś' : `${offset}d temu`}`}
                      />
                    );
                  })}
                </div>
                <span className="pill" style={{ minWidth: '2rem', textAlign: 'center' }}>
                  {habit.s}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
