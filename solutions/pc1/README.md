# Pair challenge 1 · Locator traps · solutions

All eight tickets fixed at the cause. Seven fixes are in the tests. The eighth is in the app.

```bash
cd solutions/pc1
npx playwright test --repeat-each=10    # 70 passed, 10 failed: ticket 8, until the app is fixed
```

Nothing here uses CSS, XPath, `force`, `waitForTimeout` or a longer timeout.

## The eight tickets

| # | Root cause | Where to see it | Fix | Lesson |
|---|---|---|---|---|
| 1 | The job page has two Apply links: one in a paragraph under the job facts, one in a bar fixed to the bottom. The locator matches both, and Playwright does not pick one. | The error prints both elements, with a suggested locator for each. | `page.getByRole('paragraph').getByRole('link', { name: 'Apply' })`. | Strict mode is a feature. Narrow the locator to the element the user means. |
| 2 | The ids are generated on every page load. The test copied yesterday's. | Reload twice and compare the id of the first job card in DevTools. | The card is an `article` with the job title as its name; title and Apply are links; the form field has a label. No `#` is left. | Roles, labels and visible text survive a deployment. Generated ids do not. |
| 3 | The title contains non-breaking spaces. XPath `text()=` compares raw characters. | Elements panel in DevTools: `&nbsp;` between the words. | `getByRole('heading', { name: 'Senior QA Engineer' })` and `getByText('QA · Dresden · Remote possible')`. | User-facing locators normalise whitespace. XPath does not. |
| 4 | `expect(await jobs.count())` counts once, before the list has arrived: 0 instead of 12. After the search it counts the old list: 12 instead of 3. | The trace timeline: the count happens before the response from `/api/jobs`. | `await expect(jobs).toHaveCount(12)`, and the same for 3. | An assertion on a locator retries. An assertion on a number that was read earlier cannot. |
| 5 | The banner shows on about 30 % of page loads, up to 800 ms after the page. A fixed "accept" step waits for a banner that is not coming. | The error: 30 s waiting for the button "Accept all". | `page.addLocatorHandler(…)`, registered once before the loop. The fixed step goes. | For an element that may or may not appear, register a handler. `if (await banner.isVisible())` looks once and misses a late banner. |
| 6 | `force: true` skips the check "does this element receive the click". The click lands on the "Draft saved" toast. | The trace: select the click, the snapshot marks the point, and the toast lies on top. | Delete `{ force: true }`. The normal click waits about 800 ms until the toast is gone. | `force` does not make a click work. It stops Playwright from telling you why it would not. |
| 7 | The filter is a button with the role `combobox`, not a `<select>`. | The error prints the element that was found. | Click the combobox, then click the option "Dresden". | Operate a control the way a user does. `selectOption` is for native selects only. |
| 8 | The save button has no accessible name. | Inspect the button: an icon, no text, no `aria-label`. | In `app/src/components/SaveButton.tsx`: `aria-label="Save job"` in every case. The test stays as it is. | If Playwright cannot find it by name, a screen reader cannot announce it. That is a bug report, not a locator problem. |

## Ticket 8, to show on the projector

`app/src/components/SaveButton.tsx`, line 14:

```tsx
aria-label={nameless ? undefined : 'Save job'}     // before: the teaching bug takes the name away
aria-label="Save job"                              // after
```

Then `npx playwright test ticket-8 --repeat-each=5` in `labs/pc1`: 5 passed. Playwright builds and starts the app for every run, so the fix is picked up. An app that runs in a terminal of its own still serves the old build: stop it first.

A pair that fixes ticket 8 has also fixed Lab 12 on Day 3: the accessibility scan there is green for them from the start. Use it then: "Who fixed this on Wednesday?"

## Notes for the debrief

- **Ticket 1 has a second half:** is the second Apply link a bug or a feature? There is no right answer. A sticky Apply bar is a common design, and the test should then say which link it means. A pair that argued about it has understood strict mode.
- **Ticket 1, `.first()`:** it passes, and it is a guess with an index attached. Ask: "Which one is first after the next redesign?"
- **Ticket 3:** some pairs think `getByText` failed. It did not: the XPath did. Let them run both in UI mode with *Pick locator*.
- **Ticket 4 is the same mistake twice,** and the second one is harder to see: the old list stays on screen until the new one is there, so the count is wrong in the other direction.
- **Ticket 5 takes 30 seconds to fail.** That is the test timeout, and a good moment to ask what the test was waiting for. The starter passes about once in 1,400 runs: when all six page loads happen to show a banner.
- **Ticket 5, the half fix:** deleting the fixed step makes about half of the runs green. The banner then covers the link in the other runs. Only the handler makes it ten of ten.
- **Ticket 6:** the comment in the test says "the click was slow without it". Slow by 800 ms, and correct. Ask what the user would have done.
- **Ticket 6 sends one application per run.** They add up on the board until the app restarts. Nothing depends on it.
- **Ticket 8 is the one to end the debrief with.** It is the only ticket where the test was right.

## Wrong fixes to expect

| Ticket | Wrong fix | Why it is wrong |
|---|---|---|
| 1 | `.first()` or `.nth(1)` | an index, not a meaning |
| 2 | the new id, copied again | red after the next reload |
| 3 | `//h1[contains(text(), "Senior")]` | still XPath, and it passes for the wrong reason |
| 4 | `waitForTimeout(2000)` | the API takes 300 to 1500 ms today; nobody knows about tomorrow |
| 5 | `if (await banner.isVisible()) …` | looks once; the banner arrives up to 800 ms later |
| 6 | `waitForTimeout(1000)` before the forced click | passes, and hides the question why `force` was needed |
| 7 | `fill('Dresden')` on the combobox | it is a button |
| 8 | `card.getByRole('button')` without a name | passes, and the screen reader still says "button" |

## The four lessons

| Tickets | Lesson |
|---|---|
| 1, 7 | narrow the locator to what the user means |
| 2, 3 | user-facing locators survive ids and whitespace that change |
| 4, 5, 6 | let Playwright wait: web-first assertions, a locator handler, no `force` |
| 8 | a missing accessible name is an app bug: fix the app, not the locator |
