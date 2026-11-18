import { test, expect, inDays } from '../../../support/fixtures';

// Three situations that real data does not produce on demand, and one test without a browser.
// page.route(): https://playwright.dev/docs/network  ·  https://playwright.dev/docs/mock

test('break: when saving fails, the stage jumps back and the recruiter is told', async ({ page, applicant }) => {
    // Only the PATCH for this candidate fails. Everything else reaches the real server.
    await page.route(`**/api/applications/${applicant.id}`, async (route) => {
        if (route.request().method() === 'PATCH') await route.fulfill({ status: 500, json: { error: 'internal' } });
        else await route.fallback();
    });
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const row = page.getByRole('row', { name: applicant.name });

    await row.locator('.hg-select__trigger').click();
    await page.locator('.hg-select__panel').getByText('Interview', { exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('The stage could not be saved. The change was undone.');
    await expect(row.locator('.hg-select__value')).toHaveText('New');
});

test('patch: the real answer with one change shows the paging of a large customer', async ({ page }) => {
    // route.fetch() gets the real response. The test changes two numbers and passes the rest on.
    // https://playwright.dev/docs/mock#modify-api-responses
    await page.route('**/api/candidates?*', async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        await route.fulfill({ response, json: { ...body, total: 1234, pages: 124 } });
    });

    await page.goto('/recruiter/candidates');

    await expect(page.getByRole('status')).toHaveText('1234 candidates');
    await expect(page.getByText('Page 1 of 124')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
});

test('spy: typing a name sends one search, not one per key', async ({ page, applicant }) => {
    const searches: string[] = [];
    page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.pathname === '/api/candidates' && url.searchParams.has('q')) searches.push(url.searchParams.get('q')!);
    });
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

    const withoutTitle = await request.post('/api/jobs', { data: { ...valid, title: '' } });
    expect(withoutTitle.status()).toBe(422);
    expect(await withoutTitle.json()).toEqual({ errors: { title: 'Please enter a title.' } });

    const sameTitle = await request.post('/api/jobs', { data: { ...valid, title: job.title } });
    expect(sameTitle.status()).toBe(409);
    expect(await sameTitle.json()).toMatchObject({ error: 'duplicate-title' });
});
