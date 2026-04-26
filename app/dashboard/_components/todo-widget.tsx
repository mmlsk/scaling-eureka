'use client';

import { useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTodosSlice, type TodosSlice } from '@/store/slices/todos';
import { useHydration } from '@/hooks/useHydration';
import type { LocalTodo } from '@/types/state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  M: 'Sredni',
  L: 'Niski',
};

const PRIORITY_ORDER: Record<Priority, number> = { H: 0, M: 1, L: 2 };

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

  const doneCount = useMemo(() => todos.filter((t) => t.done).length, [todos]);
  const pendingCount = todos.length - doneCount;

  // Sort: undone first (by priority), then done
  const sortedTodos = useMemo(() => {
    const indexed = todos.map((t, i) => ({ ...t, origIdx: i }));
    return indexed.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return PRIORITY_ORDER[a.p] - PRIORITY_ORDER[b.p];
    });
  }, [todos]);

  if (!hydrated) {
    return (
      <div className="widget" aria-label="Widget: Todo">
        <div className="widget-header">Todo</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '4rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget" aria-label="Widget: Todo">
      <div className="widget-header">
        <span>Todo</span>
        <div className="flex items-center gap-2">
          <span className="pill" aria-label={`${doneCount} z ${todos.length} wykonanych`}>
            {doneCount}/{todos.length}
          </span>
          {doneCount > 0 && (
            <Button variant="outline" size="sm" onClick={archiveDone} aria-label="Archiwizuj wykonane">
              Archiwizuj
            </Button>
          )}
        </div>
      </div>
      <div className="widget-body">
        {/* Add Input */}
        <div className="flex gap-2 mb-2">
          <Input
            className="flex-1"
            placeholder="Nowe zadanie..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            aria-label="Nowe zadanie"
          />
          <button
            className={`pill ${PRIORITY_COLORS[priority]} cursor-pointer`}
            onClick={cyclePriority}
            title={`Priorytet: ${PRIORITY_LABELS[priority]}`}
            aria-label={`Priorytet: ${PRIORITY_LABELS[priority]}, kliknij aby zmienic`}
          >
            {priority}
          </button>
          <Button size="sm" onClick={handleAdd} aria-label="Dodaj zadanie">
            +
          </Button>
        </div>

        {/* Progress bar */}
        {todos.length > 0 && (
          <div className="mb-2">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(doneCount / todos.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Todo List */}
        {todos.length === 0 ? (
          <div style={{ color: 'var(--txm)' }} className="text-center py-3">
            Brak zadan.
          </div>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {sortedTodos.map((todo) => (
              <div
                key={`${todo.t}-${todo.origIdx}`}
                className="flex items-center gap-2 py-1 cursor-pointer"
                style={{ borderBottom: '1px solid var(--div)' }}
                onClick={() => toggleTodo(todo.origIdx)}
                role="button"
                tabIndex={0}
                aria-label={`${todo.t} - priorytet ${PRIORITY_LABELS[todo.p]}, ${todo.done ? 'wykonane' : 'do zrobienia'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTodo(todo.origIdx);
                  }
                }}
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

        {/* Stats footer */}
        {todos.length > 0 && (
          <div
            className="flex justify-between pt-1 mt-1"
            style={{ borderTop: '1px solid var(--div)', fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txf)' }}
          >
            <span>{pendingCount} do zrobienia</span>
            <span>{doneCount} wykonanych dzis</span>
          </div>
        )}
      </div>
    </div>
  );
}
