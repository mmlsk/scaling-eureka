import { describe, it, expect } from 'vitest';
import { useDashboardLayout } from '@/store/useDashboardLayout';

describe('useDashboardLayout Store', () => {
  it('initializes with default widget list', () => {
    const { widgets } = useDashboardLayout.getState();
    expect(widgets).toBeInstanceOf(Array);
    expect(widgets.length).toBeGreaterThan(0);
  });

  it('adds a widget to the registry', () => {
    const { addWidget } = useDashboardLayout.getState();
    addWidget({ id: 'test-widget', name: 'Test', component: 'TestWidget', defaultVisible: true, order: 99 });
    const { widgets } = useDashboardLayout.getState();
    expect(widgets).toContainEqual(expect.objectContaining({ id: 'test-widget' }));
  });

  it('toggles widget visibility', () => {
    const { toggleWidgetVisibility, visibleWidgets } = useDashboardLayout.getState();
    const initialCount = visibleWidgets.length;
    toggleWidgetVisibility('analytics');
    const { visibleWidgets: v2 } = useDashboardLayout.getState();
    expect(v2.length).toBe(initialCount - 1);
  });
});
