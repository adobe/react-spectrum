import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Look for test files in the "e2e" directory, relative to this configuration file.
  testDir: 'e2e',

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: 'html',

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://127.0.0.1:3000',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
        {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'firefox-mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'webkit-mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'chromium-forced-colors',
      use: { ...devices['Desktop Chrome'], contextOptions: {forcedColors: 'active'} },
    }
  ],
  webServer: [
    {
      command: 'yarn build:test-apps && npx http-server -p 3000 tmp',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !process.env.CI,
    },
  ]
});