// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import WidgetControls from '@/components/layout/widget-controls';
import { useDashboardLayout } from '@/store/useDashboardLayout';

// Mock the store to ensure hidden widgets exist for testing
vi.mock('@/store/useDashboardLayout', () => ({
  useDashboardLayout: vi.fn(),
}));

describe('WidgetControls', () => {
  beforeEach(() => {
    (useDashboardLayout as vi.Mock).mockReturnValue({
      widgets: [
        { id: 'weather', name: 'Weather' },
        { id: 'todo', name: 'Todo List' },
      ],
      visibleWidgets: ['weather'], // 'todo' is hidden
      toggleWidgetVisibility: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('shows add button for hidden widgets', () => {
    render(<WidgetControls />);
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('shows reset layout button', () => {
    render(<WidgetControls />);
    expect(screen.getByRole('button', { name: /reset layout/i })).toBeInTheDocument();
  });
});
