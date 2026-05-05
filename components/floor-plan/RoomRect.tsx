'use client';

import { Rnd } from 'react-rnd';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { Room } from '@/lib/types/floor-plan';

interface RoomRectProps {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onDragStop: (x: number, y: number) => void;
  onResizeStop: (width: number, height: number) => void;
  onDoubleClick: () => void;
}

export function RoomRect({ room, isSelected, onSelect, onDragStop, onResizeStop, onDoubleClick }: RoomRectProps) {
  const planWidth = 800;
  const planHeight = 600;

  const handleDragStop: RndDragCallback = (_, d) => {
    onDragStop(d.x / planWidth, d.y / planHeight);
  };

  const handleResizeStop: RndResizeCallback = (_, __, ref) => {
    const w = parseFloat(ref.style.width) || 0;
    const h = parseFloat(ref.style.height) || 0;
    onResizeStop(w / planWidth, h / planHeight);
  };

  return (
    <Rnd
      size={{ width: room.width * planWidth, height: room.height * planHeight }}
      position={{ x: room.x * planWidth, y: room.y * planHeight }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      style={{ position: 'absolute' }}
    >
      <div
        className="h-full w-full rounded-md border-2 cursor-move flex items-center justify-center"
        style={{
          borderColor: isSelected ? '#fb923c' : room.color,
          backgroundColor: `${room.color}15`,
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onDoubleClick={onDoubleClick}
        role="button"
        aria-label={`Pokój: ${room.name}, pozycja ${room.x.toFixed(2)}, ${room.y.toFixed(2)}`}
        tabIndex={0}
      >
        <span className="text-xs font-medium" style={{ color: room.color }}>
          {room.name}
        </span>
      </div>
    </Rnd>
  );
}
