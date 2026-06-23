import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'node_modules/.bin/next dev -H 127.0.0.1',
    env: {
      DATABASE_URL: 'file:./dev.db',
      THENEWSAPI_API_KEY: 'playwright-test-token',
    },
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
});
