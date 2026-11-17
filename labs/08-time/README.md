# Steps 14 and 15 · Time

The session warning appears after 30 minutes. Prove it, without waiting 30 minutes per run.

**Time** two steps of 10 minutes · alone

## Start here

`labs/08-time`: the suite from step 12, finished, plus `tests/time.spec.ts` with two tests to complete.

## Steps

1. **Step 14:** the session warning after 30 minutes, with `page.clock`.
2. **Step 15:** an application through the API with the teaching bug `mail-delay`: the confirmation mail arrives after 2 to 8 seconds. Poll the test mailbox until it is there.

## Done when

`npx playwright test time` passes, and the session test needs seconds, not minutes.

## Stuck?

<details>
<summary>Hint 1 · the clock has no effect</summary>

`await page.clock.install()` must run before `page.goto`: the page has to start with the fake clock.

</details>

<details>
<summary>Hint 2 · the warning</summary>

```ts
await page.clock.fastForward('30:00');
await expect(page.getByRole('alertdialog')).toContainText('Your session expires in 2 minutes.');
```

</details>

<details>
<summary>Hint 3 · polling the mailbox</summary>

```ts
await expect
    .poll(async () => (await (await request.get(`/api/mail?to=${p.email}`)).json()).length, { timeout: 15_000 })
    .toBe(1);
```
The default timeout of an assertion is 5 seconds; the mail can take 8.

</details>

## Done early?

"Closes today" at 00:30 in Berlin. Open a job with `?bugs=deadline-tz`, set the clock with `page.clock.setFixedTime()` to half past midnight on the deadline day, and compare what the page says with what it should say. Which time zone does the bug use?
