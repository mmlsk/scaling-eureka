'use client';

import { Rnd, type RndDragCallback } from 'react-rnd';
import type { Pin } from '@/lib/types/floor-plan';

interface PinMarkerProps {
  pin: Pin & { items?: { completed: boolean }[] };
  isSelected: boolean;
  onSelect: () => void;
  onDragStop: (x: number, y: number) => void;
  onRoomChange?: (pinId: string, x: number, y: number) => void;
}

export function PinMarker({ pin, isSelected, onSelect, onDragStop, onRoomChange }: PinMarkerProps) {
  const completedCount = pin.items?.filter((i) => i.completed).length ?? 0;
  const totalCount = pin.items?.length ?? 0;
  const isDone = pin.status === 'done';

  const now = new Date();
  const isOverdue = pin.due_date && !isDone && new Date(pin.due_date) < now;
  const isDueSoon = pin.due_date && !isDone && !isOverdue &&
    (new Date(pin.due_date).getTime() - now.getTime() < 24 * 60 * 60 * 1000);

  const priorityColor = pin.priority === 'high' ? 'bg-red-500' :
    pin.priority === 'medium' ? 'bg-yellow-500' :
    pin.priority === 'low' ? 'bg-green-500' : null;

  const handleDragStop: RndDragCallback = (_, d) => {
    const x = d.x / 800;
    const y = d.y / 600;
    onDragStop(x, y);
    onRoomChange?.(pin.id, x, y);
  };

  return (
    <Rnd
      size={{ width: 16, height: 16 }}
      position={{ x: pin.x * 800, y: pin.y * 600 }}
      onDragStop={handleDragStop}
      bounds="parent"
      style={{ position: 'absolute' }}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold cursor-pointer border-2 relative ${
          isOverdue ? 'animate-pulse' : ''
        }`}
        style={{
          backgroundColor: isDone ? '#22c55e' :
            isOverdue ? '#ef4444' :
            isDueSoon ? '#eab308' : '#f59e0b',
          borderColor: isSelected ? '#fff' : 'transparent',
          color: isDone ? '#fff' : '#000',
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        role="button"
        aria-label={`Zadanie: ${pin.title}, ${completedCount}/${totalCount} zadań`}
        tabIndex={0}
      >
        {totalCount > 0 ? completedCount : '!'}
        {priorityColor && (
          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${priorityColor}`} />
        )}
      </div>
    </Rnd>
  );
}
