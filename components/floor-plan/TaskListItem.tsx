'use client';

import type { Pin } from '@/lib/types/floor-plan';

interface TaskListItemProps {
  pin: Pin & { items?: { completed: boolean }[]; roomName?: string };
  isSelected: boolean;
  onClick: () => void;
}

export function TaskListItem({ pin, isSelected, onClick }: TaskListItemProps) {
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

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    return date.toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`p-2 rounded-md cursor-pointer transition-colors relative ${
        isOverdue ? 'animate-pulse' : ''
      }`}
      style={{
        backgroundColor: isSelected ? '#2a2a3e' : 'transparent',
        borderLeft: `3px solid ${
          isOverdue ? '#ef4444' :
          isDueSoon ? '#eab308' :
          isDone ? '#22c55e' : '#f59e0b'
        }`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Zadanie: ${pin.title}, pokój: ${pin.roomName ?? ''}, ${completedCount}/${totalCount}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-[#e0e0e0]">{pin.title}</div>
        <div className="flex items-center gap-1">
          {priorityColor && (
            <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
          )}
          {pin.due_date && (
            <div className={`text-[10px] ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-yellow-500' : 'text-[#888]'}`}>
              📅 {formatDueDate(pin.due_date)}
            </div>
          )}
        </div>
      </div>
      <div className="text-[10px] text-[#888] mt-0.5">📍 {pin.roomName}</div>
      {totalCount > 0 && (
        <div className="text-[10px] text-[#aaa] mt-1">☐ {completedCount}/{totalCount} zadań</div>
      )}
    </div>
  );
}
