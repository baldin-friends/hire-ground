# Case 6 · Time: time zones per project, and a clock you control

**The problem.** "Works in Berlin" is a statement about one time zone. And nobody waits 30 minutes in a test for a
session warning.

## Before you start

```bash
cd labs/10-time
npx playwright test          # once, in a terminal: signs in and saves the session
```

The tests use the fixtures from Case 4 (`support/fixtures.ts`).

## Warm-up

`tests/1-warm-up.spec.ts`:

| Test | Shows |
|---|---|
| Berlin, New York | `timezoneId` is an option of the browser context: set it in the config, per project, per file or per `describe` |
| session warning | `page.clock.install()` and `fastForward('30:00')`: thirty minutes in milliseconds |
| waiting 15 days | `page.clock.install({ time })`: the browser lives in the future; the server does not |

## The challenge · 20 minutes, together

A customer in Tokyo writes: "I schedule an interview for the 15th, and the candidates table shows the 14th."
`tests/2-challenge.spec.ts` checks exactly that, and passes.

**Done when** `npx playwright test --project=chromium-tokyo` reproduces the bug, the time zone tests run in
Chromium only, and the team has decided what to do with a test for a known bug.

1. Run the test: green. Add `test.use({ timezoneId: 'Asia/Tokyo' })` above it: red, "14.01.2027".
2. A line in the file is not a plan for three time zones. Remove it. In `playwright.config.ts`, add the projects
   `chromium-new-york` and `chromium-tokyo` with their `timezoneId`.
3. They should run only the time zone tests: tag the test with `{ tag: '@timezone' }` and give the projects `grep: /@timezone/`.
4. Other engines should skip them: a `firefox` project with `grepInvert: /@timezone/`.
5. `npx playwright test --project=chromium-tokyo`, then all projects.
6. The bug is in the application: `formatInterviewDay()` in `app/src/format.ts`. Decide: repair it now, or mark the
   test with `test.fail(condition, reason)` until it is repaired.

## Hints

<details>
<summary>Hint 1 · the projects</summary>

```ts
const chrome = { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/recruiter.json' };

projects: [
    { name: 'chromium', use: { ...chrome }, dependencies: ['setup'] },
    { name: 'chromium-new-york', grep: /@timezone/, use: { ...chrome, timezoneId: 'America/New_York' }, dependencies: ['setup'] },
    { name: 'chromium-tokyo', grep: /@timezone/, use: { ...chrome, timezoneId: 'Asia/Tokyo' }, dependencies: ['setup'] },
    { name: 'firefox', grepInvert: /@timezone/, use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/recruiter.json' }, dependencies: ['setup'], default: false },
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
],
```

`default: false`: the project runs only when it is named, `--project=firefox`.

</details>

<details>
<summary>Hint 2 · why Tokyo</summary>

08:00 in Tokyo on 15 January is 23:00 on 14 January in UTC. The table cuts the day out of the UTC instant.
In Berlin, 08:00 is 07:00 UTC: the same day, so the bug hides.

</details>

<details>
<summary>Hint 3 · the repair</summary>

```ts
export function formatInterviewDay(iso: string) {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}
```

Without `timeZone` the formatter uses the time zone of the browser. After the repair, a test marked with `test.fail()`
goes red with "Expected to fail, but passed": delete the mark then.

</details>

## Read more

- Time zone, locale, geolocation, permissions: https://playwright.dev/docs/emulation
- Projects: https://playwright.dev/docs/test-projects
- Tags, `test.fail`, `test.fixme`, `test.slow`: https://playwright.dev/docs/test-annotations
- Clock: https://playwright.dev/docs/clock
- Timeouts: https://playwright.dev/docs/test-timeouts
- Retries: https://playwright.dev/docs/test-retries
