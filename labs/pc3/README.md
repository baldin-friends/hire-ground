# Pair challenge 3 · Flaky hunt

A colleague wrote 26 tests for Hire Ground and ran them with one worker. They are green. With four workers they are not. 55 minutes, two people, one keyboard.

Track B (the healer experiment) is in [track-b/](track-b/README.md).

## The goal

```bash
npx playwright test --workers=4 --shuffle --repeat-each=10
```

This command has to pass: 260 tests, four workers, random order.

## Start

```bash
cd labs/pc3
npx playwright test --workers=1                              # 26 passed, about 20 s
npx playwright test --workers=4 --shuffle --repeat-each=10   # about 60 failed, 2 to 3 min
```

Playwright starts a separate copy of the app for this folder, on port 3003 (`playwright.config.ts`). Every run first puts the data back to the seed (`global-setup.ts`). Port taken? `PORT=3013 npx playwright test`.

If the one-worker run shows a single red test, run it again. About one run in forty meets one of the nine causes early.

## Rules

- No `retries`, no `waitForTimeout`, no `force: true`. No `test.skip`, no deleted tests, no longer default timeouts.
- Fix the tests, the fixtures or the config. The app and the `BUGS` line in the config stay as they are.
- Write the hypothesis down before anyone edits code.
- One commit per fix, with the root cause in one line.
- The driver changes every 15 minutes.

About half of the 26 tests are fine. Leave them alone.

## The protocol

1. **Reproduce.** The goal command, or one file of it: `npx playwright test settings --workers=4 --shuffle --repeat-each=10`.
2. **Isolate.** One test, one worker: `npx playwright test -g "leave a note" --workers=1`. Then one file. Then repeated: `--repeat-each=5`.
3. **Hypothesis.** One sentence, on paper.
4. **Evidence.** `npx playwright show-report`, then the trace of a red test: actions, DOM snapshot, network, console.
5. **Fix the cause.** Not the symptom.
6. **Prove it.** The same command as in step 1, green. Then the goal command.

`--shuffle` prints a seed. `--shuffle=<seed>` repeats the same order.

## Nine symptoms

Nine causes are hidden in the suite. Each one has a symptom below, in no particular order of difficulty. Three hints per symptom: open the next one after ten minutes without progress.

### 1 · Expected: 3, Received: 12

`search.spec.ts › finds jobs by the name of the team` fails almost every time. Now and then it passes.

<details><summary>Hint 1</summary>

Run the test alone, then together with the test above it: `npx playwright test search --workers=1 -g "search as you type"`. What is on the page when the test starts, in each case?

</details>

<details><summary>Hint 2</summary>

This search has no button. The app searches 400 ms after the last key. `count()` reads the list once, immediately. With one worker the list already showed three jobs: the three that the test before had found, on the page that both tests share.

</details>

<details><summary>Hint 3</summary>

Give each test its own page (the `page` fixture and a `goto`), and wait for the result: `await expect(page.getByRole('status')).toHaveText('3 jobs')`. Three jobs before and three jobs after prove little, so assert the titles as well.

</details>

### 2 · `locator.fill: Timeout 10000ms exceeded`, waiting for `getByLabel('Note')`

`pipeline.spec.ts › a recruiter can leave a note` fails every time.

<details><summary>Hint 1</summary>

Open the trace and read the address bar. Which application is the test looking at?

</details>

<details><summary>Hint 2</summary>

`applicationId` gets its value in another test. With four workers that test ran in another process, or later, or not at all in this worker.

</details>

<details><summary>Hint 3</summary>

Own setup per test: create the applicant inside this test with `apply(request, …)`, or move that into a fixture that withdraws the application afterwards. No variable that one test fills and another one reads.

</details>

### 3 · `Expected: ["Your application for UX Researcher"]`, `Received: []`

`smoke.spec.ts › the applicant has a confirmation mail` and `› the confirmation mail quotes the reference` (there as `Cannot read properties of undefined`) fail almost every time.

<details><summary>Hint 1</summary>

Run the file alone with one worker: `npx playwright test smoke --workers=1`. It was green in the full one-worker run. What is different now? Open `http://localhost:3003/mailbox` ten seconds later.

</details>

<details><summary>Hint 2</summary>

The app sends its mail 2 to 8 seconds after the application. The `candidate` in `fixtures.ts` applies when the worker starts. At the end of a long one-worker run that was 15 seconds ago. In a new worker it was a moment ago. The test asks the mailbox once.

</details>

<details><summary>Hint 3</summary>

Ask until the mail is there: `expect.poll(…, { timeout: 15_000 })`, as `apply.spec.ts › the applicant gets a confirmation mail` does. The timeout has to be above 8 seconds. An applicant per test instead of one per worker makes the test independent of when the worker started.

</details>

### 4 · `<div class="backdrop">…</div> intercepts pointer events`

Any test can fail with `locator.click: Timeout 10000ms exceeded` before its first line runs. A different test every time, a handful per run.

<details><summary>Hint 1</summary>

Read the call log to the end, and the stack below it. Which button is covered, and which file does the click come from?

</details>

