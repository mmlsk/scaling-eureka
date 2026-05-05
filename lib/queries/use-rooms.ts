import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Room, PartialRoom } from '@/lib/types/floor-plan';
import { floorPlanDb } from '@/lib/db/floor-plan';
import { addToSyncQueue } from '@/lib/db/sync';

export const ROOMS_KEY = ['floor-plan-rooms'] as const;

export function useRooms() {
  const supabase = createClient();
  return useQuery({
    queryKey: ROOMS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .is('deleted_at', null)
        .order('order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Room[];
    },
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert(room)
        .select()
        .single();
      if (error) throw error;
      return data as Room;
    },
    onSuccess: (data) => {
      qc.setQueryData(ROOMS_KEY, (old: Room[] | undefined) => old ? [...old, data] : [data]);
      void floorPlanDb.rooms.put(data);
      void addToSyncQueue('rooms', 'insert', data.id, data as Record<string, unknown>);
    },
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (room: PartialRoom) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(room)
        .eq('id', room.id)
        .select()
        .single();
      if (error) throw error;
      return data as Room;
    },
    onSuccess: (data) => {
      qc.setQueryData(ROOMS_KEY, (old: Room[] | undefined) =>
        old?.map((r) => (r.id === data.id ? data : r)) ?? []
      );
      void floorPlanDb.rooms.put(data);
      void addToSyncQueue('rooms', 'update', data.id, data as Record<string, unknown>);
    },
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rooms')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ROOMS_KEY });
      void addToSyncQueue('rooms', 'delete', id, { id });
    },
  });
}
