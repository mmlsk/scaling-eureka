import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export const NOOTROPICS_KEY = ['nootropics'] as const;
export const NOOTROPIC_LOG_KEY = ['nootropicLog'] as const;

export function useNootropics() {
  const supabase = createClient();
  return useQuery({
    queryKey: NOOTROPICS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nootropic_stack')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useNootropicLog(days = 14) {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  return useQuery({
    queryKey: [...NOOTROPIC_LOG_KEY, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nootropic_log')
        .select('*')
        .gte('date', sinceStr)
        .order('date', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddNootropic() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({ name, dose }: { name: string; dose: string }) => {
      const { data, error } = await supabase
        .from('nootropic_stack')
        .insert({ name, dose, active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOOTROPICS_KEY }),
  });
}

export function useRemoveNootropic() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nootropic_stack')
        .update({ active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOOTROPICS_KEY }),
  });
}

export function useToggleNootropicStatus() {
  const qc = useQueryClient();
  const supabase = createClient();
  const STATUS_CYCLE = ['pending', 'taken', 'skipped'] as const;

  return useMutation({
    mutationFn: async ({
      id,
      name,
      currentStatus,
    }: {
      id: string;
      name: string;
      currentStatus: string;
    }) => {
      const currentIdx = STATUS_CYCLE.indexOf(currentStatus as typeof STATUS_CYCLE[number]);
      const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
      const today = new Date().toISOString().slice(0, 10);

      const { error: stackError } = await supabase
        .from('nootropic_stack')
        .update({ status: nextStatus })
        .eq('id', id);
      if (stackError) throw stackError;

      const { error: logError } = await supabase
        .from('nootropic_log')
        .upsert(
          { nootropic_id: id, date: today, status: nextStatus, name },
          { onConflict: 'nootropic_id,date' },
        );
      if (logError) throw logError;

      return nextStatus;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOOTROPICS_KEY });
      qc.invalidateQueries({ queryKey: NOOTROPIC_LOG_KEY });
    },
  });
}
