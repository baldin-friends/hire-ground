# Case 7 · Parallel tests on one database

One test that passes alone and fails when several workers run it at the same time. Then the reason, and the repair.

**Time** 25 minutes

## Run it

Both tests are in one folder: `solutions/11-parallel`. This folder holds only this sheet.

```bash
cd solutions/11-parallel
npx playwright test 1-flaky --workers=1 --repeat-each=3     # 7 passed: three times in Chromium, three times in Firefox, and the sign-in
npx playwright test 1-flaky --workers=4 --repeat-each=3     # 4 to 6 failed: Expected "37 candidates", Received "38 candidates" (or 39, 40)
npx playwright test 1-flaky --workers=4 --repeat-each=3     # again: another number of failures
npx playwright test 1-flaky --workers=4 --repeat-each=3 --retries=2    # some tests are "flaky", some still fail
```

Run it in a terminal. UI mode starts with the first project only, so Firefox would be missing.

## Read it

`tests/1-flaky.spec.ts` has one test and two marked lines:

1. `request.post('/api/test/reset')` before every test: it puts the whole database back to the seed data.
2. `toHaveText('37 candidates')`: it counts all candidates, 36 from the seed data and the one of this test.

With one worker the runs come one after another, and each one finds 37. With four workers they overlap: a second
worker creates its candidate before the first one counts (38), or resets the database in the middle of the first
one's test. Which run fails depends on which worker is faster.

## The repair

```bash
npx playwright test 2-fixed --workers=4 --repeat-each=3     # 7 passed, every time
npx playwright test 2-fixed --workers=4 --repeat-each=10    # 21 passed
```

`tests/2-fixed.spec.ts` is the same test without the two lines: no reset, because the
fixture `applicant` removes its candidate after the test; no count of all candidates, because the test searches for
its own candidate and expects "1 candidate". `fixtures.ts`, `api.ts` and `db.ts` are the ones of Case 4.
The flaky test carries the tag `@fails-on-purpose`: the pipeline leaves it out with `--grep-invert @fails-on-purpose`.

## Checklist: flaky tests in parallel runs

1. Force it: `--workers=4 --repeat-each=5`. A test that fails here will fail in the pipeline.
2. Does the test reset or delete data that other tests use?
3. Does it count or list everything, where it means its own record?
4. Does it change a fixed record that other tests use: a seed candidate, a shared account?
5. The repair: data of its own, created and removed by a fixture.
6. Retries hide the problem. `--fail-on-flaky-tests` turns a flaky run into a failed run.

What cannot be created per test, like a user account: one per worker. `support/fixtures.per-worker.ts` shows it.

## Read more

- Parallelism and workers: https://playwright.dev/docs/test-parallel
- Retries and flaky tests: https://playwright.dev/docs/test-retries
- Isolation: https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible
- One account per worker: https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker
- Command-line options: https://playwright.dev/docs/test-cli#all-options
