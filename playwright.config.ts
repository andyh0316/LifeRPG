import { defineConfig } from '@playwright/test';

const headed = !!process.env.HEADED;
const slowMultiplier = Number(process.env.SLOW) || 0;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: headed || slowMultiplier ? 60_000 : 15_000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: !headed,
    launchOptions: {
      slowMo: slowMultiplier * 500,
    },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: [
    {
      command: 'pnpm dev:api:test',
      port: 3000,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: 'pnpm dev:web',
      port: 5173,
      reuseExistingServer: false,
    },
  ],
});
