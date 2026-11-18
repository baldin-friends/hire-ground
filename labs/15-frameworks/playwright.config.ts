import { defineConfig, devices } from '@playwright/test';

// One spec, three apps: React, Angular, Vue.
// https://playwright.dev/docs/test-projects · https://playwright.dev/docs/test-webserver#multiple-web-servers
// The apps are prebuilt in apps/<app>/dist. serve.mjs serves them:
//   node apps/serve.mjs react 4301
//   node apps/serve.mjs angular 4302
//   node apps/serve.mjs vue 4303

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
        // TODO: the project 'angular' with port 4302
        // TODO: the project 'vue' with port 4303
    ],
    // webServer takes an array: every entry starts before the run.
    webServer: [
        {
            command: 'node apps/serve.mjs react 4301',
            url: 'http://localhost:4301',
            reuseExistingServer: !process.env.CI,
        },
        // TODO: the server for the Angular app on port 4302
        // TODO: the server for the Vue app on port 4303
    ],
});
