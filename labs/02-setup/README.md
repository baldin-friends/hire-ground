# Step 6 · The suite starts the app by itself

Nobody remembers to start the app before the tests, least of all a CI server. The config does it.

**Time** 15 min · alone

## Start here

`labs/02-setup`: the generated config with three TODOs, and one test.
**Stop Hire Ground first** (Ctrl+C in its terminal). If it keeps running, the suite uses it and you never see whether your `webServer` works.

## Steps

1. `playwright.config.ts`, TODO 1: set `baseURL`, `locale: 'de-DE'` and `timezoneId: 'Europe/Berlin'`.
2. TODO 2: add a `webServer` that starts Hire Ground and waits for `/api/health`.
3. `tests/jobs.spec.ts`, TODO 3: use `page.goto('/jobs')`.
4. Run `npx playwright test`. No app is running, and the tests pass anyway.
5. Open `.gitignore` in the repository root. Which Playwright folders does it list, and why does none of them belong in git?

## Done when

`npx playwright test` starts the app itself and passes in all three engines.

## Stuck?

<details>
<summary>Hint 1 · where the app lives</summary>

From this folder the app is two levels up: `../../app`. npm can run a script in another folder:
`npm --prefix ../../app start`.

</details>

<details>
<summary>Hint 2 · the test fails with "invalid URL"</summary>

`page.goto('/jobs')` needs a `baseURL` in the `use` block of the config. Check the spelling: `baseURL`, not `baseUrl`.

</details>

<details>
<summary>Hint 3 · nearly the answer</summary>

```ts
use: {
    baseURL: 'http://localhost:3000',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    trace: 'on-first-retry',
},
// …
webServer: {
    command: 'npm --prefix ../../app start',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
},
```

</details>

<details>
<summary>About step 5</summary>

`test-results/`, `playwright-report/` and `blob-report/` are output: every run writes them again.
`playwright/.auth/` holds saved logins (Day 2): session cookies are secrets and never go into a repository.

</details>

## Done early?

- Make plain runs faster: give `firefox` and `webkit` the option `default: false`. Now `npx playwright test` runs Chromium only,
  `--project=firefox` runs one engine on demand and `--project='*'` runs all three.
- Add a project `mobile` with `devices['Pixel 7']`. What changes in the report?
