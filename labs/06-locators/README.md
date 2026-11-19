# Case 2 · Locators when there is no role

**The problem.** `getByRole` is the first choice, and it needs markup that has roles and names. A component library
built from `<div>`s, a button that is only an icon, a panel rendered at the end of `<body>`: the candidates table has all three.

## Before you start

```bash
cd labs/06-locators
npx playwright test          # once, in a terminal: signs in and saves the session
npx playwright test --ui
```

Every test in this lab starts with a fresh database (`POST /api/test/reset` in `beforeEach`), so the lab runs with one
worker. Case 4 removes that.

## Warm-up

`tests/1-warm-up.spec.ts`: three elements in the row of Ben Braun.

| Element | What it has | Locator |
|---|---|---|
| row, checkbox, link | a role and a name | `getByRole('row', { name: 'Ben Braun' })`, `getByRole('checkbox', { name: 'Select Ben Braun' })` |
| the stars | roles, inside a shadow root | `getByRole('radio', { name: '4 stars' })`: locators see into open shadow roots |
| the star button | an `<svg>`, nothing else | `row.locator('button:has(use[href="#icon-star"])')` |

## The challenge · 30 minutes, together

`tests/2-challenge.spec.ts`: the recruiter moves Felix Wagner to Screening, gives him four stars, puts him on the
shortlist and rejects Lea Neumann. The test is written by role and name, and it fails five times, each time for a
different reason.

**Done when** the test passes, and one helper knows how the dropdown works.

Run it, read the failure, repair that line, run it again. After each repair the test gets one step further.

1. Felix Wagner is not found. Where is he? (Look at the page in the trace.)
2. `getByRole('combobox')` finds nothing. Open the Locator tab in UI mode and read the Aria snapshot of the row.
3. The option "Screening" is not inside the row. Where in the DOM is it? After this repair the stars pass
   without a change: they have roles.
4. The button "Shortlist" does not exist under that name. What does **Pick locator** suggest, and would you keep that?
5. Lea Neumann is not found: the search still shows Felix, and she is on page 4. Search for her. Then "Reject":
   the same as step 4. The dialog after it has a role and a name.
6. Move the dropdown into a function `selectStage(row, stage)` and the search into `candidateRow(page, name)`.

Every step is at the end of `tests/2-challenge.spec.ts` as a comment, ready to copy.

## Hints

<details>
<summary>Hint 1 · the row</summary>

The table shows ten rows of 36, newest first. Felix applied 16 days ago: page 3. Do not click "Next" twice; search:

```ts
await page.getByLabel('Search').fill('Felix Wagner');
await expect(page.getByText('1 candidate', { exact: true })).toBeVisible();
```

</details>

<details>
<summary>Hint 2 · the dropdown</summary>

It is `<div class="hg-select"><div class="hg-select__trigger">`. No role, so no role locator. CSS is the honest
choice here: `row.locator('.hg-select__trigger')`.

</details>

<details>
<summary>Hint 3 · the option</summary>

The panel is rendered in `<div id="overlays">` at the end of `<body>`, the way Angular CDK overlays, React portals
and most component libraries do it. Start from the page, not from the row:

```ts
await page.locator('.hg-select__panel').getByText('Screening', { exact: true }).click();
```

`page.getByText('New', { exact: true })` would match two elements: the value in the trigger and the option.

</details>

<details>
<summary>Hint 4 · the icon buttons</summary>

Pick locator suggests something like `getByRole('button').nth(4)`: the fifth button on the page. It breaks when a row
is added. Describe the button by its icon instead:

```ts
felix.locator('button:has(use[href="#icon-star"])')
```

</details>

## The better repair: the application

A button without a name is a bug for everybody who uses a screen reader. `IconButton` has a `label` property, and the
table does not use it. In `app/src/pages/Candidates.tsx`:

```tsx
<IconButton icon="star" label={`Shortlist ${fullName(a)}`} pressed={a.shortlisted} onClick={() => shortlist(a)} />
<IconButton icon="download" label={`Download the CV of ${fullName(a)}`} href={`/api/applications/${a.id}/cv`} />
<IconButton icon="reject" label={`Reject ${fullName(a)}`} onClick={() => setConfirm([a])} />
```

Restart the app (`npm run app` in the repository root builds it again). Then the test can say what a user would say:

```ts
await felix.getByRole('button', { name: 'Shortlist Felix Wagner' }).click();
await expect(felix.getByRole('button', { name: 'Shortlist Felix Wagner', pressed: true })).toBeVisible();
```

## Your own selectors

`tests/3-selector-engine.spec.ts` and `engines.ts`: a custom selector engine, `page.locator('rating=4')`, next to the
same query written with a role. Three ways to teach Playwright about your component framework, in this order:

1. Give the components roles and names. Every test, every screen reader and codegen profit at once.
2. A test attribute: `testIdAttribute: 'data-qa'` in the config, then `getByTestId('candidate-row')`.
3. Functions that return locators (`selectStage`, `candidateRow`), collected per component.
4. A selector engine, when a query needs code that runs in the page. Codegen and Pick locator do not know it.

## Read more

- Locators and their order of preference: https://playwright.dev/docs/locators
- CSS, XPath, `:has()`, layout selectors: https://playwright.dev/docs/other-locators
- Shadow DOM: https://playwright.dev/docs/locators#locate-in-shadow-dom
- Filtering (`filter`, `has`, `hasText`): https://playwright.dev/docs/locators#filtering-locators
- Test ids and `testIdAttribute`: https://playwright.dev/docs/locators#locate-by-test-id
- Custom selector engines: https://playwright.dev/docs/extensibility
- Aria snapshots: https://playwright.dev/docs/aria-snapshots
- Best practices: https://playwright.dev/docs/best-practices
