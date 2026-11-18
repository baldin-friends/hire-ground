import { defineConfig, devices } from '@playwright/test';

// Port 3000 taken? Run with another one: PORT=3001 npx playwright test
const PORT = Number(process.env.PORT ?? 3000);

// db.ts uses node:sqlite, which Node.js 22 still calls experimental. This keeps the warning out of the test output.
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ''} --disable-warning=ExperimentalWarning`;

// CI is set by GitHub Actions, GitLab, Jenkins and most other pipelines. shard-locally.sh sets it too.
const CI = !!process.env.CI;

// https://playwright.dev/docs/ci · https://playwright.dev/docs/test-sharding
export default defineConfig({
    testDir: './tests',
    // Shards split the suite test by test. Without fullyParallel they split it file by file,
    // and one large file makes one slow shard.
    fullyParallel: true,
    // a test.only that somebody forgot fails the pipeline instead of silently skipping the rest
    forbidOnly: CI,
    // locally every failure counts; in the pipeline a test may run again, and is then reported as flaky
    retries: CI ? 2 : 0,
    // a test that passes only on a retry fails the pipeline
    failOnFlakyTests: CI,
    // blob: the raw result of one shard, to be merged later. github: failures as annotations in the pull request.
    reporter: CI
        ? [['blob', { outputDir: 'blob-report' }], [process.env.GITHUB_ACTIONS ? 'github' : 'dot']]
        : [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        // the trace of the first retry is the evidence for a flaky test; a hard failure keeps its trace as well
        trace: CI ? 'on-first-retry' : 'retain-on-failure',
    },
    projects: [
        // every worker signs in with its own account (fixtures.ts): no setup project, nothing shared between shards
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'npm --prefix ../../app start',
        url: `http://localhost:${PORT}/api/health`,
        // in the pipeline the run starts its own application; on a laptop it uses the one that is running
        reuseExistingServer: !CI,
        env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
    },
});
