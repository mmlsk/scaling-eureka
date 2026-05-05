'use client';

import { useState, useRef, useEffect } from 'react';
import type { RoomTemplate } from '@/lib/data/room-templates';
import { roomTemplates } from '@/lib/data/room-templates';

interface AddRoomButtonProps {
  onSelectTemplate: (template: RoomTemplate | null) => void;
}

export function AddRoomButton({ onSelectTemplate }: AddRoomButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (template: RoomTemplate | null) => {
    onSelectTemplate(template);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-xs border border-dashed border-[#444] rounded-md text-[#888] hover:border-[#666] hover:text-[#aaa] transition-colors flex items-center gap-1"
        aria-label="Dodaj pokój"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        + Dodaj pokój
        <span className="text-[10px]">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-[#151522] border border-[#444] rounded-md shadow-lg z-50 py-1">
          {/* Empty room option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="w-full px-3 py-2 text-left text-xs text-[#aaa] hover:bg-[#1e1e32] transition-colors"
          >
            Pusty pokój
          </button>

          {/* Separator */}
          <div className="my-1 border-t border-[#444]" />

          {/* Template list */}
          {roomTemplates.map((template) => (
            <button
              key={template.name}
              type="button"
              onClick={() => handleSelect(template)}
              className="w-full px-3 py-2 text-left text-xs text-[#aaa] hover:bg-[#1e1e32] transition-colors flex items-center gap-2"
            >
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: template.color }}
              />
              {template.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
