# Accessibility · One scan, two pages

On Thursday three controls in the candidates table could not be found by role: the star, the download link and the
reject button have an icon and no name. An accessibility scan reports exactly these controls, without anybody
writing a locator.

**Time** 10 min · together on the projector

## The situation

`labs/16-accessibility/tests/a11y.spec.ts` has two axe scans:

1. the career page, with the teaching bug `icon-save` switched on (the "Save job" button loses its name),
2. the candidates table of the recruiter.

## Steps

1. Run the scans: `npx playwright test`. Both fail.
2. Read the violations: which rule, how many elements? The HTML report (`npx playwright show-report`) shows each
   element and the fix axe suggests.
3. Fix the candidates table in the app: `app/src/pages/Candidates.tsx`, the three `IconButton`s in the last cell.
   `IconButton` has a `label` prop for the accessible name. Stop the app if it runs in a terminal; the next test run
   builds and starts it again.
4. Run the scans again: the second one passes.
5. Fix the career page the same way: `app/src/components/SaveButton.tsx`.

## Done when

`npx playwright test` says `2 passed`.

Before the fix it says `2 failed`: `button-name` on the career page (12 elements), `button-name` (20 elements) and
`link-name` (10 elements) in the candidates table. Did you give the icon buttons a `label` on Thursday (the candidates
table) or fix `SaveButton.tsx` on Wednesday? Then that scan is green already.

## Hints

<details>
<summary>Hint 1 · the rules</summary>

`button-name`: a button needs a name that assistive technology can read. `link-name`: the same for a link.
An icon alone has no name.

</details>

<details>
<summary>Hint 2 · the fix in the candidates table</summary>

```tsx
<IconButton icon="star" label={`Shortlist ${fullName(a)}`} pressed={a.shortlisted} onClick={() => shortlist(a)} />
<IconButton icon="download" label={`Download the CV of ${fullName(a)}`} href={`/api/applications/${a.id}/cv`} />
<IconButton icon="reject" label={`Reject ${fullName(a)}`} onClick={() => setConfirm([a])} />
```

After it, the locator from Thursday becomes `row.getByRole('button', { name: 'Shortlist Ben Braun' })`.

</details>

<details>
<summary>Hint 3 · the fix on the career page</summary>

In `SaveButton.tsx` the bug removes `aria-label`. Give the button its name in every case: `aria-label="Save job"`.

</details>

## More

An ARIA snapshot of the search form checks structure instead of pixels:
`await expect(page.getByRole('search', { name: 'Job search' })).toMatchAriaSnapshot(…)` with a template string.
Start with an empty template and let Playwright write it: `npx playwright test --update-snapshots`.

## Read more

- Accessibility testing with axe: <https://playwright.dev/docs/accessibility-testing>
- ARIA snapshots: <https://playwright.dev/docs/aria-snapshots>
- The rules axe checks: <https://dequeuniversity.com/rules/axe/4.14/button-name>
