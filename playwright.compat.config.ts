import { defineConfig, devices } from 'playwright/test';
import config from './playwright.config';

// Optional engine checks reuse the same server, reporters and smoke cases.
export default defineConfig({
  ...config,
  projects: [
    { name: 'desktop-firefox', grep: /@smoke/, use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    // Engine compatibility and emulation, not physical Safari/iPhone validation.
    { name: 'desktop-webkit', grep: /@smoke/, use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-webkit', grep: /@smoke/, use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } },
  ],
});
