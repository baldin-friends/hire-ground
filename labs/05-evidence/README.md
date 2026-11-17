# Steps 1 to 4 · Read the evidence

A test failed at night and somebody pressed rerun. You find the cause from the trace instead.

**Time** four short steps · step 1 in pairs, the others alone

## Step 1 · A trace from a failed run · in pairs · 10 min

A CI run failed last night. You have the trace and nothing else: no source code, no rerun.

```bash
cd labs/05-evidence
npx playwright show-trace problem/trace.zip
```

After ten minutes, one sentence: what happened, and what in the trace proves it?

## Steps 2 to 4 · start here

`tests/apply.spec.ts`: a green apply test. The config in this folder records a trace for every run (`trace: 'on'`).

## Steps 2 to 4

For each break: run the test, open the trace from the HTML report (`npx playwright show-report`), and find the cause **in the trace alone**.
Write one sentence per cause into the table. Undo the break before the next one.

1. **Step 2:** break it with a wrong locator: rename the button to "Send application".
2. **Step 2:** break it with a wrong expected text: expect the heading "Thanks for applying".
3. **Step 3:** make the API slow. Put this line before `page.goto`:
   ```ts
   await page.route('**/api/applications', async (r) => { await new Promise((ok) => setTimeout(ok, 8000)); await r.continue(); });
   ```
4. **Step 4:** undo all breaks. Wrap the test in three steps with `test.step()`: open the posting, fill the form, submit and confirm. Make one of them boxed (`{ box: true }`) and break something inside it: where does the report point now?

| Break | Cause, in one sentence | Where the trace shows it (tab, entry) |
|---|---|---|
| 1 wrong locator | | |
| 2 wrong text | | |
| 3 slow API | | |

## Done when

Three one-sentence causes, each with the trace entry that proves it.

## Stuck?

<details>
<summary>Hint 1 · no trace in the report</summary>

Run from this folder, so that this config is used: it sets `trace: 'on'`. In the HTML report, open the failed test and scroll to "Traces".

</details>

<details>
<summary>Hint 2 · where to look</summary>

Actions list on the left: the red entry is where it stopped. Click it and read the "Call" and "Log" tabs: what did Playwright wait for, and for how long?
The page snapshot shows "before" and "after" the action. The Network tab shows which requests were still open.

</details>

<details>
<summary>Hint 3 · break 3</summary>

Which timeout fired: the test (30 s) or the assertion (5 s)? Find the POST to `/api/applications` in the Network tab. What is its status at the moment of the failure?

</details>

## Done early?

Read the same trace in the terminal: `npx playwright trace --help`. Then try `npx playwright test --debug` and step through the green test.
