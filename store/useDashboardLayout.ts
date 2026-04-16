import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WidgetLayoutItem } from '@/types/database';

export interface DashboardLayoutState {
  layout: WidgetLayoutItem[];
  setLayout: (layout: WidgetLayoutItem[]) => void;
  moveWidget: (widgetId: string, toIndex: number) => void;
  resetLayout: () => void;
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
];

export const useDashboardLayout = create<DashboardLayoutState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'dashboard-layout',
    },
  ),
);
