import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WidgetLayoutItem } from '@/types/database';
import { db } from '@/lib/db';

const persistLayout = async (state: DashboardLayoutState) => {
  // Save visible widgets
  await db.dashboardLayout.put({
    key: 'visibleWidgets',
    value: state.visibleWidgets,
    updatedAt: new Date(),
  });

  // Save widget order (sorted by order property)
  const widgetOrder = state.widgets
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(w => w.id);

  await db.dashboardLayout.put({
    key: 'widgetOrder',
    value: widgetOrder,
    updatedAt: new Date(),
  });
};

export interface WidgetConfig {
  id: string;
  name: string;
  component: string;
  defaultVisible: boolean;
  order: number;
}

export interface DashboardLayoutState {
  // Existing layout state
  layout: WidgetLayoutItem[];
  setLayout: (layout: WidgetLayoutItem[]) => void;
  moveWidget: (widgetId: string, toIndex: number) => void;
  resetLayout: () => void;

  // New widget registry state
  widgets: WidgetConfig[];
  visibleWidgets: string[];
  addWidget: (widget: WidgetConfig) => void;
  removeWidget: (id: string) => void;
  toggleWidgetVisibility: (id: string) => void;
  reorderWidgets: (newOrder: string[]) => void;
}

const DEFAULT_LAYOUT: WidgetLayoutItem[] = [
  { id: 'clock', w: 2, h: 1 },
  { id: 'sleep', w: 2, h: 2 },
  { id: 'habits', w: 2, h: 2 },
  { id: 'nootropics', w: 2, h: 2 },
  { id: 'todo', w: 2, h: 2 },
  { id: 'calendar', w: 2, h: 2 },
  { id: 'timer', w: 1, h: 1 },
  { id: 'weather', w: 2, h: 2 },
  { id: 'stocks', w: 2, h: 2 },
  { id: 'notepad', w: 2, h: 2 },
  { id: 'analytics', w: 2, h: 2 },
  { id: 'finance', w: 2, h: 2 },
  { id: 'air-quality', w: 2, h: 2 },
  { id: 'fred', w: 2, h: 2 },
  { id: 'eia', w: 2, h: 2 },
];

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'analytics', name: 'Analytics', component: 'AnalyticsWidget', defaultVisible: true, order: 1 },
  { id: 'calendar', name: 'Calendar', component: 'CalendarWidget', defaultVisible: true, order: 2 },
  { id: 'sleep', name: 'Sleep', component: 'SleepWidget', defaultVisible: true, order: 3 },
  { id: 'timer', name: 'Timer', component: 'TimerWidget', defaultVisible: true, order: 4 },
  { id: 'todo', name: 'Todo', component: 'TodoWidget', defaultVisible: true, order: 5 },
  { id: 'weather', name: 'Weather', component: 'WeatherWidget', defaultVisible: true, order: 6 },
];

const DEFAULT_VISIBLE_WIDGETS: string[] = ['analytics', 'calendar', 'sleep', 'timer', 'todo', 'weather'];

const storage = {
  getItem: (name: string) => {
    try {
      const value = localStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore storage errors
    }
  },
};

export const useDashboardLayout = create<DashboardLayoutState>()(
  persist(
    (set) => ({
      // Existing layout state
      layout: DEFAULT_LAYOUT,
      setLayout: (layout) => set({ layout }),

      moveWidget: (widgetId, toIndex) =>
        set((state) => {
          const fromIndex = state.layout.findIndex((w) => w.id === widgetId);
          if (fromIndex === -1 || fromIndex === toIndex) return state;

          const updated = [...state.layout];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);

          return { layout: updated };
        }),

      resetLayout: () => set({ layout: DEFAULT_LAYOUT }),

      // New widget registry state
      widgets: DEFAULT_WIDGETS,
      visibleWidgets: DEFAULT_VISIBLE_WIDGETS,

      addWidget: async (widget) => {
        set((state) => ({
          widgets: [...state.widgets, { ...widget, order: state.widgets.length + 1 }],
          visibleWidgets: [...state.visibleWidgets, widget.id],
        }));
        const state = useDashboardLayout.getState();
        await persistLayout(state);
      },

      removeWidget: async (id) => {
        set((state) => ({
          widgets: state.widgets.filter(w => w.id !== id),
          visibleWidgets: state.visibleWidgets.filter(wId => wId !== id),
        }));
        const state = useDashboardLayout.getState();
        await persistLayout(state);
      },

      toggleWidgetVisibility: async (id) => {
        set((state) => ({
          visibleWidgets: state.visibleWidgets.includes(id)
            ? state.visibleWidgets.filter(wId => wId !== id)
            : [...state.visibleWidgets, id],
        }));
        const state = useDashboardLayout.getState();
        await persistLayout(state);
      },

      reorderWidgets: async (newOrder) => {
        set((state) => ({
          widgets: state.widgets.map(w => ({
            ...w,
            order: newOrder.indexOf(w.id),
          })),
        }));
        const state = useDashboardLayout.getState();
        await persistLayout(state);
      },
    }),
    {
      name: 'dashboard-layout',
      storage,
    },
  ),
);
