import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Pin, ChecklistItem, PartialPin } from '@/lib/types/floor-plan';
import { addToSyncQueue } from '@/lib/db/sync';

export const PINS_KEY = ['floor-plan-pins'] as const;

export function usePins(roomId?: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: [...PINS_KEY, roomId],
    queryFn: async () => {
      let query = supabase
        .from('pins')
        .select('*, checklist_items(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      if (roomId) query = query.eq('room_id', roomId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as (Pin & { checklist_items: ChecklistItem[] })[];
    },
  });
}

export function usePinWithItems(pinId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: [...PINS_KEY, 'detail', pinId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pins')
        .select('*, checklist_items(*)')
        .eq('id', pinId)
        .is('deleted_at', null)
        .single();
      if (error) throw error;
      return data as Pin & { checklist_items: ChecklistItem[] };
    },
    enabled: !!pinId,
  });
}

export function useCreatePin() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (pin: Omit<Pin, 'id' | 'created_at' | 'updated_at' | 'items'>) => {
      const { data, error } = await supabase
        .from('pins')
        .insert(pin)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: PINS_KEY });
      qc.invalidateQueries({ queryKey: ['floor-plan-sidebar'] });
      void addToSyncQueue('pins', 'insert', (data as { id: string }).id, data as Record<string, unknown>);
    },
  });
}

export function useUpdatePin() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (pin: PartialPin) => {
      const { data, error } = await supabase
        .from('pins')
        .update(pin)
        .eq('id', pin.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: PINS_KEY });
      void addToSyncQueue('pins', 'update', (data as { id: string }).id, data as Record<string, unknown>);
    },
  });
}

export function useCreateChecklistItem() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (item: Omit<ChecklistItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: PINS_KEY });
      void addToSyncQueue('checklist_items', 'insert', (data as { id: string }).id, data as Record<string, unknown>);
    },
  });
}

export function useToggleChecklistItem() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: ({ id, completed }) => {
      qc.invalidateQueries({ queryKey: PINS_KEY });
      void addToSyncQueue('checklist_items', 'update', id, { completed });
    },
  });
}

export function useDeletePin() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pins')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: PINS_KEY });
      void addToSyncQueue('pins', 'delete', id, { id });
    },
  });
}
