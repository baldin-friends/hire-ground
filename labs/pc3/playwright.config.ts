import { defineConfig, devices } from '@playwright/test';

// The hunt has its own copy of Hire Ground, on its own port, configured the way
// staging runs this week. Port taken? PORT=3013 npx playwright test
const PORT = Number(process.env.PORT ?? 3003);

export default defineConfig({
    testDir: './tests',
    globalSetup: './global-setup.ts',
    fullyParallel: true,
    retries: 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        trace: 'retain-on-failure',
        actionTimeout: 10_000,
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm --prefix ../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: true,
        env: {
            PORT: String(PORT),
            HG_ANALYTICS_PORT: String(PORT + 999),
            BUGS: 'debounce-search,pipeline-animation,mail-delay,cookie-banner,unique-email,global-settings,deadline-tz',
        },
    },
});
