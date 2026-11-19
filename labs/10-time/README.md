# Case 6 · Time: time zones per project, and a clock you control

**The problem.** "Works in Berlin" is a statement about one time zone. And nobody waits 30 minutes in a test for a
session warning.

## Before you start

```bash
cd labs/10-time
npx playwright test          # once, in a terminal: signs in and saves the session. 5 passed
```

The tests use the fixtures from Case 4 (`support/fixtures.ts`): `applicant` is a candidate of the test's own.

## Warm-up

`tests/1-warm-up.spec.ts`, three tests:

| Test | Shows |
|---|---|
| Berlin, New York | the time zone is an option of the browser: the config sets it for every test, `test.use()` for one group |
| session warning | `page.clock.install()` and `fastForward('30:00')`: thirty minutes pass in milliseconds |

## The challenge · 20 minutes, together

A customer in Tokyo writes: "I schedule an interview for the 15th, and the candidates table shows the 14th."
`tests/2-challenge.spec.ts` checks exactly that. In Berlin it passes.

**Done when** the bug shows in a project `chromium-tokyo`, only the time zone test runs there, and the whole run
is green with the bug marked.

1. Run the test: `npx playwright test 2-challenge`. Green. Add `test.use({ timezoneId: 'Asia/Tokyo' });` above the
   test and run it again: red, "14.01.2027" instead of "15.01.2027". Delete the line again.
2. Give the Tokyo run a name. In `playwright.config.ts`, copy the project `chromium`, call the copy `chromium-tokyo`
   and add `timezoneId: 'Asia/Tokyo'` to its `use`. Run everything: `npx playwright test`. Two tests are red: the bug,
   and the warm-up test "a candidate in Berlin reads Berlin time". Every test now runs in both time zones, and most
   tests were not written for that.
3. The new project should run only the time zone test. Tag the test with `{ tag: '@timezone' }` and give the
   project `grep: /@timezone/`. `npx playwright test --list` shows 6 tests instead of 9. Run everything: one test is
   red, the bug in `chromium-tokyo`.
4. The bug is in the application, and it is not repaired today. Mark the test: `test.fail(condition, reason)`. The
   condition needs `testInfo`, the second argument of the test function. Run everything: green, "6 passed". The list
   shows ✘ next to the Tokyo test: it failed, as expected.

Every step is at the end of `tests/2-challenge.spec.ts` as a comment, ready to copy.

## Hints

<details>
<summary>Hint 1 · the project (steps 2 and 3)</summary>

```ts
{
    name: 'chromium-tokyo',
    grep: /@timezone/, // step 3: only the tests with this tag
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/recruiter.json', timezoneId: 'Asia/Tokyo' },
    dependencies: ['setup'],
},
```

One time zone only: `npx playwright test --project=chromium-tokyo`.

</details>

<details>
<summary>Hint 2 · why Tokyo</summary>

08:00 in Tokyo on 15 January is 23:00 on 14 January in UTC. The table cuts the day out of the UTC instant.
In Berlin, 08:00 is 07:00 UTC: the same day, so the bug hides.

</details>

<details>
<summary>Hint 3 · the mark (step 4)</summary>

```ts
test('…', { tag: '@timezone' }, async ({ page, applicant }, testInfo) => {
    test.fail(testInfo.project.name === 'chromium-tokyo', 'formatInterviewDay() cuts the day out of the UTC instant');
```

The test still runs. On the day the application is repaired it fails with "Expected to fail, but passed": delete
the mark then. `test.skip()` and `test.fixme()` do not run the test, so nobody would notice the repair.

</details>

## Done early?

- **One more time zone** is one more copy of the project: `chromium-new-york` with `America/New_York`. The test
  passes there: 08:00 in New York is 13:00 UTC, the same day.
- **Another engine, without the time zone tests:** a `firefox` project with `grepInvert: /@timezone/`. With
  `default: false` it runs only when it is named: `npx playwright test --project=firefox`. The solution has it.
- **The clock can also start on a date you choose.** The browser lives fifteen days ahead, so a new candidate has
  "waited 15 days":

  ```ts
  await page.clock.install({ time: new Date(Date.now() + 15 * 86_400_000) });
  await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
  await expect(page.getByRole('row', { name: applicant.name }).getByText('Waiting 15 days')).toBeVisible();
  ```

- **Repair the bug:** `formatInterviewDay()` in `app/src/format.ts`.

  ```ts
  export function formatInterviewDay(iso: string) {
      return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
  }
  ```

  Without `timeZone` the formatter uses the time zone of the browser. `npm run app` builds the application when it
  starts, so stop it and start `npm run app:dev` in the repository root: the same port, and it reads the source files.

## Read more

- Time zone, locale: https://playwright.dev/docs/emulation#locale--timezone
- Projects: https://playwright.dev/docs/test-projects
- Tags, `test.fail`: https://playwright.dev/docs/test-annotations
- Clock: https://playwright.dev/docs/clock
