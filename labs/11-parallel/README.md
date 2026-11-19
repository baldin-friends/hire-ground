# Case 7 · Green alone, red together

Four tests that pass with one worker and fail with four. Nothing is wrong with the application: the tests share data.

**Time** 55 minutes · together, on one screen

## The problem

Playwright makes a run faster by starting several worker processes, each with its own browser. The workers share
nothing in memory. They do share the application and its database. A test that uses what another test left behind
works as long as the tests run one after another, in the order they were written. With four workers they do not.

## Warm-up · what a worker is

`tests/1-warm-up.spec.ts`: five tests that read the career page. Each one prints the worker process that runs it.

```bash
cd labs/11-parallel
npx playwright test 1-warm-up --workers=1     # one process runs all five: "test number 1 … 5 in this process"
npx playwright test 1-warm-up --workers=4     # four processes, each starts counting at 1
```

The variable `testsInThisProcess` lives in the test file. Every worker loads the file itself and has its own copy.

## The challenge · 30 minutes, together

`tests/2-challenge.spec.ts`: four tests for the recruiter workspace. `tests/auth.setup.ts` puts the database back
to its seed and signs in as Rita before every run.

**Done when** this is green three times in a row, and the reset is deleted:

```bash
npx playwright test 2-challenge --workers=4 --repeat-each=3
```

1. Run it with `--workers=1`: green, 5 passed (four tests and the sign-in). Run it with `--workers=4`: red.
   "Taken off the shortlist" fails. On a slower machine "moves to Screening" fails too.
2. Read each failure, and each test: what does this test need from another test? Run it with
   `--workers=4 --repeat-each=3` as well: six failures, and two new reasons.
3. Every test gets its own candidate. Import `test` and `expect` from `'../fixtures'` and ask for the `applicant`
   fixture of case 4. Paula and Max leave the file. "Taken off the shortlist" puts its own candidate on the
   shortlist first, through the API. Now `--workers=1` is green, and `--workers=4` has one red test left.
4. That test counts all candidates: "40 candidates" instead of 37. Search for its own candidate instead:
   "1 candidate". Now `--workers=4 --repeat-each=3` is green.
5. Delete the three lines about the reset in `tests/auth.setup.ts`. Run the command under "Done when" three times:
   13 passed each time.

Every step is at the end of `tests/2-challenge.spec.ts` as a comment, ready to copy.

In UI mode: run `npx playwright test --workers=1` in a terminal once (it signs in and saves the session), then `--ui`.

## Hints

<details>
<summary>Hint 1 · what the failing tests share</summary>

| Test | Fails with | Because |
|---|---|---|
| taken off the shortlist | `aria-pressed` is "true" | it needs the star that "put on the shortlist" sets, and both click the star of Max: the order, and a record |
| moves to Screening | no row "Paula Parallel" | Paula comes from the test before it: the order |
| moves to Screening (repeated) | no message | Paula already is in Screening: a record |
| a new application (repeated) | 409 instead of 201 | Paula's e-mail address has already applied: a record |
| a new application (after step 3) | 40 instead of 37 | it counts the candidates of the other tests: a number |

</details>

<details>
<summary>Hint 2 · a candidate per test</summary>

```ts
import { test, expect } from '../fixtures';

test('a candidate can be put on the shortlist', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const button = star(page.getByRole('row', { name: applicant.name }));
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
});
```

A test that needs a shortlisted candidate says so through the API, before it opens the page:
`await request.patch(`/api/applications/${applicant.id}`, { data: { shortlisted: true } });`

</details>

## Done early?

- **A retry can hide all of this.** In the starter:
  `npx playwright test -g "put on the shortlist" --repeat-each=2 --retries=1 --workers=1` reports "1 flaky" and exits
  with 0. Add `--fail-on-flaky-tests` and look at the exit code (`echo $?`).
- **Another order.** In the starter: `npx playwright test 2-challenge --workers=1 --shuffle=1` runs the four tests in
  a random order: three fail, the same three every time (it takes 40 seconds: each one waits for its timeout).
  `--shuffle` without a number picks an order and prints its seed.
- **One account per worker.** All tests here are Rita. A setting of the user would collide the same way, and a user
  cannot be created per test. In the repaired suite change the import to `'../../../support/fixtures.per-worker'`
  and run it with four workers: each worker signs in as its own recruiter, and the sign-in project is not needed.
  Case 8 runs this way.

## Read more

- Parallelism, workers, `fullyParallel`: https://playwright.dev/docs/test-parallel
- Retries and flaky tests: https://playwright.dev/docs/test-retries
- One account per parallel worker: https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker
- Isolation as a rule: https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible
- All command-line options (`--workers`, `--repeat-each`, `--shuffle`, `--fail-on-flaky-tests`): https://playwright.dev/docs/test-cli#all-options
