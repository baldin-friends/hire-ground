# Playwright survival card

One sheet, two sides. Print A4 double-sided; side 2 starts at "Debugging protocol".
Course: Playwright · End-to-end testing for web applications · Playwright 1.64 · Node 22+

## Locators, in this order

| Order | Locator | Use it for |
|---|---|---|
| 1 | `getByRole(role, { name })` | anything with a role: buttons, links, headings, fields |
| 2 | `getByLabel('Email')` | form fields with a label |
| 3 | `getByPlaceholder()` · `getByText()` | fields without a label, visible copy |
| 4 | `getByTestId()` | an explicit contract with the developers |
| 5 | `locator('css')` | nothing else works; add a comment why |

Narrowing: `.filter({ hasText })` · `.filter({ has })` · `.within()` · `.first()` is the last resort.
A locator is a description, not an element: it searches each time an action or assertion uses it.

## Assertions that wait

```ts
await expect(locator).toBeVisible();          // also: toBeHidden, toBeChecked, toBeFocused
await expect(locator).toHaveText('1 job');    // also: toContainText, toHaveValue, toHaveAttribute
await expect(locator).toHaveCount(3);
await expect(page).toHaveURL(/applied/);      // also: toHaveTitle
await expect
  .poll(async () => (await mails()).length, { timeout: 10_000 })
  .toBe(1);                                   // for values that arrive eventually
```

`await expect(x).toBeVisible()` retries. `expect(await x.isVisible()).toBe(true)` checks once and lies on CI.
Every action and assertion needs `await`. A forgotten `await` keeps the test running and lying.

## The command line

| You want | Command |
|---|---|
| everything | `npx playwright test` |
| one file, one title | `npx playwright test jobs` · `-g "apply"` |
| one engine, all engines | `--project=webkit` · `--project='*'` |
| watch, step through | `--headed` · `--ui` · `--debug` |
| only what failed last time | `--last-failed` |
| prove it is not flaky | `--repeat-each=20` · `--workers=4` · `--shuffle` |
| read a failure | `npx playwright show-report` · `npx playwright show-trace trace.zip` |
| learn a locator | `npx playwright codegen localhost:3000` |

## Timeouts, defaults

test 30 s · `expect` 5 s · action and navigation: none (fall back to the test) · `webServer` 60 s.
A timeout says how long to wait, never what to wait for.

---

## Debugging protocol — six steps, in this order

1. **Reproduce.** `--repeat-each=20`, same project, same worker count as CI.
2. **Isolate.** One test, `--workers=1`, then `--shuffle`.
3. **Hypothesis.** One sentence, written down before touching code.
4. **Evidence.** Trace: actions, DOM snapshots, network, console.
5. **Fix the cause.** No sleep, no retry, no `force`.
6. **Prove it.** The same repeat run as step 1, green.

## The rule of the course

If understanding the failure needs a browser, it may be an end-to-end test. Otherwise, push it down.

## In the room

- **Pink note** on the lid: stuck for ten minutes. Neighbour first, then the trainer.
- **Green note**: done. Take the stretch goal or help a neighbour.
- Errors in labs are expected. They are the material.

## Team rules collected this week

1. Every test checks something a user can see.
2. No `waitForTimeout` in a test that is meant to stay.
3. If a locator needs CSS, the pull request says why.
4. _________________________________________
5. _________________________________________
