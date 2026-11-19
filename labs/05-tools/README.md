# Case 1 · From a recording to a test

**The problem.** Codegen writes a test in two minutes. The test is green. It stays green when the feature breaks.

**Tools in this case:** UI mode, codegen, the trace viewer.

## Before you start

```bash
cd labs/05-tools
npx playwright test          # once, in a terminal: the setup project signs in and saves the session
npx playwright test --ui     # then UI mode
```

UI mode opens with the first project of the config and does not run the `setup` project by itself.
If a test says "Error reading storage state", run `npx playwright test` in a terminal once.

## Warm-up · a tour through UI mode

`tests/1-warm-up.spec.ts`: three tests on the career page. The third fails on purpose.

| Where | What it is for |
|---|---|
| left: filter, **Status** and **Projects** | which tests are listed; the eye is watch mode: the test reruns when a file is saved |
| top: timeline | hover to scrub through the run; drag to select a time range |
| middle: Actions | every step with its duration; click one to go there |
| right: Action · Before · After | the DOM at that step. It is a snapshot you can inspect, not a video |
| **Pick locator** | click an element in the snapshot: the Locator tab shows a locator, and you can edit it and see the matches |
| bottom: Source, Call, Log | the line of the test, the arguments, what Playwright waited for |
| bottom: Errors | the message, the diff, and **Copy prompt** for an AI assistant |
| bottom: Console, Network, Attachments | what the page logged and requested during the test |

## The challenge · 30 minutes, together

`tests/2-challenge.spec.ts` is a recording: the recruiter signs in, creates the job "Playwright Engineer", publishes it and
opens it on the career page. Record your own with:

```bash
npx playwright codegen http://localhost:3000/login
```

**Done when** the test fails if publishing fails, passes twice in a row, and leaves no job behind.

1. Run it twice: `npx playwright test 2-challenge`. Both runs are green. Open the trace of the second run:
   `npx playwright show-report`, the test, "Traces". Look at the step "Publish": what does the page show?
   What did `POST /api/jobs` answer (Network tab)?
2. Add the assertions that would have caught it: the message after Publish, the heading of the job page.
   Run it: now it is red, for the right reason.
3. Give the job a title no other run has. Run it twice: green twice.
4. Remove the sign-in: the config's `storageState` has a session. Delete the `test.use` line at the top.
5. Remove the job after the test (`GET /api/admin/jobs`, `DELETE /api/jobs/:id`). This needs the session of step 4.
6. The deadline `2026-12-31` is a failure with a start date: compute it. Delete the clicks that only moved the
   focus, and give the parts a name with `test.step()`.

Every step is at the end of `tests/2-challenge.spec.ts` as a comment, ready to copy.

## Hints

<details>
<summary>Hint 1 · what the second run really did</summary>

The second `POST /api/jobs` answered `409`, and the form shows "A job with this title already exists." The recording
clicked on, found the job of the first run on the career page, and passed. A recording has actions and no assertions.

</details>

<details>
<summary>Hint 2 · unique and removed (steps 3 and 5)</summary>

The `afterEach` uses the saved session. While the file still has its `test.use({ storageState: … })` line, the
request is not signed in and the cleanup fails: remove the sign-in first (step 4).

```ts
let title: string;
test.beforeEach(() => { title = `Playwright Engineer ${randomUUID().slice(0, 8)}`; });   // import { randomUUID } from 'node:crypto'

test.afterEach(async ({ request }) => {
    const jobs = await (await request.get('/api/admin/jobs')).json();
    const mine = jobs.find((job) => job.title === title);
    if (mine) await request.delete(`/api/jobs/${mine.id}`);
});
```

</details>

<details>
<summary>Hint 3 · a date that does not expire</summary>

```ts
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
await page.getByLabel('Application deadline').fill(inDays(30));
```

</details>

## Done early?

The job titles in the job administration open the career page in a new tab. Write a test for it: `page.waitForEvent('popup')`.
The solution has it.

## Codegen, used well

```bash
npx playwright codegen http://localhost:3000                      # record; the toolbar also adds assertions
npx playwright codegen --save-storage=auth.json http://localhost:3000/login    # sign in by hand once; closing the window saves the session
npx playwright codegen --load-storage=auth.json http://localhost:3000/recruiter/candidates   # start signed in
npx playwright codegen --test-id-attribute=data-qa http://localhost:3000    # prefer this application's test attribute
npx playwright codegen --timezone="Asia/Tokyo" --lang=ja-JP --viewport-size="390,844" http://localhost:3000
```

In VS Code: **Record at cursor** records into the test you are writing, and **Pick locator** copies one locator.
A recording is a draft. What it cannot know: what must be true afterwards, which data is yours, and what to clean up.

## Read more

- UI mode: https://playwright.dev/docs/test-ui-mode
- Codegen: https://playwright.dev/docs/codegen
- Trace viewer: https://playwright.dev/docs/trace-viewer
- Debugging (`--debug`, `page.pause()`, VS Code): https://playwright.dev/docs/debug
- Reporters: https://playwright.dev/docs/test-reporters
- `test.step`: https://playwright.dev/docs/api/class-test#test-step
- New tabs and windows: https://playwright.dev/docs/pages#handling-new-pages
