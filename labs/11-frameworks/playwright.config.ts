import { defineConfig, devices } from '@playwright/test';

// Lab 11 · one spec, three apps.
// The apps are prebuilt in ../scaffolds/<app>/dist. serve.mjs serves them:
//   node ../scaffolds/serve.mjs react 4301
//   node ../scaffolds/serve.mjs angular 4302
//   node ../scaffolds/serve.mjs vue 4303

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
            command: 'node ../scaffolds/serve.mjs react 4301',
            url: 'http://localhost:4301',
            reuseExistingServer: !process.env.CI,
        },
        // TODO: the server for the Angular app on port 4302
        // TODO: the server for the Vue app on port 4303
    ],
});
