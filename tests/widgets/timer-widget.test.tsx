import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import TimerWidget from '@/app/dashboard/_components/timer-widget';

afterEach(() => {
  cleanup();
});

describe('TimerWidget', () => {
  it('renders without crashing', () => {
    render(<TimerWidget />);
    expect(screen.getByLabelText('Widget: Timer')).toBeInTheDocument();
  });

  it('uses shadcn Button for start/stop controls', () => {
    const { container: _container } = render(<TimerWidget />);
    const startButtons = screen.getAllByRole('button', { name: 'Start' });
    expect(startButtons.length).toBe(1);
    expect(startButtons[0]).toHaveClass('bg-primary');
  });
});
