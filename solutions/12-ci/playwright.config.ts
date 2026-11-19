import { defineConfig, devices } from '@playwright/test';

// The suite the pipeline runs: the tests of Cases 1 to 6, sorted by area.
// .github/workflows/e2e.yml starts it on GitHub, compose.yaml starts it in the same image on a laptop.
//
// Three variables change how it runs:
//   CI=1                 set by GitHub Actions, GitLab and Jenkins. On a laptop: CI=1 npx playwright test
//   BASE_URL=https://…   run against a deployed environment: this run starts no application
//   PORT=3001            the port of the application this run starts or reuses (default 3000)
const CI = !!process.env.CI;
const BASE_URL = process.env.BASE_URL || undefined; // the pipeline passes an empty value when the field is not filled in
const PORT = Number(process.env.PORT ?? 3000);

// db.ts uses node:sqlite, which Node.js 22 still calls experimental. This keeps the warning out of the test output.
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ''} --disable-warning=ExperimentalWarning`;

// tests/auth.setup.ts signs in once per run and writes the session to this file
const SESSION = 'playwright/.auth/recruiter.json';

// https://playwright.dev/docs/ci · https://playwright.dev/docs/test-configuration
export default defineConfig({
    testDir: './tests',
    // workers and shards cut between tests, not between files
    fullyParallel: true,
    // a test.only that somebody forgot fails the pipeline instead of silently skipping the rest
    forbidOnly: CI,
    // on a laptop every failure counts; in the pipeline a failed test runs again, up to twice
    retries: CI ? 2 : 0,
    // a test that passes only on a retry is "flaky": in the pipeline that is a red run
    failOnFlakyTests: CI,
    // the same number on every runner; on a laptop: half of the cores
    workers: CI ? 2 : undefined,
    // the pipeline asks for its own reporters on the command line: --reporter=blob,github
    reporter: [['list'], ['html', { open: 'never' }]],
    // a deployed environment has no database a test can reach: the tests tagged @db stay out
    grepInvert: BASE_URL ? /@db/ : undefined,
    use: {
        baseURL: BASE_URL ?? `http://localhost:${PORT}`,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        testIdAttribute: 'data-qa',
        // a trace costs time: in the pipeline only the first retry records one. That is the evidence for a red or flaky test.
        trace: CI ? 'on-first-retry' : 'retain-on-failure',
        // what a person looks at first: the page at the moment of the failure, and a video of the attempt
        screenshot: CI ? 'only-on-failure' : 'off',
        video: CI ? 'retain-on-failure' : 'off',
    },
    projects: [
        // The browser projects come first: UI mode shows the first project when it opens.
        { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: SESSION }, dependencies: ['setup'] },
        { name: 'firefox', use: { ...devices['Desktop Firefox'], storageState: SESSION }, dependencies: ['setup'] },
        { name: 'setup', testMatch: /.*\.setup\.ts/ },
    ],
    // Without BASE_URL the run brings its own application. In the pipeline it always starts a new one;
    // on a laptop it uses the one that is running.
    webServer: BASE_URL
        ? undefined
        : {
              command: 'npm --prefix ../../app start',
              url: `http://localhost:${PORT}/api/health`,
              reuseExistingServer: !CI,
              env: { PORT: String(PORT), HG_ANALYTICS_PORT: String(PORT + 999) },
          },
});
