# Pair challenge 2 · Trace detective

Six failed tests from one pipeline run, two people, one keyboard. Constraint: **for the first 15 minutes, the recorded report and its traces are all you have.**

Rules:

- Minutes 0–15: `npx playwright show-report ci-report/`, nothing else. No editor, no re-run.
- Write your hypothesis on the ticket before minute 15: one sentence, plus the trace entry that supports it.
- Then reproduce, fix the cause and prove it. The commands are in the [README](README.md).
- Hints come in three levels. Open the next one after ten minutes without progress.
- Driver changes every 10 minutes. In uneven pairs the less experienced person drives.

What you know about the pipeline:

- It tests the staging build of Hire Ground on port 3102. Your laptop uses port 3000.
- Every run starts from the seed data. In the seed, Lena Schmidt is in Interview.
- Five workers, tests in parallel, no retries. Every test has a trace, the green ones too.

---

## PC2-1 · Green locally, wrong data on CI.

| | |
|---|---|
| Symptom | `Expected: "2 jobs"` · `Received: "12 jobs"`. The author runs the test alone on the laptop, and there it passes nine times out of ten |
| Where | `ticket-1-job-list.spec.ts` · `/jobs` |
| Your job | find out why the list shows the real jobs and not the two from the test |
| Done when | `CI=1 npx playwright test ticket-1 --repeat-each=5` passes |

<details><summary>Hint 1</summary>

Open the **Network** tab of the trace and find the request for the job list: `jobs`, content type `application/json`. Who answered it, the test or the server? When a stub answers, the column **Route** says `fulfilled`.

</details>

<details><summary>Hint 2</summary>

The Actions list hides `page.route` by default. Click the filter icon above the list, next to "… hidden", and tick **Network routes**. Then compare two times: the start of *Route requests* (tab **Call**) and the start of the `jobs` request (column **Start** in the Network tab).

</details>

<details><summary>Hint 3</summary>

The page asks for its jobs while `goto` is still loading it. The route is registered after `goto`, so the request is gone before the route exists. On an idle laptop the route sometimes wins this race; on the pipeline it never does. Register the route first, then navigate.

</details>

---

## PC2-2 · It fails, and the error points at a line that is fine.

| | |
|---|---|
| Symptom | `expect(locator).toBeVisible() failed` for the heading "Thank you for applying": `element(s) not found`. The error points at line 13 |
| Where | `ticket-2-apply.spec.ts` · `/jobs/backend-developer-java/apply` |
| Your job | find the line that is wrong. It is not line 13 |
| Done when | `CI=1 npx playwright test ticket-2 --repeat-each=5` passes |

<details><summary>Hint 1</summary>

Read the Actions list from top to bottom, the way a candidate works through the form. Which action is out of place? Then look at the failure screenshot: a form with every field filled, and error messages below the fields.

</details>

<details><summary>Hint 2</summary>

Submit is clicked right after the first name. Compare the start times of *Fill "Erika"* and *Click* in the tab **Call**: they differ by a millisecond or two. Two actions that start together did not wait for each other.

</details>

<details><summary>Hint 3</summary>

Line 10: `form.fill(applicant, cv)` has no `await`. The test moves on to Submit while the form is still being filled. One word fixes it, and the lint rule `@typescript-eslint/no-floating-promises` finds such lines before the pipeline does.

</details>

---

## PC2-3 · The assertion says no results. The failure screenshot shows five.

| | |
|---|---|
| Symptom | `Error: the link shows results` · `Expected: true` · `Received: false`. The screenshot of the same failure shows "5 jobs" and the list |
| Where | `ticket-3-search-link.spec.ts` · `/jobs?q=ing` |
| Your job | explain how the error and the screenshot can both be right, then make the check reliable |
| Done when | `CI=1 npx playwright test ticket-3 --repeat-each=5` passes, without `waitForTimeout` |

<details><summary>Hint 1</summary>

The test has three checks, and only the first one failed. Compare the durations of the first two under **Test Steps** in the report: a millisecond for the first, most of a second for the second. What was the second one waiting for?

</details>

<details><summary>Hint 2</summary>

In the trace, click the failed step and look at the page at that moment: "Loading jobs…". The Network tab shows why: the request `jobs` (`application/json`) needs most of a second on the pipeline. Tick **Getters** in the Actions filter to see the call that looked at the page, and its return value.

</details>

<details><summary>Hint 3</summary>

`isVisible()` looks once and answers at once. It does not wait, so it reports the state before the response arrived. The check in the next line is a web-first assertion and retries until the list is there. Replace the first check with one that retries: `await expect(results).toHaveCount(5)`.

