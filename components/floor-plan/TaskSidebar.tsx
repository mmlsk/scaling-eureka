'use client';

import { useState } from 'react';
import { usePins } from '@/lib/queries/use-pins';
import { useFloorPlanUIStore } from '@/store/slices/floor-plan-ui';
import { TaskListItem } from './TaskListItem';
import type { Pin } from '@/lib/types/floor-plan';

export function TaskSidebar() {
  const { data: pins = [], isLoading } = usePins();
  const { filter, selectedPinId, setSelectedPinId } = useFloorPlanUIStore();
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'dueDate'>('priority');

  const filteredPins = pins.filter((p) => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'done') return p.status === 'done';
    return true;
  });

  const getPriorityValue = (priority: Pin['priority']) => {
    if (priority === 'high') return 3;
    if (priority === 'medium') return 2;
    if (priority === 'low') return 1;
    return 0;
  };

  const sortedPins = [...filteredPins].sort((a, b) => {
    if (sortBy === 'priority') {
      return getPriorityValue(b.priority) - getPriorityValue(a.priority);
    }
    if (sortBy === 'dueDate') {
      const aDue = a.due_date ?? '9999-12-31T23:59:59.999Z';
      const bDue = b.due_date ?? '9999-12-31T23:59:59.999Z';
      return aDue < bDue ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });

  const totalCompleted = pins.filter((p) => p.status === 'done').length;

  if (isLoading) return <div className="p-3 text-xs text-[#888]">Ładowanie...</div>;

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2">Zadania</div>

      {/* Filters */}
      <div className="flex gap-1 mb-3">
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => useFloorPlanUIStore.getState().setFilter(f)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              filter === f ? 'bg-[#2a2a3e] text-[#e0e0e0]' : 'text-[#666] hover:text-[#aaa]'
            }`}
          >
            {f === 'all' ? 'Wszystkie' : f === 'active' ? 'Aktywne' : 'Ukończone'}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex gap-1 mb-3">
        {(['priority', 'dueDate', 'name'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSortBy(s)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              sortBy === s ? 'bg-[#2a2a3e] text-[#e0e0e0]' : 'text-[#666] hover:text-[#aaa]'
            }`}
          >
            {s === 'priority' ? 'Priorytet' : s === 'dueDate' ? 'Termin' : 'Nazwa'}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
        {sortedPins.map((pin) => (
          <TaskListItem
            key={pin.id}
            pin={pin}
            isSelected={selectedPinId === pin.id}
            onClick={() => setSelectedPinId(pin.id)}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="border-t border-[#2a2a3e] pt-2 mt-2 text-[10px] text-[#666]">
        Postęp: {totalCompleted}/{pins.length} zadań ({pins.length > 0 ? Math.round((totalCompleted / pins.length) * 100) : 0}%)
      </div>
    </div>
  );
}
