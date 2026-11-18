import { defineConfig, devices } from '@playwright/test';

// Port 3000 taken? Run with another one: PORT=3001 npx playwright test
const PORT = Number(process.env.PORT ?? 3000);

// db.ts uses node:sqlite, which Node.js 22 still calls experimental. This keeps the warning out of the test output.
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ''} --disable-warning=ExperimentalWarning`;

// https://playwright.dev/docs/test-parallel
export default defineConfig({
    testDir: './tests',
    // also the tests inside one file run in parallel; without it only files do
    fullyParallel: true,
    // workers: the default is half of the logical CPU cores. On the command line: --workers=1, --workers=4
    forbidOnly: !!process.env.CI,
    // A retry shows that a test is flaky; it does not repair it. https://playwright.dev/docs/test-retries
    retries: process.env.CI ? 2 : 0,
    // on CI a test that passes only on a retry fails the run: https://playwright.dev/docs/api/class-testconfig#test-config-fail-on-flaky-tests
    failOnFlakyTests: !!process.env.CI,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        // a trace of the retry, so that a flaky test leaves evidence
        trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    },
    projects: [
        // No setup project any more: no reset, and every worker signs in with its own account (fixtures.ts).
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'npm --prefix ../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: !process.env.CI,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
    },
});
