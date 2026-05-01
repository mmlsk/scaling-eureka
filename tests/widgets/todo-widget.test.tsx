import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import TodoWidget from '@/app/dashboard/_components/todo-widget';

afterEach(() => {
  cleanup();
});

describe('TodoWidget', () => {
  it('renders without crashing', () => {
    render(<TodoWidget />);
    expect(screen.getAllByLabelText(/Widget: Todo/i).length).toBeGreaterThan(0);
  });

  it('uses shadcn Input for new todo entry', () => {
    render(<TodoWidget />);
    const input = screen.getByPlaceholderText(/Nowe zadanie/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('rounded-lg', 'border-input');
  });
});
