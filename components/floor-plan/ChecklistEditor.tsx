'use client';

import { useState } from 'react';
import { useCreateChecklistItem, useToggleChecklistItem } from '@/lib/queries/use-pins';
import type { ChecklistItem } from '@/lib/types/floor-plan';

interface ChecklistEditorProps {
  _items: ChecklistItem[];
  pinId: string;
}

export function ChecklistEditor({ _items, pinId }: ChecklistEditorProps) {
  const [newText, setNewText] = useState('');
  const createItem = useCreateChecklistItem();
  const toggleItem = useToggleChecklistItem();

  const handleAdd = () => {
    if (!newText.trim()) return;
    createItem.mutate({
      pin_id: pinId,
      user_id: '',
      text: newText.trim(),
      completed: false,
      order: _items.length,
      deleted_at: null,
    });
    setNewText('');
  };

  return (
    <div className="space-y-2">
      {_items
        .sort((a, b) => a.order - b.order)
        .map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem.mutate({ id: item.id, completed: !item.completed })}
              className="accent-[#22c55e]"
              aria-label={`${item.text} — ${item.completed ? 'ukończone' : 'aktywne'}`}
            />
            <span className={`text-xs ${item.completed ? 'line-through text-[#888]' : 'text-[#e0e0e0]'}`}>
              {item.text}
            </span>
          </div>
        ))}
      <div className="flex gap-1 mt-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Dodaj podzadanie..."
          className="flex-1 px-2 py-1 text-xs bg-[#151522] border border-[#2a2a3e] rounded"
        />
        <button onClick={handleAdd} className="px-2 py-1 text-xs bg-[#2a2a3e] rounded">+</button>
      </div>
    </div>
  );
}
