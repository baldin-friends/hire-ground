# Case 10 · AI: the debrief

| File | What it is |
|---|---|
| `tests/heal-me.spec.ts` | the two tests after a person has decided. Test 1: the locator is repaired (`getByRole('link', { name: 'New job' })`). Test 2: the expectation stays, the test is marked `test.fail()` with the reason, and the bug goes to the team. |
| `tests/healed-wrong.spec.ts` | test 2 after a repair that only wanted green: the expectation now matches the bug. It passes. Do not copy it. |
| `tests/seed.spec.ts`, `tests/auth.setup.ts` | as in `labs/14-agents` |

`npx playwright test` in this folder: 5 passed. One of them passes because the bug exists
(`healed-wrong`), and one is an expected failure (`test.fail`): two green lines with opposite meanings.
The report shows the difference; the exit code does not.

Why `test.fail()` and not `test.fixme()`: a `fixme` test is skipped, so nobody notices when the bug is fixed.
A test marked `fail` still runs, and the day the application accepts the second application it "passes
unexpectedly" and the run turns red: the reminder to remove the mark.

What was verified without an AI account: the two failures, the content of `error-context.md`, the button
"Copy prompt" in the report, `npx playwright cli`, `--debug=cli`, `npx playwright trace`, and the files
`init-agents` writes. What the agents answer was not rehearsed.
