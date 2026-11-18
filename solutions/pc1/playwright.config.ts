import { defineConfig, devices } from '@playwright/test';

// Port 3000 taken? Run with another one: PORT=3001 npx playwright test
const PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        trace: 'retain-on-failure', // every red test keeps its trace
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm --prefix ../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: true,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
    },
});
