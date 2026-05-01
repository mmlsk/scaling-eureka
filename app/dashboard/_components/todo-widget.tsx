'use client';

import { useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTodosSlice, type TodosSlice } from '@/store/slices/todos';
import { useHydration } from '@/hooks/useHydration';
import type { LocalTodo } from '@/types/state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WidgetShell } from '@/components/ui/widget-shell';
import { Badge } from '@/components/ui/badge';

const useTodosStore = create<TodosSlice>()(
  persist(createTodosSlice, { name: 'life-os-todos' }),
);

type Priority = LocalTodo['p'];

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
    if (idx === -1) return;
    const nextPriority = cycle[(idx + 1) % cycle.length];
    if (nextPriority) setPriority(nextPriority);
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

  return (
    <WidgetShell id="todo" title="Todo" isLoading={!hydrated}>
      {/* Header actions */}
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" aria-label={`${doneCount} z ${todos.length} wykonanych`}>
          {doneCount}/{todos.length}
        </Badge>
        {doneCount > 0 && (
          <Button variant="outline" size="sm" onClick={archiveDone} aria-label="Archiwizuj wykonane">
            Archiwizuj
          </Button>
        )}
      </div>

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
        <Badge
          variant={priority === 'H' ? 'destructive' : priority === 'M' ? 'secondary' : 'default'}
          className="cursor-pointer"
          onClick={cyclePriority}
          title={`Priorytet: ${PRIORITY_LABELS[priority]}`}
          aria-label={`Priorytet: ${PRIORITY_LABELS[priority]}, kliknij aby zmienic`}
        >
          {priority}
        </Badge>
        <Button size="sm" onClick={handleAdd} aria-label="Dodaj zadanie">
          +
        </Button>
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className="mb-2">
          <div className="h-2 bg-muted rounded-full">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(doneCount / todos.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Todo List */}
      {todos.length === 0 ? (
        <div className="text-muted-foreground text-center py-3">
          Brak zadan.
        </div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {sortedTodos.map((todo) => (
            <div
              key={`${todo.t}-${todo.origIdx}`}
              className="flex items-center gap-2 py-1 cursor-pointer border-b border-border"
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
                className={`inline-block w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                  todo.done ? 'bg-primary border-primary' : 'border-border'
                }`}
              >
                {todo.done && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className={`flex-1 truncate ${todo.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}
              >
                {todo.t}
              </span>
              <Badge variant={todo.p === 'H' ? 'destructive' : todo.p === 'M' ? 'secondary' : 'default'}>{todo.p}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Stats footer */}
      {todos.length > 0 && (
        <div className="flex justify-between pt-1 mt-1 border-t border-border text-xs text-muted-foreground">
          <span>{pendingCount} do zrobienia</span>
          <span>{doneCount} wykonanych dzis</span>
        </div>
      )}
    </WidgetShell>
  );
}
