import { defineConfig, devices } from '@playwright/test';

// Port 3000 taken? Run with another one: PORT=3001 npx playwright test
const PORT = Number(process.env.PORT ?? 3000);

// https://playwright.dev/docs/test-configuration
export default defineConfig({
    testDir: './tests',
    // Every test starts with a fresh database (see beforeEach). Two tests at once would pull it away
    // from under each other, so this lab runs with one worker. Case 4 removes the need for that.
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        trace: 'retain-on-failure',
        // a wrong locator fails after 5 seconds, not after 30: https://playwright.dev/docs/test-timeouts
        actionTimeout: 5_000,
    },
    projects: [
        // The browser project comes first: UI mode shows the first project when it opens.
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/recruiter.json' },
            dependencies: ['setup'],
        },
        // signs in once and saves the session: https://playwright.dev/docs/auth
        { name: 'setup', testMatch: /.*\.setup\.ts/ },
    ],
    webServer: {
        command: 'npm --prefix ../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: !process.env.CI,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
    },
});
