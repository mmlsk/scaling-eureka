'use client';

import { useRooms, useUpdateRoom, useCreateRoom } from '@/lib/queries/use-rooms';
import { usePins, useUpdatePin, useCreatePin } from '@/lib/queries/use-pins';
import { useFloorPlanRealtime } from '@/lib/queries/use-floor-plan-realtime';
import { useFloorPlanUIStore } from '@/store/slices/floor-plan-ui';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { RoomRect } from './RoomRect';
import { PinMarker } from './PinMarker';
import { AddRoomButton } from './AddRoomButton';
import type { Room } from '@/lib/types/floor-plan';
import type { RoomTemplate } from '@/lib/data/room-templates';

export function FloorPlanGrid() {
  const { data: rooms = [], isLoading, error } = useRooms();
  const updateRoom = useUpdateRoom();
  const createRoom = useCreateRoom();
  const createPin = useCreatePin();
  const { data: pins = [] } = usePins();
  const updatePin = useUpdatePin();
  const qc = useQueryClient();
  const supabase = createClient();
  useFloorPlanRealtime();
  const { selectedRoomId, setSelectedRoomId, setShowRoomEditModal, selectedPinId, setSelectedPinId } = useFloorPlanUIStore();

  const handleSelectTemplate = async (template: RoomTemplate | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const order = rooms.length;
      const x = 10;
      const y = 10 + rooms.length * 160;
      const width = 200;
      const height = 150;

      const roomName = template?.name ?? 'Nowy pokój';
      const roomColor = template?.color ?? '#666666';

      const newRoom = await createRoom.mutateAsync({
        user_id: user.id,
        name: roomName,
        x,
        y,
        width,
        height,
        color: roomColor,
        image_url: null,
        order,
        deleted_at: null,
      });

      if (template && template.tasks.length > 0) {
        const pinPromises = template.tasks.map((task, index) => {
          return createPin.mutateAsync({
            user_id: user.id,
            room_id: newRoom.id,
            title: task,
            x: 10 + index * 15,
            y: 10 + index * 15,
            status: 'active',
            due_date: null,
            priority: null,
            deleted_at: null,
          });
        });
        await Promise.all(pinPromises);
      }

      qc.invalidateQueries({ queryKey: ['floor-plan-rooms'] });
      qc.invalidateQueries({ queryKey: ['floor-plan-pins'] });
    } catch (error) {
      console.error('Error creating room from template:', error);
    }
  };

  const backgroundImage = rooms.find((r) => r.image_url)?.image_url ?? null;

  const getRoomAtPosition = (x: number, y: number, rooms: Room[]): Room | undefined => {
    return rooms.find(
      (room) => x >= room.x && x <= room.x + room.width && y >= room.y && y <= room.y + room.height
    );
  };

  const handleDragStop = (room: Room, x: number, y: number) => {
    updateRoom.mutate({ id: room.id, x, y });
  };

  const handleResizeStop = (room: Room, width: number, height: number) => {
    updateRoom.mutate({ id: room.id, width, height });
  };

  const handlePinRoomChange = (pinId: string, x: number, y: number) => {
    const targetRoom = getRoomAtPosition(x, y, rooms);
    const currentPin = pins.find((p) => p.id === pinId);
    if (targetRoom && currentPin && targetRoom.id !== currentPin.room_id) {
      updatePin.mutate({ id: pinId, room_id: targetRoom.id });
    }
  };

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Ładowanie planu...</div>;
  if (error) return <div className="p-4 text-sm text-destructive" role="alert">{error.message}</div>;

  return (
    <div>
      <div className="mb-4">
        <AddRoomButton onSelectTemplate={handleSelectTemplate} />
      </div>
      <div
        className="relative w-full h-[600px] bg-[#151522] rounded-lg overflow-hidden"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage}), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`
            : 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: backgroundImage ? 'cover, 20px 20px' : '20px 20px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={() => {
          setSelectedRoomId(null);
          setSelectedPinId(null);
        }}
        role="img"
        aria-label="Plan mieszkania z pokojami"
      >
        {rooms.map((room) => (
          <RoomRect
            key={room.id}
            room={room}
            isSelected={selectedRoomId === room.id}
            onSelect={() => setSelectedRoomId(room.id)}
            onDragStop={(x, y) => handleDragStop(room, x, y)}
            onResizeStop={(w, h) => handleResizeStop(room, w, h)}
            onDoubleClick={() => {
              setSelectedRoomId(room.id);
              setShowRoomEditModal(true);
            }}
          />
        ))}
        {pins.map((pin) => (
          <PinMarker
            key={pin.id}
            pin={pin}
            isSelected={selectedPinId === pin.id}
            onSelect={() => setSelectedPinId(pin.id)}
            onDragStop={(x, y) => updatePin.mutate({ id: pin.id, x, y })}
            onRoomChange={handlePinRoomChange}
          />
        ))}
      </div>
    </div>
  );
}
