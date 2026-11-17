# Steps 7 to 9 · Find elements, then act and assert

One rule for all three steps: user-facing locators only. `getByRole`, `getByLabel`, `getByText`. No CSS, no XPath.

From here on the suite starts the application by itself. You can stop `npm run app`.

```bash
cd labs/03-locators
```

## Step 7 · Five locators · 15 min

`tests/find.spec.ts`: five tests. In each one the assertion is written and the locator is missing.

```bash
npx playwright test find
```

Not sure about a role or a name? `npx playwright test --ui`, then "Pick locator" above the snapshot, and click the element.

Test 5 fails for a different reason than the others. Read its error before you fix it.

**Done when** `npx playwright test find` says `5 passed`.

<details>
<summary>Hint · the three kinds of locator you need</summary>

```ts
page.getByRole('searchbox', { name: 'Search jobs' })   // role and name
page.getByLabel('Location')                            // the label of a form field
page.getByText('no cover letter required')             // visible text, a part is enough
```

</details>

## Step 8 · Narrow it down · 12 min

`tests/narrow.spec.ts`: twelve cards look alike. Three tests, each starts from a card.

```bash
npx playwright test narrow
```

**Done when** `npx playwright test narrow` says `3 passed`.

<details>
<summary>Hint · inside, and filter</summary>

```ts
card.getByText('per year')                 // search inside the card, not on the whole page
cards.filter({ hasText: 'Hamburg' })       // keep the cards that contain a text
page.getByRole('article', { name: 'UX Researcher' }).getByRole('button', { name: 'Save job' })
```

</details>

## Step 9 · Act, and assert without sleeping · 25 min

**First, the flaky test (8 min).** `tests/search.spec.ts` fails about three times in ten:

```bash
npx playwright test search --repeat-each=10
```

It sleeps for a second and then counts once. The three changes are listed at the top of the file.

**Then your own search test (17 min).** `tests/jobs.spec.ts`, the test "candidate finds the senior QA job in Dresden", five TODOs:

1. Search for "QA", choose the location Dresden, tick "Remote only".
2. Assert that the status line says "1 job".
3. Open the posting. Assert the heading, and the salary "62.000–78.000 € per year".

**Done when** `npx playwright test search jobs --repeat-each=5` passes.

<details>
<summary>Hint 1 · the form elements</summary>

The search field is a `searchbox` named "Search jobs" and takes `fill('QA')`. The location filter is a native select:
`getByLabel('Location').selectOption('Dresden')`. The checkbox is named "Remote only" and takes `check()`.

</details>

<details>
<summary>Hint 2 · the assertions</summary>

`await expect(page.getByRole('status')).toHaveText('1 job');` waits until the text is there: "1 job", singular.
The main heading is `getByRole('heading', { level: 1 })`. Copy the salary from the page: the dash between the numbers is an en dash.

</details>

## Done early?

- The same search with the keyboard only: `pressSequentially`, `press('Enter')`, `press('Tab')`.
- Record the search: `npx playwright codegen localhost:3000/jobs`. Compare the recording with your test. What would you keep, what would you change?

The finished files are in `solutions/03-locators`.
