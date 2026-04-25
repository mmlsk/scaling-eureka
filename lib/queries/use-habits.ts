import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export const HABITS_KEY = ['habits'] as const;
export const HABIT_ENTRIES_KEY = ['habitEntries'] as const;

export function useHabits() {
  const supabase = createClient();
  return useQuery({
    queryKey: HABITS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHabitEntries(days = 14) {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  return useQuery({
    queryKey: [...HABIT_ENTRIES_KEY, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_entries')
        .select('*')
        .gte('date', sinceStr)
        .order('date', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddHabit() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('habits')
        .insert({ name, archived: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  });
}

export function useRemoveHabit() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .update({ archived: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  });
}

export function useToggleHabitDay() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      date,
      completed,
    }: {
      habitId: string;
      date: string;
      completed: boolean;
    }) => {
      if (completed) {
        const { error } = await supabase
          .from('habit_entries')
          .delete()
          .eq('habit_id', habitId)
          .eq('date', date);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('habit_entries')
          .upsert({ habit_id: habitId, date, completed: true }, {
            onConflict: 'habit_id,date',
          });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HABIT_ENTRIES_KEY }),
  });
}
