import { defineConfig, devices } from '@playwright/test';

// Port 3000 taken? Run with another one: PORT=3001 npx playwright test
const PORT = Number(process.env.PORT ?? 3000);

// db.ts uses node:sqlite, which Node.js 22 still calls experimental. This keeps the warning out of the test output.
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ''} --disable-warning=ExperimentalWarning`;

const recruiter = 'playwright/.auth/recruiter.json';
const chrome = { ...devices['Desktop Chrome'], storageState: recruiter };

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
        trace: 'retain-on-failure',
        testIdAttribute: 'data-qa', // getByTestId() reads this application's test attribute
    },
    projects: [
        // The browser project comes first: UI mode shows the first project when it opens.
        { name: 'chromium', use: { ...chrome }, dependencies: ['setup'] },

        // Time zones, in Chromium only: a date is computed by JavaScript, not by the rendering engine,
        // so one engine is enough. These projects run only the tests tagged @timezone.
        // https://playwright.dev/docs/test-projects
        {
            name: 'chromium-new-york',
            grep: /@timezone/,
            use: { ...chrome, timezoneId: 'America/New_York' },
            dependencies: ['setup'],
        },
        {
            name: 'chromium-tokyo',
            grep: /@timezone/,
            use: { ...chrome, timezoneId: 'Asia/Tokyo' },
            dependencies: ['setup'],
        },

        // The other engines run everything except the time zone tests. On demand: --project=firefox
        {
            name: 'firefox',
            grepInvert: /@timezone/,
            use: { ...devices['Desktop Firefox'], storageState: recruiter },
            dependencies: ['setup'],
            default: false,
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
