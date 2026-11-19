# Case 4 · Test data when there is no reset button

**The problem.** Until now every test began with `POST /api/test/reset`. A staging system has no such button: the
database is shared, it keeps its data, and other people and other tests write to it at the same time.

Hire Ground keeps its data in a real database file (`app/data/hire-ground.db`, SQLite). It survives a restart.

## Before you start

```bash
npm run reset                # repository root: the seed data, once, so that we all start from the same state
cd labs/08-data
npx playwright test          # signs in, then runs the tests
```

## Four ways to get data, and when each is right

| Way | Use it for | Price |
|---|---|---|
| through the UI | the flow the test is about | slow; fails for reasons that are not the test's subject |
| through the API | everything else the test needs: a job, a candidate | the API must exist; it obeys the business rules, which is good |
| straight into the database | what no API can do: an application that is 16 days old | skips validation; breaks when the schema changes |
| what is already there | read-only checks on a system you cannot write to | ask what is there first; never assume it |

## Warm-up

`tests/1-warm-up.spec.ts` uses the fixture `job` from `fixtures.ts`: a job created through the API before the test and
deleted after it. Run the file twice. Then read the fixture: everything before `await use(job)` is setup, everything
after it is teardown, and teardown runs after a failed test as well.

## The challenge · 45 minutes, together

`tests/2-challenge.spec.ts`: two tests written against the seed data.

**Done when** `npx playwright test --repeat-each=5 --workers=4` is green and the candidates table has no leftovers.

1. Run `npx playwright test 2-challenge` twice. First green, then red. Read both errors: which data did the first run
   leave behind? (Red at the first run already? `npm run reset` once, then run it twice.)
2. `npm run reset` would make it green again. Instead, give each test its own data: write the fixture `applicant` in
   `fixtures.ts` (the TODO). In the test file, import `test` and `expect` from `'../fixtures'`, or the tests do not
   know `applicant`. Use it in both tests, in place of Hannah Becker and Max Power.
   Run it: test 1 is red in a new way. "36 candidates" is 37 now, because of its own applicant.
3. Remove the assertions about other people's data ("36 candidates", "37 candidates"). Find your candidate by a name
   nobody else has: open the table with `?q=${applicant.lastName}`. Run it twice: green twice.
4. Delete `workers: 1` from `playwright.config.ts`. Prove it: `npx playwright test --repeat-each=5 --workers=4`.
5. The first `test.fixme`: make it a `test` that asks for `page`, `applicant` and `db`. A candidate who has waited
   more than 14 days gets the label "Waiting 16 days". No API makes an application older. Use the fixture `db`.
6. The second `test.fixme`: withdraw an application through the API, then ask the database whether the row is gone.
7. The third: data that was there before the test. Ask the API what the search for "mustermann" returns, then
   compare the table with it.

Every step is at the end of `tests/2-challenge.spec.ts` as a comment, ready to copy.

## Hints

<details>
<summary>Hint 1 · why the second run fails</summary>

Test 1 expects Hannah Becker in the stage "New"; the first run left her in "Hired", and the count is 37 because of test 2.
Test 2 applies with `max.power@example.com`; the application of the first run still exists, so the API answers 409.

</details>

<details>
<summary>Hint 2 · the applicant fixture</summary>

```ts
applicant: async ({ request, job }, use) => {
    const id = randomUUID().slice(0, 8);
    const person = { firstName: 'Ada', lastName: `Test-${id}`, email: `ada.test-${id}@example.com` };
    const response = await request.post('/api/applications', {
        multipart: { jobId: job.id, ...person, consent: 'true', cv: CV },
    });
    expect(response.status(), `POST /api/applications: ${await response.text()}`).toBe(201);
    const created = await response.json();

    await use({ id: created.id, reference: created.reference, ...person, name: `${person.firstName} ${person.lastName}` });

    await request.delete(`/api/applications/${created.id}`);
},
```

It asks for `job`. Playwright sets up `job` first and tears it down last, so the application is gone before the job
is deleted. The API refuses to delete a job that has applications.

</details>

<details>
<summary>Hint 3 · finding my candidate</summary>

```ts
await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
const row = page.getByRole('row', { name: applicant.name });
```

</details>

<details>
<summary>Hint 4 · the database</summary>

```ts
test('…', async ({ page, applicant, db }) => {
    const sixteenDaysAgo = new Date(Date.now() - 16 * 86_400_000).toISOString();
    db.prepare('UPDATE applications SET created_at = ? WHERE id = ?').run(sixteenDaysAgo, Number(applicant.id));
```

`db.ts` opens the SQLite file with `node:sqlite`. With PostgreSQL the same fixture holds a `pg` client and reads the
connection string from an environment variable.

</details>

## Rules for a shared system

1. A test creates what it needs and removes it afterwards, in a fixture.
2. Names are unique per test run, so two runs and two workers never meet.
3. A test asserts on its own data. How many other rows exist is not its business.
4. Existing data is read through the API first, never assumed.
5. Leftovers happen (a crash skips teardown). A nightly job that deletes everything named `Test-…` is cheap.

## Read more

- Fixtures: https://playwright.dev/docs/test-fixtures
- Authentication and `storageState`: https://playwright.dev/docs/auth
- API requests in tests: https://playwright.dev/docs/api-testing
- Global setup and teardown, project dependencies: https://playwright.dev/docs/test-global-setup-teardown
- Parallelism and isolation: https://playwright.dev/docs/test-parallel
- Parameterised tests and data files: https://playwright.dev/docs/test-parameterize
