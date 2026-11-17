import { defineConfig, devices } from '@playwright/test';

// Track B has its own copy of Hire Ground: this morning's deployment.
// Port taken? PORT=3014 npx playwright test
const PORT = Number(process.env.PORT ?? 3004);

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    retries: 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        trace: 'retain-on-failure',
        actionTimeout: 5_000,
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm --prefix ../../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: true,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999), BUGS: 'unique-email' },
    },
});
