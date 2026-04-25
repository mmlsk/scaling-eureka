import type { StateCreator } from 'zustand';
import type { LocalTodo } from '@/types/state';

/**
 * TodosSlice — offline fallback store.
 * Source of truth: Supabase via TanStack Query (lib/queries/use-todos.ts).
 * This slice remains for offline-first localStorage persistence when Supabase
 * is unreachable; UI components should prefer the TanStack Query hooks.
 */
export interface TodosSlice {
  todos: LocalTodo[];
  archivedTodos: (LocalTodo & { archivedAt?: string })[];
  addTodo: (text: string, priority?: LocalTodo['p']) => void;
  toggleTodo: (index: number) => void;
  archiveDone: () => void;
}

export const createTodosSlice: StateCreator<TodosSlice, [], [], TodosSlice> = (set) => ({
  todos: [],
  archivedTodos: [],

  addTodo: (text, priority = 'M') =>
    set((state) => ({
      todos: [...state.todos, { t: text, done: false, p: priority }],
    })),

  toggleTodo: (index) =>
    set((state) => ({
      todos: state.todos.map((todo, i) =>
        i === index ? { ...todo, done: !todo.done } : todo,
      ),
    })),

  archiveDone: () =>
    set((state) => {
      const now = new Date().toISOString();
      const done = state.todos
        .filter((t) => t.done)
        .map((t) => ({ ...t, archivedAt: now }));
      const remaining = state.todos.filter((t) => !t.done);

      return {
        todos: remaining,
        archivedTodos: [...state.archivedTodos, ...done],
      };
    }),
});
