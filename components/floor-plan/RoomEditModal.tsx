'use client';

import { useState, useRef } from 'react';
import { useUpdateRoom } from '@/lib/queries/use-rooms';
import { createClient } from '@/lib/supabase/client';
import type { Room } from '@/lib/types/floor-plan';

interface RoomEditModalProps {
  room: Room;
  onClose: () => void;
}

const COLORS = ['#fb923c', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#eab308'];

export function RoomEditModal({ room, onClose }: RoomEditModalProps) {
  const [name, setName] = useState(room.name);
  const [color, setColor] = useState(room.color);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateRoom = useUpdateRoom();

  const handleSave = () => {
    updateRoom.mutate({ id: room.id, name, color });
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${room.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('floor-plan-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('floor-plan-images')
        .getPublicUrl(fileName);

      updateRoom.mutate({ id: room.id, image_url: data.publicUrl });
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#1e1e2e] rounded-lg p-4 w-80" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-medium mb-4">Edytuj pokój</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#888]">Nazwa</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-[#151522] border border-[#2a2a3e] rounded mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-[#888]">Kolor</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: color === c ? '#fff' : c }}
                  aria-label={`Kolor: ${c}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888]">Obraz tła</label>
            {room.image_url && (
              <div className="mt-1 mb-2">
                <img src={room.image_url} alt="Preview" className="w-full h-20 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => updateRoom.mutate({ id: room.id, image_url: null })}
                  className="text-xs text-red-500 mt-1"
                >
                  Usuń obraz
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-1 px-2 py-1 text-xs bg-[#2a2a3e] rounded hover:bg-[#3a3a4e] transition-colors"
            >
              {uploading ? 'Wysyłanie...' : room.image_url ? 'Zmień obraz' : 'Dodaj obraz'}
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-1.5 text-xs bg-[#2a2a3e] rounded">Anuluj</button>
            <button onClick={handleSave} className="flex-1 py-1.5 text-xs bg-[#fb923c] text-black rounded">Zapisz</button>
          </div>
        </div>
      </div>
    </div>
  );
}
