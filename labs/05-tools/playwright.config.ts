import { defineConfig, devices } from '@playwright/test';

// Port 3000 taken? Run with another one: PORT=3001 npx playwright test
const PORT = Number(process.env.PORT ?? 3000);

// https://playwright.dev/docs/test-configuration
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        // a trace for every test in this lab, so that a green run can be opened as well: https://playwright.dev/docs/trace-viewer
        trace: 'on',
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
