# Case 7 · Green alone, red together

A suite that passes with one worker and fails with four. Nothing is wrong with the application.
The tests share things: a record, a number, an account, and the order they were written in.

**Time** 75 minutes · together, on one screen

## The problem

Playwright runs tests in parallel: several worker processes, each with its own browser. The workers share nothing
in memory. They do share the application and its database. A test that changes data another test reads is fine
as long as the two never run at the same time and always run in the same order. Parallel runs, shards and
`--shuffle` end both assumptions.

softgarden today: 670 Selenide tests on a fixed dataset in a shared environment. Run in parallel, every test in
this folder is a small copy of that situation.

## Warm-up · what a worker is

`tests/1-warm-up.spec.ts`: five tests that read the career page. Each one prints the worker process that runs it.

```bash
cd labs/11-parallel
npx playwright test 1-warm-up --workers=1     # one process runs all five: "test number 1 … 5 in this process"
npx playwright test 1-warm-up --workers=4     # four processes, each starts counting at 1
```

The variable `testsInThisProcess` lives in the test file. Every worker loads the file itself and has its own copy.
What the workers have in common is outside of them: the application and the database.

## The challenge

`tests/2-challenge.spec.ts`: eight tests for the recruiter workspace. `tests/auth.setup.ts` puts the database back
to its seed and signs in as Rita before every run.

```bash
npx playwright test 2-challenge --workers=1               # green: 8 tests and the setup
npx playwright test 2-challenge --workers=4               # 2 failed
npx playwright test 2-challenge --workers=1 --shuffle=7   # 3 failed, the same three every time
npx playwright test 2-challenge --workers=4 --repeat-each=3   # about 10 failed
```

In UI mode: run `npx playwright test --workers=1` in a terminal once (it signs in and saves the session), then `--ui`.

### Done when

```bash
npx playwright test --workers=4 --shuffle --repeat-each=3
```

passes three times in a row, and `tests/auth.setup.ts` with its reset is deleted.

### Steps

1. Run the first three commands above. For every failing test, read the error: which value did it expect, which one did it get?
2. Take the eight tests one by one: what does this test need that another test made, changed or counted? Four answers come up: the order, a number, a record, an account.
3. Order and records: import `test` and `expect` from `../fixtures` and give every test its own candidate with the `applicant` fixture from case 4. Max and Paula leave the file.
4. Numbers: no assertion on a count that other tests change. A search for the test's own candidate has exactly one result.
5. Account: add one recruiter account per worker to `fixtures.ts` (`recruiter-1` … `recruiter-8@hireground.test`), and let each settings test set its starting point through the API.
6. Delete `tests/auth.setup.ts` and the `setup` project in `playwright.config.ts`. Run the command under "Done when".

## Hints

<details>
<summary>Hint 1 · what the failing tests share</summary>

| Test | Fails with | Because |
|---|---|---|
| lists every candidate | 37 instead of 36 | "shows a new application" added Paula first, or at the same time: a count of everything |
| the filter shows the shortlisted candidates only | 12 instead of 13 | it counts Max, and "put on the shortlist" has not run yet: order |
| the new candidate moves to Screening | no row "Paula Parallel" | Paula comes from another test: order |
| shows a new application (second repeat) | 409 instead of 201 | Paula's e-mail address is fixed and has already applied: a record |
| put on / taken off the shortlist | `aria-pressed` is the opposite | both click the star of Max: a record |
| is on by default | not checked | "can be switched off" changed Rita's setting: an account |

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

<details>
<summary>Hint 3 · one account per worker</summary>

Three fixtures in `fixtures.ts`. `parallelIndex` is 0 for the first worker, 1 for the second, and a worker that restarts keeps its number.

```ts
account: [
    async ({}, use, workerInfo) => {
        const n = workerInfo.parallelIndex + 1;
        await use({ email: `recruiter-${n}@hireground.test`, name: `Recruiter ${n}` });
    },
    { scope: 'worker' },
],
accountState: [
    async ({ playwright, account }, use, workerInfo) => {
        const api = await playwright.request.newContext({ baseURL: workerInfo.project.use.baseURL });
        await api.post('/api/auth/login', { data: { email: account.email, password: 'hire-ground' } });
        const state = await api.storageState();
        await api.dispose();
        await use(state);
    },
    { scope: 'worker' },
],
storageState: ({ accountState }, use) => use(accountState),
```

Add `account` and `accountState` to the type `WorkerFixtures`. The config no longer needs `storageState` or the `setup` project.

</details>

<details>
<summary>Hint 4 · "on by default" without a reset</summary>

"On by default" is true for an account nobody has touched. Without a reset there is no such account, so the test
says where it starts: `await request.put('/api/settings', { data: { notifyOnNewApplication: true } });`
Then it opens the page and asserts.

</details>

<details>
<summary>Hint 5 · when the account cannot be duplicated</summary>

Some things exist once: a tenant setting, a licence, one mailbox. A test lock keeps the tests that use it apart,
and everything else stays parallel:

```ts
test.describe('notification setting', { lock: 'rita-settings' }, () => { … });
```

Tests with the same lock name never run at the same time, across files and workers. Every test that reads or writes
the resource carries the lock. `test.describe.configure({ mode: 'serial' })` is the last resort: it also stops the
rest of the group after the first failure.

</details>

## Done early?

- A retry can hide all of this. In the starter: `npx playwright test -g "put on the shortlist" --repeat-each=2 --retries=1 --workers=1`
  reports "1 flaky" and exits with 0. Open the trace of the failed attempt: what did the retry do to the star?
  Add `--fail-on-flaky-tests` and look at the exit code (`echo $?`).
- `--shuffle` prints its seed. Run the same order again with `--shuffle=<seed>`.
- Time `npx playwright test --repeat-each=5 --workers=1` against `--workers=4` on the repaired suite.

## Read more

- Parallelism, workers, `fullyParallel`, serial mode: https://playwright.dev/docs/test-parallel
- Test locks: https://playwright.dev/docs/test-parallel#test-locks
- Retries and flaky tests: https://playwright.dev/docs/test-retries
- One account per parallel worker: https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker
- Worker-scoped fixtures: https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures
- Isolation as a rule: https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible
- All command-line options (`--workers`, `--repeat-each`, `--shuffle`, `--fail-on-flaky-tests`): https://playwright.dev/docs/test-cli#all-options
