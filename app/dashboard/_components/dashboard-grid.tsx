'use client';

import { useMemo, type ComponentType } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDashboardLayout } from '@/store/useDashboardLayout';
import { useHydration } from '@/hooks/useHydration';
import type { WidgetLayoutItem } from '@/types/database';
import ClockWidget from './clock-widget';
import SleepWidget from './sleep-widget';
import HabitsWidget from './habits-widget';
import NootropicsWidget from './nootropics-widget';
import TodoWidget from './todo-widget';
import CalendarWidget from './calendar-widget';
import TimerWidget from './timer-widget';
import WeatherWidget from './weather-widget';
import StocksWidget from './stocks-widget';
import NotepadWidget from './notepad-widget';
import AnalyticsWidget from './analytics-widget';
import FinanceWidgets from './finance-widgets';
import ProgressBars from './progress-bars';

/** Placeholder widget for widgets not yet implemented. */
function PlaceholderWidget({ id }: { id: string }) {
  return (
    <div className="widget">
      <div className="widget-header">{id}</div>
      <div className="widget-body">
        <div className="skeleton" style={{ height: '60px', width: '100%' }} />
      </div>
    </div>
  );
}

/* Wrap default-exported widgets that don't accept {id} props */
function wrap(Comp: ComponentType) {
  return function WrappedWidget(_props: { id: string }) {
    return <Comp />;
  };
}

/**
 * Widget registry — maps widget IDs to their React components.
 */
const WIDGET_REGISTRY: Record<string, ComponentType<{ id: string }>> = {
  clock: wrap(ClockWidget),
  sleep: wrap(SleepWidget),
  habits: wrap(HabitsWidget),
  nootropics: wrap(NootropicsWidget),
  todo: wrap(TodoWidget),
  calendar: wrap(CalendarWidget),
  timer: wrap(TimerWidget),
  weather: wrap(WeatherWidget),
  stocks: wrap(StocksWidget),
  notepad: wrap(NotepadWidget),
  analytics: wrap(AnalyticsWidget),
  finance: wrap(FinanceWidgets),
  progress: wrap(ProgressBars),
};

interface SortableWidgetProps {
  item: WidgetLayoutItem;
}

function SortableWidget({ item }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${item.w}`,
    gridRow: `span ${item.h}`,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const WidgetComponent = WIDGET_REGISTRY[item.id] ?? PlaceholderWidget;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <WidgetComponent id={item.id} />
    </div>
  );
}

export function DashboardGrid() {
  const layout = useDashboardLayout((s) => s.layout);
  const setLayout = useDashboardLayout((s) => s.setLayout);
  const hydrated = useHydration();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const itemIds = useMemo(() => layout.map((w) => w.id), [layout]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layout.findIndex((w) => w.id === active.id);
    const newIndex = layout.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(layout, oldIndex, newIndex);
    setLayout(reordered);
  }

  if (!hydrated) {
    return (
      <div className="dashboard-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="widget">
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="dashboard-grid">
          {layout.map((item) => (
            <SortableWidget key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