<details><summary>Hint 2</summary>

A consent dialog appears on about 30 % of all page loads, up to 800 ms after the load. The `page` fixture has a handler for it. One page in `fixtures.ts` does not come from that fixture.

</details>

<details><summary>Hint 3</summary>

Either register the same `addLocatorHandler` on that page, or sign in without a page: `request.post('/api/auth/login', …)` and the `storageState()` of that request context. No page, no dialog.

</details>

### 5 · `expect(locator).toBeInViewport() failed`

`pipeline.spec.ts › all six stages are on screen side by side` fails in about half of its runs. With one worker, never.

<details><summary>Hint 1</summary>

Open a red and a green trace side by side and compare the screenshots. Or print `test.info().parallelIndex` and `page.viewportSize()` in the test.

</details>

<details><summary>Hint 2</summary>

`fixtures.ts` gives every worker a different window size. With one worker every test gets the first one.

</details>

<details><summary>Hint 3</summary>

One explicit viewport in the project: delete the override, `devices['Desktop Chrome']` in the config already says 1280 × 720. A test that needs another window says so itself with `test.use({ viewport: … })`.

</details>

### 6 · The card stays in "New"

`pipeline.spec.ts › a card can be dragged to the next stage` passes two or three times, then fails for the rest of the run.

<details><summary>Hint 1</summary>

`npx playwright test -g "dragged" --workers=1 --repeat-each=6`. Which repeat fails first? Open its trace: what does the Screening column look like, and what happens to the page between mouse down and mouse up?

</details>

<details><summary>Hint 2</summary>

Every run of the test leaves one more card in Screening. Once the column is taller than the window, `screening.hover()` has to scroll, with the mouse button down, and the drag is lost. The animation is not the cause: Playwright waits until a card stands still.

</details>

<details><summary>Hint 3</summary>

`card.dragTo(…)` onto something that is always at the top: the heading of the column, `screening.getByRole('heading')`. Withdraw the applicant after the test, so the column stops growing. `contextOptions: { reducedMotion: 'reduce' }` in the config saves 0.8 s per drag.

If the drag then still fails once in a hundred runs: the dialog from symptom 4 can open between mouse down and mouse up. `await expect(async () => { /* drag, then expect the card in Screening */ }).toPass()` repeats the gesture until the card has arrived.

</details>

### 7 · "Closes today" is not on the page

`deadline.spec.ts › on its last day a job says "Closes today"` and `› the job list marks the job that closes today` fail in about one run out of four. With one worker, never.

<details><summary>Hint 1</summary>

The trace shows what the page says instead. Then find out what time it is on that page: `console.log(await page.evaluate(() => new Date().toString()))` in the test, four workers, ten repeats.

</details>

<details><summary>Hint 2</summary>

`fixtures.ts` sets the browser clock of every worker to a different hour. One of them is 00:30. At that time the page reads "Apply by" with today's date.

</details>

<details><summary>Hint 3</summary>

A test about "today" says which moment it means: `page.clock.setFixedTime(…)` in the test, with the time zone in the value (`new Date('2026-11-20T12:00:00+01:00')`). Delete the hours from the fixture. Then one question is left: at 00:30 in Berlin on the last day, who is wrong, the test or the app? Write a test that says so.

</details>

### 8 · "You have already applied with this email address."

`apply.spec.ts › five fields are enough to apply` and `› the optional fields reach the recruiter` fail a few times per run. Sometimes the form shows the message above, sometimes the recruiter finds "Application not found". Now and then `› a second application for the same job is refused` fails too: there the message is missing.

<details><summary>Hint 1</summary>

Open the trace of a red run and look at the form after Submit. Then search the spec for the address in the message. How many tests use it?

</details>

<details><summary>Hint 2</summary>

This app accepts an e-mail address once, across all jobs. Three tests apply as the same Erika, and the `afterEach` deletes all of Erika's applications, including the one of the test that is running next door.

</details>

<details><summary>Hint 3</summary>

Data per test: `person()` from `data.ts` returns a new address on every call. Then the cleanup removes only what this test created.

</details>

### 9 · The checkbox is in the wrong state

The tests in `settings.spec.ts` fail a few times per run: checked where unchecked was expected, or the other way round. With one worker, never.

<details><summary>Hint 1</summary>

Every worker signs in with its own recruiter account. Check by hand whether that keeps them apart: switch the mails off as `recruiter-1@hireground.test`, then look at the setting as `recruiter-2@hireground.test` in a private window. Password for both: `hire-ground`.

</details>

<details><summary>Hint 2</summary>

The app keeps one setting for all recruiters. A test that switches it off and a test that reads it must not run at the same time, whatever account they use.

</details>

<details><summary>Hint 3</summary>

A test lock: `test.describe('mails about new applications', { lock: 'notification-settings' }, () => { … })` around all four tests, the one that only reads included. Tests with the same lock name never overlap. Everything else keeps running in parallel.

</details>

## Done when

The goal command is green twice in a row. Most pairs fix five or six causes in the time. The debrief wants, per pair: the cause you found first, the one you found last, one fix, one rule for the team.
