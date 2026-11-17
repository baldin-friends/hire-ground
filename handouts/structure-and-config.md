# Structure and configuration, the rest

What the three days touched only briefly, one snippet each. Every snippet on this sheet ran against Playwright 1.64.1.
Course: Playwright · End-to-end testing for web applications

## Groups and hooks

```ts
test.describe('job search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/jobs');                    // runs before every test in this group
    });

    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== testInfo.expectedStatus) console.log(`failed on ${page.url()}`);
    });

    test('lists twelve jobs', async ({ page }) => {
        await expect(page.getByRole('article')).toHaveCount(12);
    });
});
```

`beforeAll` and `afterAll` run once per worker, not once per run. For state that tests need, a fixture is usually
the better tool: it runs only for the tests that ask for it, and its clean-up runs even when the test fails.

## Skipping, marking, tagging

```ts
test('exports the list as CSV', async ({ page }) => {
    test.fixme(true, 'HG-431: the export button is not built yet');     // not run, shown as "fixme"
    // …
});

test('works in Safari', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'only relevant for WebKit');    // skipped with a reason
    // …
});

test('the long one', async ({ page }) => {
    test.slow();                                                        // three times the timeout
    // …
});

test('finds the QA jobs', { tag: '@smoke' }, async ({ page }) => { /* … */ });
```

| You want | Command |
|---|---|
| only the smoke tests | `npx playwright test -g @smoke` |
| everything except them | `npx playwright test --grep-invert @smoke` |
| one test while you work on it | `test.only(…)`; `forbidOnly` in the config keeps it out of CI |

A `fixme` without a ticket number is where tests go to rest.

## Reading a value out of the page

```ts
const status = await page.getByRole('status').textContent();            // '12 jobs'
const titles = await page.getByRole('article').getByRole('heading').allTextContents();
const typed  = await page.getByRole('searchbox', { name: 'Search jobs' }).inputValue();
const href   = await page.getByRole('link', { name: 'Senior QA Engineer' }).getAttribute('href');
```

These read once and do not wait. Use them when you need the value to calculate or compare.
To check a value, assert on the locator: `await expect(locator).toHaveText('12 jobs')` waits until it is true.

## Waiting for a response

```ts
const response = page.waitForResponse((r) => r.url().includes('/api/jobs?') && r.url().includes('location=Dresden'));
await page.getByRole('combobox', { name: 'Location' }).selectOption('Dresden');
const jobs = await (await response).json();
await expect(page.getByRole('article')).toHaveCount(jobs.length);       // the page shows what the API sent
```

Listen first, act second, await third: the same order as `waitForRequest` on Day 2.

## Screenshots and video

```ts
// playwright.config.ts
use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',      // the trace already holds a screenshot per action: often it is enough
},
```

```ts
await page.screenshot({ path: testInfo.outputPath('jobs.png'), fullPage: true });
await testInfo.attach('the job list', { body: await page.screenshot(), contentType: 'image/png' });   // into the HTML report
```

## Environment variables

```ts
// playwright.config.ts
process.loadEnvFile('.env');                       // Node 20.12 or later: reads KEY=value lines into process.env

export default defineConfig({
    use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },
});
```

```ts
await page.getByLabel('Password').fill(process.env.RECRUITER_PASSWORD!);
```

`.env` belongs in `.gitignore`. On CI the same names come from the pipeline's secrets. One suite, several
environments: `BASE_URL=https://staging.example.com npx playwright test`.

## Setup and teardown for the whole run

```ts
projects: [
    { name: 'prepare', testMatch: /global\.setup\.ts/, teardown: 'clean up' },
    { name: 'clean up', testMatch: /global\.teardown\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['prepare'] },
],
```

A setup project runs before the projects that depend on it, its `teardown` project after them. Both are ordinary
tests: they appear in the report, they have traces, they can use fixtures. The older `globalSetup` option in the
config has none of that.

## Phones and tablets

```ts
{ name: 'mobile', use: { ...devices['Pixel 7'] } },
```

A device sets viewport, user agent, touch and pixel ratio in the desktop engine. It finds layout problems.
It does not replace a real phone.

## Test data

```ts
export function person(prefix = 'erika') {
    const id = crypto.randomUUID().slice(0, 8);
    return { firstName: 'Erika', lastName: `Muster-${id}`, email: `${prefix}-${id}@example.com` };
}
```

A new value on every call keeps parallel tests apart. Libraries such as faker produce realistic names and
addresses; the rule stays the same: every test brings its own data.
