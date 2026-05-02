import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardLayout } from '@/store/useDashboardLayout';
import { db } from '@/lib/db';

describe('Layout Persistence', () => {
  beforeEach(async () => {
    // Clear the dashboardLayout table before each test
    await db.dashboardLayout.clear();
    // Reset the store to initial state
    useDashboardLayout.setState({
      layout: useDashboardLayout.getState().layout,
      widgets: [
        { id: 'analytics', name: 'Analytics', component: 'AnalyticsWidget', defaultVisible: true, order: 1 },
        { id: 'calendar', name: 'Calendar', component: 'CalendarWidget', defaultVisible: true, order: 2 },
        { id: 'sleep', name: 'Sleep', component: 'SleepWidget', defaultVisible: true, order: 3 },
        { id: 'timer', name: 'Timer', component: 'TimerWidget', defaultVisible: true, order: 4 },
        { id: 'todo', name: 'Todo', component: 'TodoWidget', defaultVisible: true, order: 5 },
        { id: 'weather', name: 'Weather', component: 'WeatherWidget', defaultVisible: true, order: 6 },
      ],
      visibleWidgets: ['analytics', 'calendar', 'sleep', 'timer', 'todo', 'weather'],
    });
  });

  it('saves visible widgets to Dexie when toggled', async () => {
    const { toggleWidgetVisibility } = useDashboardLayout.getState();
    await toggleWidgetVisibility('analytics');
    const saved = await db.dashboardLayout.get('visibleWidgets');
    expect(saved?.value).not.toContain('analytics');
  });

  it('saves widget order when reordered', async () => {
    const { reorderWidgets } = useDashboardLayout.getState();
    await reorderWidgets(['todo', 'weather', 'analytics', 'calendar', 'sleep', 'timer']);
    const saved = await db.dashboardLayout.get('widgetOrder');
    expect(saved?.value).toEqual(['todo', 'weather', 'analytics', 'calendar', 'sleep', 'timer']);
  });
});
