import { defineConfig, devices } from '@playwright/test';

// Port 3000 taken? Run with another one: PORT=3001 npx playwright test
const PORT = Number(process.env.PORT ?? 3000);

// https://playwright.dev/docs/test-snapshots
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],

    // A baseline is written only when you ask for it: --update-snapshots
    updateSnapshots: 'none',
    // One folder for all baselines. The file name says which browser and which platform made the image.
    snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}-{platform}{ext}',
    expect: {
        // The tolerance: which share of the pixels may differ. 0 is the default: every pixel counts.
        // Try 0.01, one per cent: the test in 2-regression.spec.ts passes, although the page has a new bar.
        toHaveScreenshot: { maxDiffPixelRatio: 0 },
    },

    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        // another browser needs baselines of its own. On demand: --project=firefox
        { name: 'firefox', use: { ...devices['Desktop Firefox'] }, default: false },
    ],
    webServer: {
        command: 'npm --prefix ../../app start',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: !process.env.CI,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
    },
});
