import { test, expect, inDays } from '../../../support/fixtures';

// Two situations that real data does not produce on demand: a request that fails, and an answer that is rare.
// Each test is complete except for its network part: run the file, then work through TODO 1 and 2.
// page.route(): https://playwright.dev/docs/network  ·  https://playwright.dev/docs/mock

test('break: when saving fails, the stage jumps back and the recruiter is told', async ({ page, applicant }) => {
    // TODO 1: how do you make saving fail? Real data cannot do it. page.route() can:
    //         answer every request to this candidate's address, /api/applications/<id>, with status 500.
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const row = page.getByRole('row', { name: applicant.name });

    await row.locator('.hg-select__trigger').click();
    await page.locator('.hg-select__panel').getByText('Interview', { exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('The stage could not be saved. The change was undone.');
    await expect(row.locator('.hg-select__value')).toHaveText('New');
});

test('patch: the real answer with one change shows the paging of a large customer', async ({ page }) => {
    // https://playwright.dev/docs/mock#modify-api-responses
    // TODO 2: nobody creates 1234 candidates for one test. Route '**/api/candidates?*' (the URL has a query string):
    //         take the real answer (route.fetch()), change total and pages, pass it on (route.fulfill({ response, json })).

    await page.goto('/recruiter/candidates');

    await expect(page.getByRole('status')).toHaveText('1234 candidates');
    await expect(page.getByText('Page 1 of 124')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
});

// Done early? Two more tests. Remove ".fixme" from one and work through its TODO. README.md describes them.

test.fixme('spy: typing a name sends one search, not one per key', async ({ page, applicant }) => {
    const searches: string[] = [];
    // TODO 3: collect the q of every request to /api/candidates that has one (the first load has none):  page.on('request', (request) => …)
    await page.goto('/recruiter/candidates');

    // pressSequentially types key by key, the way a person does: https://playwright.dev/docs/input#type-characters
    await page.getByLabel('Search').pressSequentially(applicant.lastName, { delay: 30 });
    // "1 candidate" is true only after the search has answered. The row alone proves nothing:
    // a new candidate is on page 1 before the search as well.
    await expect(page.getByRole('status')).toHaveText('1 candidate');

    expect(searches).toEqual([applicant.lastName]);
});

test.fixme('API test: a job needs a title, and a title can be used once', async ({ request, job }) => {
    // No browser in this test: request talks to the API directly, with the recruiter's session.
    // https://playwright.dev/docs/api-testing
    const valid = { team: 'People', location: 'Dresden', salaryMin: 50_000, salaryMax: 60_000, deadline: inDays(30), description: 'Text.' };

    // TODO 4: POST /api/jobs without a title answers 422 and says why.
    //         POST /api/jobs with job.title (the fixture's job has it already) answers 409.
    throw new Error('TODO 4');
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The steps of the challenge as code, ready to copy. Try each step yourself first.
// To use a piece: copy its lines to the place named, select them, and remove the comment (Cmd+/ or Ctrl+/).
// The numbers are the steps in README.md. The finished file: solutions/09-network/tests/2-challenge.spec.ts
//
// Step 2 · break. In the first test, instead of the two lines of TODO 1 (it has to stand before page.goto):
//     // every request to this candidate's address gets a 500: the page cannot save
//     await page.route(`**/api/applications/${applicant.id}`, (route) => route.fulfill({ status: 500 }));
// Run it: the first test is green. The page showed the message and put the stage back to "New".
//
// Step 3 · patch. In the second test, instead of the two lines of TODO 2 (before page.goto).
// The pattern ends in ?* because the URL has a query string. Without it the route never matches: the real count stays.
//     await page.route('**/api/candidates?*', async (route) => {
//         const response = await route.fetch();          // the request goes to the real server
//         const body = await response.json();
//         await route.fulfill({ response, json: { ...body, total: 1234, pages: 124 } });   // the real answer, two numbers changed
//     });
// Run it: the second test is green. The rows are the real candidates. Only the count and the paging are changed.
//
// Done early · spy. Third test: remove ".fixme". Instead of the line of TODO 3, directly under  const searches:
// has('q') matters: the first load of the table is a request without q, and the list would start with null.
//     page.on('request', (request) => {
//         const url = new URL(request.url());
//         if (url.pathname === '/api/candidates' && url.searchParams.has('q')) searches.push(url.searchParams.get('q')!);
//     });
//
// Done early · API test. Fourth test: remove ".fixme". Instead of the three lines from  // TODO 4  to  throw new Error('TODO 4');
//     const withoutTitle = await request.post('/api/jobs', { data: { ...valid, title: '' } });
//     expect(withoutTitle.status()).toBe(422);
//     expect(await withoutTitle.json()).toEqual({ errors: { title: 'Please enter a title.' } });
//
//     const sameTitle = await request.post('/api/jobs', { data: { ...valid, title: job.title } });
//     expect(sameTitle.status()).toBe(409);
//     expect(await sameTitle.json()).toMatchObject({ error: 'duplicate-title' });
