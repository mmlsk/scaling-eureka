import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { LocalTodo } from '@/types/state';
import { validateTodoText, validatePriority, isTodoData, isString, isBoolean } from '@/lib/validation';

export const TODOS_KEY = ['todos'] as const;

export function useTodos() {
  const supabase = createClient();
  return useQuery({
    queryKey: TODOS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Validate and type-check the data
      const validatedData = (data ?? []).filter((item): item is {
        id: string;
        text: string;
        done: boolean;
        priority: LocalTodo['p'];
        created_at: string;
        archived: boolean;
      } => {
        try {
          return isTodoData(item) &&
                 ['H', 'M', 'L'].includes(item.priority as LocalTodo['p']);
        } catch {
          return false;
        }
      });

      return validatedData;
    },
  });
}

export function useArchivedTodos() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['todos', 'archived'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('archived', true)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Validate and type-check the data
      return (data ?? []).filter((item): item is {
        id: string;
        text: string;
        done: boolean;
        priority: LocalTodo['p'];
        created_at: string;
        archived: boolean;
      } => isTodoData(item));
    },
  });
}

export function useAddTodo() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (todo: { text: string; priority?: LocalTodo['p'] }) => {
      // Validate input
      const validatedText = validateTodoText(todo.text);
      const validatedPriority = todo.priority ? validatePriority(todo.priority) : 'M';

      const { data, error } = await supabase
        .from('todos')
        .insert({
          text: validatedText,
          priority: validatedPriority,
          done: false,
          archived: false
        })
        .select()
        .single();
      if (error) throw error;

      // Validate response
      if (!isTodoData(data)) {
        throw new Error('Invalid todo data returned from server');
      }

      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useToggleTodo() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      // Validate input
      if (!isString(id) || id.length === 0) {
        throw new Error('Invalid todo ID');
      }
      if (!isBoolean(done)) {
        throw new Error('Invalid done status');
      }

      const { error } = await supabase
        .from('todos')
        .update({ done: !done })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useArchiveDone() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('todos')
        .update({ archived: true })
        .eq('done', true)
        .eq('archived', false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_KEY });
      qc.invalidateQueries({ queryKey: ['todos', 'archived'] });
    },
  });
}
