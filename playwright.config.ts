import { defineConfig, devices } from '@playwright/test';

const config = {
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry' as const,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
};

if (!process.env.PLAYWRIGHT_BASE_URL) {
  (config as Record<string, unknown>).webServer = {
    command: 'npm run build && npm run start',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  };
}

export default defineConfig(config);
