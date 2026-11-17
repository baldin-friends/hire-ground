# Steps 10 to 12 · Build for reuse

The suite signs in through the UI in every test, and every run leaves test candidates on the board. Both stop here.

**Time** three steps of 15 to 20 minutes · alone. Open the hints when you need them.

## Start here

`labs/07-reuse`. Four files have TODOs: `playwright.config.ts`, `tests/auth.setup.ts`, `pages/job-page.ts`, `tests/fixtures.ts`, and then the tests in `tests/recruiter.spec.ts`.
The recruiter login is on the sign-in page: http://localhost:3000/login

## Steps

**Step 10 · Log in once**

1. `tests/auth.setup.ts` signs in and saves the `storageState`; add the `setup` project to the config.
2. Run `npx playwright test --project=setup`.

**Step 11 · A page object, and two people in one test**

3. `pages/job-page.ts`: a `JobPage` page object with `open()` and `apply()`.
4. `tests/recruiter.spec.ts`, the last test: the candidate applies in one browser context, the recruiter sees it in another.
5. Run `npx playwright test -g "applicant applies"`.

**Step 12 · An applicant on demand**

6. `tests/fixtures.ts`: an `applicant` fixture, created through the API, withdrawn after the test.
7. `tests/recruiter.spec.ts`, the first test: the recruiter finds the fixture's applicant in the column "New".
8. Run `npx playwright test` twice, then look at the board: it is clean.

## Done when

No test logs in through the UI except `auth.setup.ts`, and nothing is left behind on the board.

## Stuck?

<details>
<summary>Hint 1 · "Error reading storage state"</summary>

The file `playwright/.auth/recruiter.json` does not exist yet. The setup project writes it: finish step 1, and give the engine projects `dependencies: ['setup']` so that setup runs first.

</details>

<details>
<summary>Hint 2 · the page object</summary>

The lines are the ones from Lab 4, with `this.page` instead of `page`:
```ts
async open(slug: string) {
    await this.page.goto(`/jobs/${slug}`);
}
```
`apply()` clicks `this.applyLink`, fills the fields, attaches the CV, ticks the consent box and clicks `this.submit`. No `expect` in here: assertions stay in the test.

</details>

<details>
<summary>Hint 3 · the fixture</summary>

```ts
applicant: async ({ request }, use) => {
    const p = person('fixture');
    const res = await request.post('/api/applications', { multipart: { jobId: '4', ...p, consent: 'true', cv } });
    const { id, withdrawToken } = await res.json();
    await use({ id, ...p });                      // the test runs here
    await request.delete(`/api/applications/${id}`, { headers: { 'x-withdraw-token': withdrawToken } });
},
```

</details>

<details>
<summary>Hint 4 · finding the card</summary>

A column is a `region` with the column's name, a card is an `article` named after the person:
`page.getByRole('region', { name: 'New' }).getByRole('article', { name: `${applicant.firstName} ${applicant.lastName}` })`

</details>

## Done early?

A worker-scoped fixture `account` that gives every worker its own recruiter:
`recruiter-${workerInfo.parallelIndex + 1}@hireground.test` (accounts 1 to 8 exist, same password). You need it tomorrow.
