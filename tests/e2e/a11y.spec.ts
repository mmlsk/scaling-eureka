import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('A11y — dashboard widgets', () => {
  test('dashboard has no critical violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('.widget, [data-widget-id]');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = results.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations).toEqual([]);
  });

  test('each widget has aria-label', async ({ page }) => {
    await page.goto('/dashboard');
    const widgets = page.locator('[data-widget-id]');
    const count = await widgets.count();
    for (let i = 0; i < count; i++) {
      await expect(widgets.nth(i)).toHaveAttribute('aria-label', /Widget:.+/);
    }
  });

  test('drag handles have aria-label', async ({ page }) => {
    await page.goto('/dashboard');
    const handles = page.locator('.widget-drag-handle');
    const count = await handles.count();
    for (let i = 0; i < count; i++) {
      await expect(handles.nth(i)).toHaveAttribute('aria-label', /Przesuń widget:/);
    }
  });
});
