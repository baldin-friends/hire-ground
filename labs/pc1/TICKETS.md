# Pair challenge 1 · Locator traps

Eight tickets, two people, one keyboard. Constraint: **no CSS, no XPath.**

Rules:

- Write your hypothesis on the ticket before anyone edits code.
- Hints come in three levels. Open the next one after ten minutes without progress.
- Done means: the test of the ticket passes five times in a row, for example `npx playwright test ticket-1 --repeat-each=5`. Tickets 4 and 5 ask for ten.
- Driver changes every 5 minutes. In uneven pairs the less experienced person drives.

Start: in `labs/pc1/`, run `npx playwright test`. Eight tests fail. That red is your starting point.

Every ticket has one test file in `tests/`. The `?bugs=…` in its first URL switches the trap on, for that browser context only. It stays in the URL.

---

## PC1-1 · The Apply button exists twice. Playwright refuses to guess.

| | |
|---|---|
| Symptom | `strict mode violation: getByRole('link', { name: 'Apply' }) resolved to 2 elements` |
| Where | `tests/ticket-1-apply-twice.spec.ts` · `/jobs/senior-qa-engineer?bugs=dup-apply` |
| Your job | make the test pass without CSS; decide whether the app or the test is wrong |
| Done when | `npx playwright test ticket-1 --repeat-each=5` passes |

<details><summary>Hint 1</summary>

Read the error to the end: Playwright prints both matching elements. Where does each one live on the page? The error also suggests `locator('#apply-button')`. That is CSS, so it is out.

</details>

<details><summary>Hint 2</summary>

One Apply link sits in a paragraph below the job facts, the other in a bar fixed to the bottom of the window. `getByRole('main')` contains both, so it narrows nothing. Look for a role that only one of the two links has around it, then chain the locators, or use `filter()` or `within()`.

</details>

<details><summary>Hint 3</summary>

`page.getByRole('paragraph').getByRole('link', { name: 'Apply' })` passes: the bar at the bottom is not a paragraph. `.first()` passes too, and it is a guess with an index attached. Then answer the second half of the job: is a second Apply link a bug or a feature? Write one sentence on the ticket.

</details>

---

## PC1-2 · The recorded test worked yesterday. The ids did not survive the night.

| | |
|---|---|
| Symptom | `locator('#job-1-4f9a')`: `element(s) not found`. The id was copied from the page yesterday |
| Where | `tests/ticket-2-dynamic-ids.spec.ts` · `/jobs?bugs=dynamic-ids` |
| Your job | make the test survive a reload, and the next deployment |
| Done when | `npx playwright test ticket-2 --repeat-each=5` passes, and no `#` is left in the test |

<details><summary>Hint 1</summary>

Reload the page twice and compare the id of the first job card in DevTools. What stays the same between loads?

</details>

<details><summary>Hint 2</summary>

What the user reads survives: roles, labels, visible text. Generated ids do not. *Pick locator* in UI mode shows a locator for any element you click. If it offers an id, look for the role and the name yourself.

</details>

<details><summary>Hint 3</summary>

Replace every `#id` locator with `getByRole` or `getByLabel`. The job card is an `article` named after its job title, the title is a link, the Apply link has a name, and the form field has a label:

```ts
const card = page.getByRole('article', { name: 'Senior QA Engineer' });
await card.getByRole('link', { name: 'Senior QA Engineer' }).click();
```

The test then never mentions an id again.

</details>

---

## PC1-3 · "Senior QA Engineer" is on the screen and the XPath disagrees.

| | |
|---|---|
| Symptom | `locator('//h1[text()="Senior QA Engineer"]')`: `element(s) not found`. Your own eyes find the heading immediately |
| Where | `tests/ticket-3-nbsp-title.spec.ts` · `/jobs/senior-qa-engineer?bugs=nbsp-title` |
| Your job | find out why the page and the locator disagree, then fix the locator |
| Done when | `npx playwright test ticket-3 --repeat-each=5` passes, and no XPath is left in the test |

<details><summary>Hint 1</summary>

Inspect the heading in DevTools, in the Elements panel, and read its text character by character. What stands between the words?

</details>

<details><summary>Hint 2</summary>

The title contains non-breaking spaces (`&nbsp;`). XPath `text()=` compares raw characters, and a non-breaking space is not a space. User-facing locators normalise whitespace before they compare.

</details>

<details><summary>Hint 3</summary>

`getByRole('heading', { name: 'Senior QA Engineer' })` passes, typed with ordinary spaces. For the second line of the test, `getByText('QA · Dresden · Remote possible')` replaces the XPath. The no-XPath rule stops being a constraint.

</details>

---

## PC1-4 · Results arrive when they feel like it.

| | |
|---|---|
| Symptom | `expect(received).toBe(expected)`: expected 12, received 0. The twelve jobs are on the page a moment later. The second count in the test has the same problem: expected 3, received 12 |
| Where | `tests/ticket-4-slow-search.spec.ts` · `/jobs?bugs=slow-search` |
| Your job | make the test deterministic without slowing it down |
| Done when | `npx playwright test ticket-4 --repeat-each=10` passes, without `waitForTimeout` |

<details><summary>Hint 1</summary>

Open the trace of the red run: `npx playwright show-report`, then the test, then the trace. On the timeline: when did the test count the list, and when did the response from `/api/jobs` arrive?

</details>

<details><summary>Hint 2</summary>

`expect(await jobs.count()).toBe(12)` counts once, right now, before the list has arrived. After the search the same kind of line counts the old list, which stays on screen until the new one is there. Which assertion keeps retrying until the page catches up?

</details>

