import { defineConfig, devices } from '@playwright/test';

// Port 3000 taken? Run with another one: PORT=3001 npx playwright test
const PORT = Number(process.env.PORT ?? 3000);

// db.ts uses node:sqlite, which Node.js 22 still calls experimental. This keeps the warning out of the test output.
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ''} --disable-warning=ExperimentalWarning`;

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
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/recruiter.json' },
            dependencies: ['setup'],
        },
        // the same Chromium, in another time zone
        {
            name: 'chromium-tokyo',
            grep: /@timezone/, // only the tests with this tag
            use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/recruiter.json', timezoneId: 'Asia/Tokyo' },
            dependencies: ['setup'],
        },
        // signs in once and saves the session: https://playwright.dev/docs/auth
        { name: 'setup', testMatch: /.*\.setup\.ts/ },

        // Done early · another engine, without the time zone tests. It runs only when it is named: --project=firefox
        {
            name: 'firefox',
            grepInvert: /@timezone/,
            use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/recruiter.json' },
            dependencies: ['setup'],
            default: false,
        },
    ],
    webServer: {
        command: 'npm --prefix ../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: !process.env.CI,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
    },
});
