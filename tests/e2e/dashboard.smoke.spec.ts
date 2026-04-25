import { test, expect } from '@playwright/test';

test.describe('Dashboard smoke', () => {
  test('loads without JS errors and renders grid', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/dashboard');
    await page.waitForSelector('.dashboard-grid, [data-testid="dashboard-grid"]', { timeout: 10_000 });

    expect(errors.filter(e => !e.includes('favicon') && !e.includes('manifest'))).toEqual([]);
  });

  test('calculators page loads', async ({ page }) => {
    await page.goto('/calculators');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
