import { defineConfig } from '@playwright/test';

const slowMultiplier = Number(process.env.SLOW) || 0;

export default defineConfig({
  testDir: './e2e',
  timeout: slowMultiplier ? 60_000 : 15_000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: !slowMultiplier,
    launchOptions: {
      slowMo: slowMultiplier * 500,
    },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
