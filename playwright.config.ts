import { defineConfig, devices } from 'playwright/test';

const chromiumLaunchOptions=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ? { executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
  : {};

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4362',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions:chromiumLaunchOptions } },
    { name: 'mobile-chromium', grep: /@smoke/, use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, launchOptions:chromiumLaunchOptions } },
  ],
  webServer: {
    command: 'node node_modules/astro/bin/astro.mjs preview --ignore-lock --host 127.0.0.1 --port 4362',
    url: 'http://127.0.0.1:4362/relax/sounds/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
