'use client';

import { useFloorPlanUIStore } from '@/store/slices/floor-plan-ui';
import { usePinWithItems, useDeletePin, useUpdatePin } from '@/lib/queries/use-pins';
import { useRooms } from '@/lib/queries/use-rooms';
import { ChecklistEditor } from './ChecklistEditor';
import type { Pin, ChecklistItem } from '@/lib/types/floor-plan';

type PinWithItems = Pin & { checklist_items?: ChecklistItem[] };

export function DetailPanel() {
  const { selectedPinId, setSelectedPinId, selectedRoomId, setSelectedRoomId } = useFloorPlanUIStore();
  const { data: pin } = usePinWithItems(selectedPinId ?? '');
  const { data: rooms = [] } = useRooms();
  const deletePin = useDeletePin();
  const updatePin = useUpdatePin();

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const activePin = pin as PinWithItems | undefined;

  if (!selectedPinId && !selectedRoomId) {
    return (
      <div className="p-3 text-xs text-[#666] flex items-center justify-center h-full">
        Wybierz pokój lub zadanie
      </div>
    );
  }

  if (activePin) {
    const room = rooms.find((r) => r.id === activePin.room_id);
    const isOverdue = activePin.due_date && activePin.status === 'active' && new Date(activePin.due_date) < new Date();

    return (
      <div className="p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2">Szczegóły</div>
        <div className="bg-[#2a2a3e] rounded-md p-3">
          <div className="text-xs font-medium text-[#e0e0e0]">{activePin.title}</div>
          <div className="text-[10px] text-[#fb923c] mt-1">📍 {room?.name ?? 'Nieznany'}</div>
          {isOverdue && (
            <div className="text-[10px] text-red-500 font-medium mt-1">⚠️ Overdue</div>
          )}
          <div className="h-px bg-[#3a3a4e] my-2" />

          {/* Due Date */}
          <div className="text-[10px] text-[#888] mb-1">Termin:</div>
          <input
            type="datetime-local"
            value={activePin.due_date ? new Date(activePin.due_date).toISOString().slice(0, 16) : ''}
            onChange={(e) => updatePin.mutate({
              id: activePin.id,
              due_date: e.target.value ? new Date(e.target.value).toISOString() : null,
            })}
            className="w-full text-xs bg-[#1a1a2e] border border-[#3a3a4e] rounded p-1 text-[#e0e0e0]"
          />

          {/* Priority */}
          <div className="text-[10px] text-[#888] mb-1 mt-2">Priorytet:</div>
          <div className="flex gap-1">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updatePin.mutate({ id: activePin.id, priority: activePin.priority === p ? null : p })}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  activePin.priority === p
                    ? 'bg-[#3a3a4e] text-[#e0e0e0]'
                    : 'text-[#666] hover:text-[#aaa]'
                }`}
              >
                {p === 'low' ? 'Niski' : p === 'medium' ? 'Średni' : 'Wysoki'}
              </button>
            ))}
          </div>

          <div className="h-px bg-[#3a3a4e] my-2" />
          <div className="text-[10px] text-[#888] mb-2">Podzadania:</div>
          <ChecklistEditor _items={activePin.checklist_items ?? []} pinId={activePin.id} />
        </div>
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => setSelectedPinId(null)}
            className="flex-1 py-1 text-xs bg-[#2a2a3e] rounded text-center"
          >
            Zamknij
          </button>
          <button
            onClick={() => { deletePin.mutate(activePin.id); setSelectedPinId(null); }}
            className="flex-1 py-1 text-xs bg-[#2a2a3e] rounded text-[#ef4444]"
          >
            Usuń
          </button>
        </div>
      </div>
    );
  }

  if (selectedRoom) {
    return (
      <div className="p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2">Szczegóły pokoju</div>
        <div className="bg-[#2a2a3e] rounded-md p-3">
          <div className="text-xs font-medium" style={{ color: selectedRoom.color }}>{selectedRoom.name}</div>
          <div className="text-[10px] text-[#888] mt-2">
            Pozycja: {selectedRoom.x.toFixed(2)}, {selectedRoom.y.toFixed(2)}
          </div>
        </div>
        <button
          onClick={() => setSelectedRoomId(null)}
          className="mt-2 w-full py-1 text-xs bg-[#2a2a3e] rounded"
        >
          Zamknij
        </button>
      </div>
    );
  }

  return null;
}
