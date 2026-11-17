# Lab 5 · warm-up · the answer to `problem/trace.zip`

```bash
cd labs/05-evidence
npx playwright show-trace problem/trace.zip
```

## What happened, in one sentence

The click on "Submit application" landed on the toast "Draft saved", which covered the button at that moment, so the form was never sent and the confirmation page never came.

## What in the trace proves it

| Where | What it shows |
|---|---|
| **Actions**, the red entry | `Expect "toBeVisible"` for the heading "Thank you for applying" fails after 5 s. This is where the test stopped. The cause is one action earlier. |
| **Actions** → *Click*, snapshot tab **Action** | The red dot marks where the click went. It sits on a dark box with the text "Draft saved", exactly where the Submit button should be. |
| *Click* → tab **Log** | `forcing action`. Playwright did not check whether the button can receive the click. |
| *Click* → tab **Source** | Line 18: `.click({ force: true })`. |
| **Network** | Five requests, all `GET`. No `POST /api/applications`: the browser never sent the form. |

The address bar of the snapshot shows `?bugs=toast-overlay`: the course app shows the toast for 800 ms after the consent box is ticked. Pairs who reached ticket 6 of pair challenge 1 have met it before.

## The correct test

Remove `force: true`. A normal `click()` waits until the button receives events, which is the moment the toast is gone, and not a millisecond longer.

## For the walkthrough after the ten minutes

1. Actions: the red entry is the symptom. Go one entry up.
2. Snapshots: **Before**, **Action**, **After** of the click. The red dot.
3. Log: what Playwright did and what it skipped.
4. Network: a request that is missing is evidence too.
5. Source: the line of the test for each action.

## Where the trace comes from

`solutions/05-evidence/problem/apply.spec.ts` fails on purpose and is the source of the trace. It has no comments, because the trace contains the source file and the Source tab would show them.

```bash
cd solutions/05-evidence/problem
./record-trace.sh              # app on port 3000
PORT=3102 ./record-trace.sh    # another copy of the app
```

The committed trace was recorded against port 3102, so its address bar shows `localhost:3102`.
