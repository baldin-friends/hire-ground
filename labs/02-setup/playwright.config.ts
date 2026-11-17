import { defineConfig, devices } from '@playwright/test';

// Step 6 · the generated config. Three TODOs turn it into a config for Hire Ground.
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        // TODO 1: three settings every test inherits
        //   baseURL     'http://localhost:3000'   so that tests can say page.goto('/jobs')
        //   locale      'de-DE'                   the browser language your users have
        //   timezoneId  'Europe/Berlin'           the time zone your users live in
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
    // TODO 2: let the suite start the app. Remove the comment marks and fill in the two strings.
    // webServer: {
    //     command: '',                           // how you start Hire Ground from this folder (the app lives in ../../app)
    //     url: '',                               // Playwright waits until this URL answers: the app has /api/health
    //     reuseExistingServer: !process.env.CI,  // locally: use the app if it already runs
    // },
});
