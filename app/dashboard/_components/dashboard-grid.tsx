'use client';

import type { ComponentType } from 'react';
import { lazy, Suspense, useMemo, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
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
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/utils/toast';

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
const AirQualityWidget = lazy(() => import('./air-quality-widget'));
const FREDWidget = lazy(() => import('./fred-widget'));
const EIAWidget = lazy(() => import('./eia-widget'));
const AIInsightsWidget = lazy(() => import('./ai-insights-widget'));

/** Polish: Enhanced widget-shaped skeleton for Suspense fallback */
function WidgetSkeleton() {
  return (
    <div className="widget">
      <Card size="sm">
        <CardHeader className="py-0">
          <Skeleton variant="text" className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-5/6" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
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
  'air-quality': wrap(AirQualityWidget),
  fred: wrap(FREDWidget),
  eia: wrap(EIAWidget),
  'ai-insights': wrap(AIInsightsWidget),
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
  'air-quality': 'Jakość powietrza',
  fred: 'FRED Makro',
  eia: 'Energia',
  'ai-insights': 'Spostrzeżenia AI',
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

function SortableWidget({ item, isMobile, isOver }: SortableWidgetProps & { isOver?: boolean }) {
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
    <div ref={setNodeRef} style={{ ...style, position: 'relative' }} {...attributes} {...listeners}>
      {isOver && !isDragging && <div className="drop-indicator" />}
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
        <Suspense fallback={<WidgetSkeleton />}>
          <WidgetComponent id={item.id} />
        </Suspense>
      </div>
    </div>
  );
}

export function DashboardGrid() {
  const layout = useDashboardLayout((s) => s.layout);
  const visibleWidgets = useDashboardLayout((s) => s.visibleWidgets);
  const setLayout = useDashboardLayout((s) => s.setLayout);
  const hydrated = useHydration();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const visibleLayout = useMemo(
    () => layout.filter((item) => visibleWidgets.includes(item.id)),
    [layout, visibleWidgets],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const itemIds = useMemo(() => visibleLayout.map((w) => w.id), [visibleLayout]);

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    setOverId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layout.findIndex((w) => w.id === active.id);
    const newIndex = layout.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(layout, oldIndex, newIndex);
    setLayout(reordered);
    toast.success("Układ zapisany");
  }

  if (!hydrated) {
    return (
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
        {/* Polish: Render 8 skeleton widgets with card shapes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="widget">
            <Card size="sm">
              <CardHeader className="py-0">
                <Skeleton variant="text" className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-4 w-full" />
                  <Skeleton variant="text" className="h-4 w-5/6" />
                  <Skeleton variant="text" className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
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
      onDragOver={(e) => setOverId(e.over ? String(e.over.id) : null)}
      onDragCancel={() => { setActiveId(null); setOverId(null); }}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
          {visibleLayout.map((item) => (
            <SortableWidget key={item.id} item={item} isMobile={isMobile} isOver={overId === item.id} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? <WidgetGhostPreview widgetId={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
