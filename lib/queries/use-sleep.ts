import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export const SLEEP_KEY = ['sleep'] as const;

export function useSleepLog(days = 14) {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  return useQuery({
    queryKey: [...SLEEP_KEY, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_log')
        .select('*')
        .gte('date', sinceStr)
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTodaySleep() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  return useQuery({
    queryKey: [...SLEEP_KEY, 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_log')
        .select('*')
        .eq('date', today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSleep() {
  const qc = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      field,
      value,
    }: {
      field: 'start' | 'stop' | 'quality';
      value: string | null;
    }) => {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from('sleep_log')
        .upsert(
          { date: today, [field]: value },
          { onConflict: 'date,user_id' },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SLEEP_KEY }),
  });
}
