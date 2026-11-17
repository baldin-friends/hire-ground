# Step 10 · One accessibility scan of the job page

The job page should work with a screen reader. An accessibility scan shows how far it is from that.

**Time** 15 min · alone

## Start here

`labs/12-accessibility/tests/a11y.spec.ts`: an axe scan of the career page with the teaching bug `icon-save` switched on.

## Steps

1. Run the scan: `npx playwright test`. It fails.
2. Read the violation in the error: which rule, which element, which fix does axe suggest?
3. Fix it in the app: `app/src/components/SaveButton.tsx`. Stop the app if it runs in a terminal; the next test run builds and starts it again.
4. Run the scan again.

## Done when

The scan is clean with the bug still switched on.

## Stuck?

<details>
<summary>Hint 1 · the rule</summary>

`button-name`: a button needs a name that assistive technology can read. An icon alone has none.

</details>

<details>
<summary>Hint 2 · the fix</summary>

In `SaveButton.tsx` the bug removes `aria-label`. Give the button its name in every case: `aria-label="Save job"`.
Did your pair fix this on Day 1 (ticket 8)? Then the scan is green already: take "Done early".

</details>

## Done early?

An ARIA snapshot of the search form: `await expect(page.getByRole('search', { name: 'Job search' })).toMatchAriaSnapshot(…)` with a template string.
Start with an empty template and let Playwright write it: `npx playwright test --update-snapshots`.
