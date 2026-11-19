# Case 10 · AI and MCP: what came out

The results of the three demos, from the runs of 19 November 2026 with Claude Code and Playwright 1.64.1.
A new run gives other words and, now and then, other code.

```bash
cd solutions/14-agents
npx playwright test        # 4 passed. One line has a cross: the test marked test.fail()
```

| File | Where it comes from |
|---|---|
| `tests/reject-a-candidate.spec.ts` | demo 2: written by the assistant with the MCP server, not edited |
| `tests/heal-me.spec.ts` | demo 3, after a person decided: test 1 has the healer's new locator, test 2 is marked `test.fail()` |

## Demo 1 · the answer to "Copy prompt"

> The page snapshot has no button named "Create job"; the control is now a **link** named "New job"
> (`/recruiter/jobs/new`). Both the role and the accessible name changed, so `click()` waited for an element
> that never appeared and timed out.

The fix it proposed: `await page.getByRole('link', { name: 'New job' }).click();`. It took eight seconds.

## Demo 2 · what the assistant found hard to test

Its own three lines, at the end of a run of four minutes:

> 1. The reject button has no name: icon only, no text, `aria-label`, title or test id, so the locator depends on
>    the icon's sprite id.
> 2. The stage is a custom dropdown without role or name; its value can only be read as the text of the table cell.
> 3. Timing and ambiguity: the search runs 300 ms after the last key on a paged table, and the confirmation
>    disappears after four seconds and shares the unnamed role `status` with the result count.

These are the findings of Case 2. The fix is in the component, not in the test.

## Demo 3 · the healer's diff

```diff
-    await page.getByRole('button', { name: 'Create job' }).click();
+    await page.getByRole('link', { name: 'New job' }).click();

+// App bug: the applicant already has an application for a different job ("Fixture job ...").
+// Applying for backend-developer-java with the same e-mail returns 409 {"error":"already-applied"}
+// and the form shows "You have already applied with this email address." Expected: the second
+// application for another job is accepted and the "Thank you for applying" page appears.
-test('one person can apply for two jobs with the same e-mail address', async ({ page, applicant, withdrawAfterTest }) => {
+test.fixme('one person can apply for two jobs with the same e-mail address', async ({ page, applicant, withdrawAfterTest }) => {
```

Two runs ended this way: the locator repaired, the second test skipped with a comment, the expectation untouched.

## The second test

This folder marks it `test.fail()`, not `test.fixme()`. A `fixme` test is skipped, so nobody notices when the bug
is fixed. A test marked `fail` still runs. The day the application accepts the second application, the test
passes unexpectedly and the run fails: the reminder to remove the mark.
