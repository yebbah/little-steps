import { defineConfig, devices } from '@playwright/test'

// End-to-end and accessibility tests. Unit and component tests stay in Vitest (src/**).
// The app is served in Vite "test" mode with the component gallery enabled (Story 2.1),
// the same build the "Frontend: accessibility" CI job uses (Story 2.7).
const PORT = Number(process.env.E2E_PORT ?? 4173)
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './test-results/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // Lands next to the Vitest JUnit file so the epic release note can read both.
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
  ],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure-and-retries',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // The nightly browser matrix (see test-design-epic-2.md). Off on pull requests: E2E_ALL_BROWSERS=true.
    ...(process.env.E2E_ALL_BROWSERS === 'true'
      ? [
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        ]
      : []),
  ],
  // Skipped when BASE_URL points at a server that is already running.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npx vite --mode test --port ${PORT} --strictPort`,
        url: BASE_URL,
        // A leftover server on this port would run the tests against stale code. Reuse one only when asked.
        reuseExistingServer: process.env.E2E_REUSE_SERVER === 'true',
        timeout: 120_000,
        env: { VITE_ENABLE_GALLERY: 'true' },
      },
})