<details><summary>Hint 3</summary>

`await expect(jobs).toHaveCount(12)` retries for up to five seconds and passes the moment the twelve jobs render. The same for the three results. No sleep anywhere.

</details>

---

## PC1-5 · The cookie banner appears in about 30 % of runs.

| | |
|---|---|
| Symptom | `Test timeout of 30000ms exceeded` while `waiting for getByRole('button', { name: 'Accept all' })`. The test accepts the banner as a fixed step. About 70 % of page loads have no banner to accept |
| Where | `tests/ticket-5-cookie-banner.spec.ts` · `/jobs?bugs=cookie-banner` |
| Your job | make the test pass whether the banner shows up or not |
| Done when | `npx playwright test ticket-5 --repeat-each=10` passes |

<details><summary>Hint 1</summary>

You cannot predict when the banner appears, so a fixed "accept the banner" step fails on every page load without one. Delete the step and run the test ten times: about half of the runs now fail the other way round. The banner arrives up to 800 ms after the page, and covers the link the test wants to click. What does Playwright offer for "whenever this element shows up, do this"?

</details>

<details><summary>Hint 2</summary>

`page.addLocatorHandler(locator, handler)`: you name the element that gets in the way and say what to do with it. Playwright looks for it before every action and every web-first assertion, and runs the handler only when it is visible. An `if (await banner.isVisible())` looks once and misses a banner that arrives 300 ms later.

</details>

<details><summary>Hint 3</summary>

```ts
await page.addLocatorHandler(page.getByRole('button', { name: 'Accept all' }), async (button) => {
    await button.click();
});
```

Register it once, before the loop. It stays active for the whole test, across page loads. The fixed "Accept all" step goes.

</details>

---

## PC1-6 · The toast covers Submit for 800 ms. Someone tried `force: true`.

| | |
|---|---|
| Symptom | the click with `force: true` reports no error, the form stays where it is, and "Thank you for applying" never appears: `element(s) not found` |
| Where | `tests/ticket-6-toast-overlay.spec.ts` · `/jobs/senior-qa-engineer/apply?bugs=toast-overlay` |
| Your job | find out where the forced click went, then make the test pass without `force` |
| Done when | `npx playwright test ticket-6 --repeat-each=5` passes, without `force`, and the confirmation is still asserted |

<details><summary>Hint 1</summary>

Open the trace and select the click on "Submit application". The snapshot marks the point that was clicked. What lies on top of the button at that moment, and does it go away by itself?

</details>

<details><summary>Hint 2</summary>

`force: true` skips the actionability checks. One of them asks: does the button receive the click at this point, or does another element? With `force` the click goes to whatever lies on top, here the "Draft saved" toast. The button never hears about it.

</details>

<details><summary>Hint 3</summary>

Delete `{ force: true }`. A normal click waits until the toast is gone, about 800 ms, and then clicks. The log of the click in the trace shows the wait: `<div role="status" class="toast overlay">Draft saved</div> intercepts pointer events`, then `retrying click action`. To make the wait visible in the test, put `await expect(page.getByRole('status')).toBeHidden()` before the click.

</details>

---

## PC1-7 · The location filter looks like a select and is not one.

| | |
|---|---|
| Symptom | `locator.selectOption: Error: Element is not a <select> element` |
| Where | `tests/ticket-7-custom-select.spec.ts` · `/jobs?bugs=custom-select` |
| Your job | operate the filter the way a user does |
| Done when | `npx playwright test ticket-7 --repeat-each=5` passes |

<details><summary>Hint 1</summary>

`selectOption` only works on a native `<select>`. Read the error to the end: it prints the element the locator found. Which tag is it, and which ARIA role does it carry?

</details>

<details><summary>Hint 2</summary>

It is a button with the role `combobox`. A user clicks it open, then clicks an option. Two locators, two clicks.

</details>

<details><summary>Hint 3</summary>

```ts
await page.getByRole('combobox', { name: 'Location' }).click();
await page.getByRole('option', { name: 'Dresden' }).click();
```

</details>

---

## PC1-8 · "Save job" is an icon. It has no name.

| | |
|---|---|
| Symptom | `getByRole('button', { name: 'Save job' })`: `element(s) not found`. The button is on the page: a bookmark icon on every job card |
| Where | `tests/ticket-8-icon-save.spec.ts` · `/jobs?bugs=icon-save` |
| Your job | decide: fix the locator, or fix the app |
| Done when | the **unchanged** test passes: `npx playwright test ticket-8 --repeat-each=5` |

<details><summary>Hint 1</summary>

If Playwright cannot find the button by its name, who else cannot? Think of users who do not see the icon.

</details>

<details><summary>Hint 2</summary>

The button has no accessible name. That is a bug in the app, not in the test. The fix belongs where the button is rendered: `app/src/components/SaveButton.tsx`, seen from `labs/pc1/` that is `../../app/src/components/SaveButton.tsx`.

</details>

<details><summary>Hint 3</summary>

In `SaveButton.tsx` the teaching bug takes the name away: `aria-label={nameless ? undefined : 'Save job'}`. Give the button its name in every case:

```tsx
aria-label="Save job"
```

Then run the test again. Playwright builds and starts the app for every run. If the app runs in a terminal of its own, stop it there with Ctrl+C first, or start it again with `npm start` in `app/`: the running app still serves the old build. The original locator passes unchanged, and a screen reader now says "Save job".

</details>

---

Finished early? The UI Testing Playground at `http://uitestingplayground.com` has more traps: `/hiddenlayers`, `/overlapped`, `/shadowdom`. Same rule: no CSS, no XPath.
