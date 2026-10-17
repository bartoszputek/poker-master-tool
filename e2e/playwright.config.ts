import { defineConfig, devices } from '@playwright/test';

// Set E2E_BASE_URL to test a server that already runs, for example the dev server or Docker.
const baseURL: string | undefined = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: '.',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: baseURL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // The addon must be built and the lookup table generated before the tests start.
  webServer: baseURL
    ? undefined
    : {
        command: 'pnpm build && pnpm start',
        cwd: '..',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
