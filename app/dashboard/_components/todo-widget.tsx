'use client';

import { useState, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTodosSlice, type TodosSlice } from '@/store/slices/todos';
import { useHydration } from '@/hooks/useHydration';
import type { LocalTodo } from '@/types/state';

const useTodosStore = create<TodosSlice>()(
  persist(createTodosSlice, { name: 'life-os-todos' }),
);

type Priority = LocalTodo['p'];

const PRIORITY_COLORS: Record<Priority, string> = {
  H: 'crit',
  M: 'warn',
  L: 'ok',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  H: 'Wysoki',
  M: 'Średni',
  L: 'Niski',
};

export default function TodoWidget() {
  const hydrated = useHydration();
  const todos = useTodosStore((s) => s.todos);
  const addTodo = useTodosStore((s) => s.addTodo);
  const toggleTodo = useTodosStore((s) => s.toggleTodo);
  const archiveDone = useTodosStore((s) => s.archiveDone);

  const [newText, setNewText] = useState('');
  const [priority, setPriority] = useState<Priority>('M');

  const handleAdd = useCallback(() => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    addTodo(trimmed, priority);
    setNewText('');
  }, [newText, priority, addTodo]);

  const cyclePriority = useCallback(() => {
    const cycle: Priority[] = ['L', 'M', 'H'];
    const idx = cycle.indexOf(priority);
    setPriority(cycle[(idx + 1) % cycle.length]);
  }, [priority]);

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Todo</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '4rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  const doneCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Todo</span>
        <div className="flex items-center gap-2">
          <span className="pill">
            {doneCount}/{totalCount}
          </span>
          {doneCount > 0 && (
            <button className="btn-secondary" onClick={archiveDone}>
              Archiwizuj
            </button>
          )}
        </div>
      </div>
      <div className="widget-body">
        {/* Add Input */}
        <div className="flex gap-2 mb-3">
          <input
            className="input-field flex-1"
            placeholder="Nowe zadanie..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <button
            className={`pill ${PRIORITY_COLORS[priority]} cursor-pointer`}
            onClick={cyclePriority}
            title={`Priorytet: ${PRIORITY_LABELS[priority]}`}
          >
            {priority}
          </button>
          <button className="btn-primary" onClick={handleAdd}>
            +
          </button>
        </div>

        {/* Todo List */}
        {todos.length === 0 ? (
          <div style={{ color: 'var(--txm)' }} className="text-center py-3">
            Brak zadań.
          </div>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {todos.map((todo, idx) => (
              <div
                key={`${todo.t}-${idx}`}
                className="flex items-center gap-2 py-1 cursor-pointer"
                style={{ borderBottom: '1px solid var(--div)' }}
                onClick={() => toggleTodo(idx)}
              >
                <span
                  className="inline-block w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center"
                  style={{
                    borderColor: todo.done ? 'var(--nom)' : 'var(--bor)',
                    background: todo.done ? 'var(--nom)' : 'transparent',
                  }}
                >
                  {todo.done && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2" stroke="var(--txi)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span
                  className="flex-1 truncate"
                  style={{
                    textDecoration: todo.done ? 'line-through' : 'none',
                    color: todo.done ? 'var(--txm)' : 'var(--tx)',
                  }}
                >
                  {todo.t}
                </span>
                <span className={`pill ${PRIORITY_COLORS[todo.p]}`}>{todo.p}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
