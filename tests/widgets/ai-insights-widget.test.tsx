import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AIInsightsWidget from '@/app/dashboard/_components/ai-insights-widget';

// Mock useAIInsights hook
vi.mock('@/lib/queries/use-ai-insights', () => ({
  useAIInsights: () => ({
    data: [
      {
        id: '1',
        type: 'pattern',
        title: 'Sleep Pattern',
        description: 'You sleep better on weekends',
        priority: 'medium',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

afterEach(() => {
  cleanup();
});

describe('AIInsightsWidget', () => {
  it('renders without crashing', () => {
    renderWithProviders(<AIInsightsWidget />);
    expect(screen.getByLabelText('Widget: AI Insights')).toBeInTheDocument();
  });

  it('displays insights', () => {
    renderWithProviders(<AIInsightsWidget />);
    expect(screen.getByText('Sleep Pattern')).toBeInTheDocument();
  });

  it('displays priority badge', () => {
    renderWithProviders(<AIInsightsWidget />);
    expect(screen.getByText('medium')).toBeInTheDocument();
  });
});
