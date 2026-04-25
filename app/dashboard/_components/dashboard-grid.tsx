'use client';

import { lazy, Suspense, useMemo, useState, type ComponentType } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
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
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import type { WidgetLayoutItem } from '@/types/database';

/* ─── Lazy-loaded widgets ─── */
const ClockWidget = lazy(() => import('./clock-widget'));
const SleepWidget = lazy(() => import('./sleep-widget'));
const HabitsWidget = lazy(() => import('./habits-widget'));
const NootropicsWidget = lazy(() => import('./nootropics-widget'));
const TodoWidget = lazy(() => import('./todo-widget'));
const CalendarWidget = lazy(() => import('./calendar-widget'));
const TimerWidget = lazy(() => import('./timer-widget'));
const WeatherWidget = lazy(() => import('./weather-widget'));
const StocksWidget = lazy(() => import('./stocks-widget'));
const NotepadWidget = lazy(() => import('./notepad-widget'));
const AnalyticsWidget = lazy(() => import('./analytics-widget'));
const FinanceWidgets = lazy(() => import('./finance-widgets'));
const ProgressBars = lazy(() => import('./progress-bars'));

function WidgetSkeleton() {
  return (
    <div className="widget">
      <div className="skeleton" style={{ height: '80px', width: '100%' }} />
    </div>
  );
}

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

/** Widget title map for DragOverlay ghost preview */
const WIDGET_TITLES: Record<string, string> = {
  clock: 'Zegar',
  sleep: 'Sen',
  habits: 'Nawyki',
  nootropics: 'Nootropy',
  todo: 'Todo',
  calendar: 'Kalendarz',
  timer: 'Timer',
  weather: 'Pogoda',
  stocks: 'Giełda',
  notepad: 'Notatki',
  analytics: 'Analityka',
  finance: 'Finanse',
  progress: 'Postęp',
};

function WidgetGhostPreview({ widgetId }: { widgetId: string }) {
  return (
    <div
      className="widget"
      style={{ opacity: 0.8, transform: 'scale(1.05)', pointerEvents: 'none' }}
    >
      <div className="widget-header">{WIDGET_TITLES[widgetId] ?? widgetId}</div>
      <div className="widget-body">
        <div className="skeleton" style={{ height: '40px', width: '100%' }} />
      </div>
    </div>
  );
}

interface SortableWidgetProps {
  item: WidgetLayoutItem;
  isMobile: boolean;
}

function SortableWidget({ item, isMobile }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const colSpan = isMobile ? 1 : (item.w ?? 1);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${item.h}`,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const WidgetComponent = WIDGET_REGISTRY[item.id] ?? PlaceholderWidget;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Suspense fallback={<WidgetSkeleton />}>
        <WidgetComponent id={item.id} />
      </Suspense>
    </div>
  );
}

export function DashboardGrid() {
  const layout = useDashboardLayout((s) => s.layout);
  const setLayout = useDashboardLayout((s) => s.setLayout);
  const hydrated = useHydration();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const itemIds = useMemo(() => layout.map((w) => w.id), [layout]);

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
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
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="dashboard-grid">
          {layout.map((item) => (
            <SortableWidget key={item.id} item={item} isMobile={isMobile} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? <WidgetGhostPreview widgetId={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
