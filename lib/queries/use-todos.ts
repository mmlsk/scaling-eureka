import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { LocalTodo } from '@/types/state';

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
      return (data ?? []) as Array<{
        id: string;
        text: string;
        done: boolean;
        priority: LocalTodo['p'];
        created_at: string;
        archived: boolean;
      }>;
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
      return data ?? [];
    },
  });
}

export function useAddTodo() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (todo: { text: string; priority?: LocalTodo['p'] }) => {
      const { data, error } = await supabase
        .from('todos')
        .insert({ text: todo.text, priority: todo.priority ?? 'M', done: false, archived: false })
        .select()
        .single();
      if (error) throw error;
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
