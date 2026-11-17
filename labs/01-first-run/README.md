# Steps 1 to 4 · Run a test, then write one

Two finished tests are in `tests/smoke.spec.ts`. You run them, look inside one, and then write your own.

Hire Ground has to run for this folder: `npm run app` in a second terminal (from the setup check).

## Step 1 · A green run, four ways · 10 min

```bash
cd labs/01-first-run
npx playwright test                          # everything: 6 passed
npx playwright test --project=firefox        # one browser
npx playwright test --headed                 # with a visible browser
npx playwright test -g "twelve jobs"         # one test, by a part of its title
npx playwright show-report                   # the report of the last run; Ctrl+C closes it
```

Before you run the next line, tell yourself what the previous one changed.

**Done when** the first run says `6 passed`, and you can explain why the Firefox run says 2.

## Step 2 · Look inside a test · 10 min

1. `npx playwright test --ui`
2. Run "the career page lists twelve jobs". Click through its actions: every action has a snapshot before and after.
3. In `tests/smoke.spec.ts`, change `'12 jobs'` to `'13 jobs'` and run the test again.
4. Read the error: what was expected, what was received, and how long did Playwright keep trying?
5. Change it back.

**Done when** the test is green again and you have seen the failed step on the timeline.

**Done early?** Press "Pick locator", click the search box, and copy the locator that Playwright suggests.
If you use VS Code: install the extension "Playwright Test for VS Code" and run a test with the green triangle next to it.
WebStorm shows run icons in the gutter without an extension.

## Step 3 · Your first test · 13 min

1. Create a new file: `tests/jobs.spec.ts`.
2. Write a test that opens `http://localhost:3000/jobs/senior-qa-engineer` and asserts that the heading "Senior QA Engineer" is visible.
3. Run it: `npx playwright test jobs --project=chromium`
4. Delete the `await` in front of `expect`. Run it again and read the error: "Test ended." The test was over before the assertion had finished. Put the `await` back.

**Done when** your test is green, and you have seen the error a missing `await` produces.

<details>
<summary>Hint · the whole test</summary>

```ts
import { expect, test } from '@playwright/test';

test('shows the job title', async ({ page }) => {
    await page.goto('http://localhost:3000/jobs/senior-qa-engineer');

    await expect(page.getByRole('heading', { name: 'Senior QA Engineer' })).toBeVisible();
});
```

</details>

**New to `async` and `await`, or to TypeScript?** `labs/00-typescript` is a fifteen-minute warm-up without a browser.

## Step 4 · A second test and a hook · 10 min

1. Add a second test to the same file: the link "Apply" is visible.
2. Both tests start with the same `page.goto`. Move it into `test.beforeEach`.
3. Put both tests and the hook into `test.describe('the job page', () => { … })`.

**Done when** `npx playwright test jobs` shows two tests per browser, and `page.goto` appears once in the file.

<details>
<summary>Hint · the hook</summary>

```ts
test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/jobs/senior-qa-engineer');
});
```

The link: `page.getByRole('link', { name: 'Apply' })`.

</details>

**Done early?** Run all tests in all browsers. How many runs do you expect, and why?

The finished files are in `solutions/01-first-run`.
