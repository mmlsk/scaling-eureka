import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsWidget from '@/app/dashboard/_components/analytics-widget';

describe('AnalyticsWidget', () => {
  it('renders without crashing', () => {
    render(<AnalyticsWidget />);
    const elements = screen.getAllByLabelText(/Widget: Analityka/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('uses WidgetShell with shadcn Card', () => {
    render(<AnalyticsWidget />);
    const elements = screen.getAllByLabelText(/Widget: Analityka/i);
    expect(elements[0]).toHaveClass('rounded-lg');
  });

  it('displays summary badges', () => {
    render(<AnalyticsWidget />);
    const badges = screen.getAllByText(/Nawyki:/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('renders trend chart section', () => {
    render(<AnalyticsWidget />);
    const headings = screen.getAllByText(/Ukończenie nawyków/i);
    expect(headings.length).toBeGreaterThan(0);
  });
});
