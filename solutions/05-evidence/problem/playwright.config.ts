import { defineConfig, devices } from '@playwright/test';

// Config for the one test that produced labs/05-evidence/problem/trace.zip.
const PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
    testDir: '.',
    reporter: [['list']],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        trace: 'on',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm --prefix ../../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: true,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
    },
});
