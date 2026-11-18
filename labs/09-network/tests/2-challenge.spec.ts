import { test, expect, inDays } from '../../../support/fixtures';

// Three situations that real data does not produce on demand, and one test without a browser.
// Each test is complete except for its network part: run the file, then work through TODO 1 to 4.
// page.route(): https://playwright.dev/docs/network  ·  https://playwright.dev/docs/mock

test('break: when saving fails, the stage jumps back and the recruiter is told', async ({ page, applicant }) => {
    // TODO 1: how do you make saving fail? Real data cannot do it. page.route() can:
    //         answer the PATCH for this candidate with status 500, and let every other request pass (route.fallback()).
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const row = page.getByRole('row', { name: applicant.name });

    await row.locator('.hg-select__trigger').click();
    await page.locator('.hg-select__panel').getByText('Interview', { exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('The stage could not be saved. The change was undone.');
    await expect(row.locator('.hg-select__value')).toHaveText('New');
});

test('patch: the real answer with one change shows the paging of a large customer', async ({ page }) => {
    // TODO 2: nobody creates 1234 candidates for one test. Take the real answer of /api/candidates
    //         (route.fetch()), change total and pages, and pass it on (route.fulfill({ response, json })).
    //         https://playwright.dev/docs/mock#modify-api-responses

    await page.goto('/recruiter/candidates');

    await expect(page.getByRole('status')).toHaveText('1234 candidates');
    await expect(page.getByText('Page 1 of 124')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
});

test('spy: typing a name sends one search, not one per key', async ({ page, applicant }) => {
    const searches: string[] = [];
    // TODO 3: collect the q parameter of every request to /api/candidates:  page.on('request', (request) => …)
    await page.goto('/recruiter/candidates');

    // pressSequentially types key by key, the way a person does: https://playwright.dev/docs/input#type-characters
    await page.getByLabel('Search').pressSequentially(applicant.lastName, { delay: 30 });
    // "1 candidate" is true only after the search has answered. The row alone proves nothing:
    // a new candidate is on page 1 before the search as well.
    await expect(page.getByRole('status')).toHaveText('1 candidate');

    expect(searches).toEqual([applicant.lastName]);
});

test('API test: a job needs a title, and a title can be used once', async ({ request, job }) => {
    // No browser in this test: request talks to the API directly, with the recruiter's session.
    // https://playwright.dev/docs/api-testing
    const valid = { team: 'People', location: 'Dresden', salaryMin: 50_000, salaryMax: 60_000, deadline: inDays(30), description: 'Text.' };

    // TODO 4: POST /api/jobs without a title answers 422 and says why.
    //         POST /api/jobs with job.title (the fixture's job has it already) answers 409.
    throw new Error('TODO 4');
});
