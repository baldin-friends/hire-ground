import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);

// `CI=1 npx playwright test` gives your laptop the conditions of the pipeline.
const CI = !!process.env.CI;

// A developer laptop in Germany.
const laptop = { locale: 'de-DE', timezoneId: 'Europe/Berlin' };

// The pipeline tests the app as staging runs it: three of its teaching bugs are
// switched on there. They travel in the same cookie that `?bugs=` sets.
const pipeline = {
    storageState: {
        cookies: [
            {
                name: 'hg_bugs',
                value: 'slow-search,slow-analytics,locale-dates',
                domain: 'localhost',
                path: '/',
                expires: -1,
                httpOnly: false,
                secure: false,
                sameSite: 'Lax' as const,
            },
        ],
        origins: [],
    },
};

// The app expects its third-party stand-in on 127.0.0.1:3999. A second copy of
// the app on another PORT has it on PORT + 999, so the browser is pointed there.
const thirdParty = PORT === 3000 ? [] : [`--host-resolver-rules=MAP 127.0.0.1:3999 127.0.0.1:${PORT + 999}`];

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    globalSetup: './global-setup.ts',
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: CI ? 'on' : 'retain-on-failure',
        screenshot: 'only-on-failure',
        // the pipeline agent is shared and slow: 100 ms on top of every action
        launchOptions: { slowMo: CI ? 100 : 0, args: thirdParty },
        ...(CI ? pipeline : laptop),
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm --prefix ../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: true,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
    },
});