</details>

---

## PC2-4 · The candidate is "Rejected" before this test opened the card.

| | |
|---|---|
| Symptom | `Expected: "interview"` · `Received: "rejected"` on the Stage field of Lena Schmidt |
| Where | `ticket-4-candidate.spec.ts` · `/recruiter`, then the candidate page |
| Your job | find out who rejected Lena Schmidt, and make the test independent of it |
| Done when | `CI=1 npx playwright test api ticket-4 --repeat-each=5 --workers=4` passes. `ticket-4` alone is not the proof |

<details><summary>Hint 1</summary>

Go back in time. Click the action *Click* and open the snapshot tab **Before**: in which column is Lena Schmidt before the test touches her card? Then check the Network tab: did this test send any request that changes a stage?

</details>

<details><summary>Hint 2</summary>

This test only reads, and every run starts from the seed. So somebody changed the stage during this run. The report lists three more tests, and each of them has a trace. Lena Schmidt has the id 103: the address of the candidate page shows it.

</details>

<details><summary>Hint 3</summary>

The trace of `API: a recruiter rejects an application` contains `PATCH /api/applications/103` with `{"stage":"rejected"}`. That test takes the first application it finds in Interview, and that is Lena. Two tests share one seeded candidate. Give each test its own application: create it through the API (`POST /api/applications`, as in `tests/api.spec.ts`), move it to Interview with a `PATCH`, and withdraw it afterwards. Both tests need the change.

</details>

---

## PC2-5 · The deadline reads 10/11/2026.

| | |
|---|---|
| Symptom | `Expected: "Apply by 11.10.2026"` · `Received: "Apply by 10/11/2026"` |
| Where | `ticket-5-deadline.spec.ts` · `/jobs/senior-qa-engineer` |
| Your job | find out why the pipeline's browser writes the date this way, and fix it where it belongs. The expected text is correct |
| Done when | `npx playwright test ticket-5 --repeat-each=5` passes with `CI=1` and without it |

<details><summary>Hint 1</summary>

Is it the wrong day, or the right day written differently? The test pins the deadline: in the Network tab, the request `senior-qa-engineer` with `fulfilled` in the column **Route** has it in its **Response**. Compare that date with both texts.

</details>

<details><summary>Hint 2</summary>

It is 11 October 2026, written the American way. A browser tells every server which language its user prefers. Click any request in the Network tab and read the request header `accept-language`.

</details>

<details><summary>Hint 3</summary>

The pipeline's browser runs in `en-US`. That is Playwright's default when no `locale` is set, and the config sets `locale: 'de-DE'` and `timezoneId: 'Europe/Berlin'` for laptops only. Set both for every environment in `playwright.config.ts`.

</details>

---

## PC2-6 · Every run waits 30 s, then times out.

| | |
|---|---|
| Symptom | `Test timeout of 30000ms exceeded.` No assertion failed. On a laptop the same test needs two seconds |
| Where | `ticket-6-smoke.spec.ts` · `/jobs`, `/jobs/senior-qa-engineer`, `/jobs/senior-qa-engineer/apply` |
| Your job | find out what the test waits for, and make it pass without that wait and without a longer timeout |
| Done when | `CI=1 npx playwright test ticket-6 --repeat-each=5` passes, and one run needs less than five seconds |

<details><summary>Hint 1</summary>

Which actions take the time? Click one of them and read the tab **Call**: `waitUntil` has a value. Now look at the page snapshot of the same action. Is the page ready?

</details>

<details><summary>Hint 2</summary>

`networkidle` means: no network traffic for 500 ms. Open the Network tab and look at the column **Duration**. One request needs ten seconds, and it does not go to `localhost:3102`.

</details>

<details><summary>Hint 3</summary>

`analytics.js` comes from a third party on `127.0.0.1:3999`. It answers after 10 s and then sends a beacon every 500 ms. The pages are complete long before that. Do not wait for `networkidle`: navigate, then assert what the candidate sees. And keep the third party out of the test: `await context.route('http://127.0.0.1:3999/**', (route) => route.abort())`.

</details>

---

Finished early? Try one new concept on a test you fixed:

- Ticket 4: move the "create, use, withdraw" code into an `applicant` fixture with `test.extend`, so that both tests ask for it by name.
- Ticket 1: replay the job list from a HAR file. `await page.routeFromHAR('hars/jobs.har', { url: '**/api/jobs?*', update: true })` records it once; without `update` the test replays it.
