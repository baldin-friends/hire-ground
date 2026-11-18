# Case 3 · Assertions that wait, and your own

**The problem.** The page answers a moment after the click, and a mail arrives a second later. A test that looks once
looks too early. A test that sleeps is slow and still looks only once.

## Before you start

```bash
cd labs/07-assertions
npx playwright test          # once, in a terminal: signs in and saves the session
npx playwright test --ui
```

## Warm-up

`tests/1-warm-up.spec.ts`. The first test fails on purpose.

| You write | It | Selenide |
|---|---|---|
| `expect(await locator.isVisible()).toBe(true)` | looks once, now | `isDisplayed()` |
| `await expect(locator).toBeVisible()` | asks again for up to 5 s | `shouldBe(visible)` |
| `await expect.poll(() => value).toBe(x)` | calls your function again and again | `Wait().until(...)` |
| `await expect(async () => { … }).toPass()` | repeats a block until every assertion in it passes | |
| `await expect.soft(locator).toHaveText(x)` | reports the failure and lets the test go on | |

`isVisible()`, `textContent()`, `count()` are for decisions and for values you compute with. For "is this true?" use `expect(locator)`.

## The challenge · 25 minutes, together

`tests/2-challenge.spec.ts`: the recruiter invites Luis Hartmann to an interview. The test proves that the page
confirms it, that the candidate gets a mail, and that the table shows the new stage. It sleeps four seconds and fails anyway.

**Done when** the test passes without `waitForTimeout`, `isVisible` or `textContent`, and reads
`await expect(row).toHaveStage('Interview')`.

1. Run it. Why is `isVisible()` false although the message is on the screenshot? Replace it.
2. The mail: `mails[0]` is undefined. The mail leaves one to two seconds after the request. Ask until it is there: `expect.poll`.
3. Delete both `waitForTimeout` lines. What waits instead?
4. `expect.ts`: write the matcher `toHaveStage`. Then use it in the test.
5. Make the matcher fail once on purpose (`'Offer'`) and read its message.
6. The date `2026-11-26T10:00` expires. Compute tomorrow.

## Hints

<details>
<summary>Hint 1 · isVisible</summary>

The page shows "Interview scheduled." when the server has answered, about 150 ms after the click. `isVisible()` asked
after 10 ms. `await expect(page.getByText('Interview scheduled.')).toBeVisible()` asks until it is true.

</details>

<details>
<summary>Hint 2 · the mail</summary>

```ts
await expect
    .poll(async () => {
        const response = await request.get('/api/mail', { params: { to: 'luis.hartmann@example.com' } });
        return (await response.json()).map((mail) => mail.subject);
    }, { timeout: 10_000 })
    .toContain('Invitation to an interview: Senior QA Engineer');
```

</details>

<details>
<summary>Hint 3 · no sleep</summary>

`click()` waits until the link "Luis Hartmann" exists and is the only one, which is true after the search has answered.
`expect(locator).toHaveText()` waits until the text is there. Nothing else is needed.

</details>

<details>
<summary>Hint 4 · the matcher</summary>

```ts
const value = row.locator('.hg-select__value');
let pass: boolean;
let matcherResult: any;
try {
    const expectation = this.isNot ? baseExpect(value).not : baseExpect(value);
    await expectation.toHaveText(expected, options);
    pass = true;
} catch (e: any) {
    matcherResult = e.matcherResult;
    pass = false;
}
if (this.isNot) pass = !pass;
```

The rest (message and return value) is in `solutions/07-assertions/expect.ts`.

</details>

## Done early?

Write `toHaveMail` with `expect.poll` inside: `await expect(request).toHaveMail('luis.hartmann@example.com', 'Invitation …')`.

## Timeouts, in one table

| Timeout | Default | Set it |
|---|---|---|
| one test | 30 s | `timeout` in the config, `test.setTimeout()`, `test.slow()` |
| one assertion | 5 s | `expect: { timeout }` in the config, or `{ timeout }` on the assertion |
| one action (`click`, `fill`) | none: it may use the rest of the test | `use: { actionTimeout }` |
| one navigation | none | `use: { navigationTimeout }` |
| `toPass` | none | `{ timeout }` on the call |

## Read more

- Assertions, the full list: https://playwright.dev/docs/test-assertions
- Auto-waiting and actionability: https://playwright.dev/docs/actionability
- `expect.poll`: https://playwright.dev/docs/test-assertions#expectpoll
- `toPass`: https://playwright.dev/docs/test-assertions#expecttopass
- Custom matchers: https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend
- Timeouts: https://playwright.dev/docs/test-timeouts
