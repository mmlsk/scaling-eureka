import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Legacy Component Cleanup', () => {
  const migratedWidgets = [
    'analytics-widget.tsx',
    'timer-widget.tsx',
    'todo-widget.tsx',
    'weather-widget.tsx',
  ];

  migratedWidgets.forEach(file => {
    it(`${file} has no legacy CSS classes`, () => {
      const content = readFileSync(
        join(process.cwd(), 'app/dashboard/_components', file),
        'utf-8'
      );
      // These widgets should use WidgetShell, not legacy classes
      expect(content).not.toMatch(/className="widget"/);
      expect(content).not.toMatch(/className="widget-header"/);
      expect(content).not.toMatch(/className="widget-body"/);
      expect(content).not.toMatch(/className="pill"/);
    });

    it(`${file} uses shadcn WidgetShell`, () => {
      const content = readFileSync(
        join(process.cwd(), 'app/dashboard/_components', file),
        'utf-8'
      );
      expect(content).toMatch(/WidgetShell/);
    });
  });
});
