# Lab 9 · Faster, and still true

The suite takes too long. Make it faster, and keep it correct.

**Time** 45 min · alone

## Warm-up, before the lab · pairs · 10 min

`labs/09-parallel` holds the suite of Days 1 and 2. Measure it with one worker. Then make it faster, without a single failure in three runs.
Write down what broke on the way, and why.

```bash
cd labs/09-parallel
npx playwright test --workers=1      # the starting point; the run time is on the last line
npx playwright test --workers=4      # and then?
```

## Steps

1. Measure with `--workers=1` and `--workers=4`; note both times.
2. Run `npx playwright test --workers=4 --shuffle --repeat-each=3`. Which tests fail, and what do they share?
3. `tests/applications.spec.ts`: fix it with data per test.
4. `tests/settings.spec.ts` loses a race only now and then. Make it show: `npx playwright test settings --workers=4 --repeat-each=10`, several times. Then put a lock on the three tests.

## Done when

`npx playwright test --workers=4 --shuffle --repeat-each=3` passes three times in a row, and you can name the time you saved.

## Stuck?

<details>
<summary>Hint 1 · the applications fail with 409</summary>

409 means "already applied". Read the top of the file: who is applying? How many tests use that person at the same time?
`person('mail')` from `data.ts` gives every test its own address.

</details>

<details>
<summary>Hint 2 · why an account per worker does not save the settings tests</summary>

The tests already sign in with the `account` fixture, one recruiter per worker. With the teaching bug `global-settings` the app keeps ONE
setting for everybody. A resource that exists once cannot be duplicated: only one test at a time may use it.

</details>

<details>
<summary>Hint 3 · the lock</summary>

```ts
test.describe('notification setting', { lock: 'notification-settings' }, () => {
```
Tests with the same lock name never run at the same time, across all workers. Everything else stays parallel.

</details>

## Done early?

- `--shuffle` prints a seed. Run the same order again with `--shuffle=<seed>`.
- Our suite is small. `--repeat-each=5` stands in for a suite five times the size: measure one worker against four again.
