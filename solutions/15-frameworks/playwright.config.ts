import { defineConfig, devices } from '@playwright/test';

// One spec, three apps: React, Angular, Vue.
// https://playwright.dev/docs/test-projects · https://playwright.dev/docs/test-webserver#multiple-web-servers
// The apps are prebuilt in labs/15-frameworks/apps/<app>/dist. serve.mjs serves them:
// react on 4301, angular on 4302, vue on 4303.

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        ...devices['Desktop Chrome'],
        trace: 'retain-on-failure',
    },
    // One project per app: the same tests, the same browser, another baseURL.
    projects: [
        { name: 'react', use: { baseURL: 'http://localhost:4301' } },
        { name: 'angular', use: { baseURL: 'http://localhost:4302' } },
        { name: 'vue', use: { baseURL: 'http://localhost:4303' } },
    ],
    // webServer takes an array: all three apps start before the run.
    webServer: [
        {
            command: 'node ../../labs/15-frameworks/apps/serve.mjs react 4301',
            url: 'http://localhost:4301',
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'node ../../labs/15-frameworks/apps/serve.mjs angular 4302',
            url: 'http://localhost:4302',
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'node ../../labs/15-frameworks/apps/serve.mjs vue 4303',
            url: 'http://localhost:4303',
            reuseExistingServer: !process.env.CI,
        },
    ],
});
