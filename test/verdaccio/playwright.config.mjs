import {defineConfig, devices} from '@playwright/test';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const port = Number(process.env.VERDACCIO_SERVER_PORT || 4173);
const useExternalUrl = Boolean(process.env.VERDACCIO_BASE_URL);

export default defineConfig({
  testDir: __dirname,
  outputDir: path.join(repoRoot, 'test-results'),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  reporter: process.env.CI ? [['list'], ['html', {open: 'never'}]] : 'list',
  use: {
    viewport: {width: 1280, height: 720},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Chromatic options (consumed by @chromatic-com/playwright)
    disableAutoSnapshot: true,
    pauseAnimationAtEnd: true,
    assetDomains: ['images.unsplash.com', 'use.typekit.net', 'p.typekit.net']
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']}
    }
  ],
  webServer: useExternalUrl
    ? undefined
    : {
        command: `node ${path.join(__dirname, 'server.mjs')}`,
        url: `http://127.0.0.1:${port}/__health`,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000
      }
});
