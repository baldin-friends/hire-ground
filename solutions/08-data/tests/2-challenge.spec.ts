import { test, expect } from '../fixtures';

// These tests bring their own data and take it away again: run them as often as you like.
//   npm run reset                         (repository root: a fresh database)
//   npx playwright test 2-challenge       green
//   npx playwright test 2-challenge       run it again
//
// The steps are in README.md. The fixtures for step 2 are in ../fixtures.ts.

test('a candidate goes from New to Hired', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    const row = page.getByRole('row', { name: applicant.name });
    const stage = row.locator('.hg-select__value');
    await expect(stage).toHaveText('New');

    for (const next of ['Screening', 'Interview', 'Offer', 'Hired']) {
        await row.locator('.hg-select__trigger').click();
        await page.locator('.hg-select__panel').getByText(next, { exact: true }).click();
        await expect(page.getByText(`${applicant.name} moved to ${next}.`)).toBeVisible();
    }

    await expect(stage).toHaveText('Hired');
});

test('a new application is in the candidates table', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
});

// Step 5: no API makes an application older. Use the `db` fixture.
test('a candidate who has waited for more than 14 days is flagged', async ({ page, applicant, db }) => {
    const sixteenDaysAgo = new Date(Date.now() - 16 * 86_400_000).toISOString();
    db.prepare('UPDATE applications SET created_at = ? WHERE id = ?').run(sixteenDaysAgo, Number(applicant.id));

    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('row', { name: applicant.name }).getByText('Waiting 16 days')).toBeVisible();
});

// Step 6: delete through the API, then ask the database.
test('a withdrawn application is gone from the database', async ({ request, applicant, db }) => {
    const response = await request.delete(`/api/applications/${applicant.id}`);
    expect(response.status()).toBe(204);

    const { n } = db.prepare('SELECT count(*) AS n FROM applications WHERE email = ?').get(applicant.email) as { n: number };
    expect(n).toBe(0);
});

// Step 7: data that was there before the test. Ask the API what is there, then compare the table with it.
test('the table shows what the API returns', async ({ page, request }) => {
    const response = await request.get('/api/candidates', { params: { q: 'mustermann', sort: 'name', dir: 'asc' } });
    const { items, total } = await response.json();
    expect(total, 'this test needs at least one match').toBeGreaterThan(0);

    await page.goto('/recruiter/candidates?q=mustermann&sort=name&dir=asc');

    await expect(page.getByRole('status')).toHaveText(`${total} candidate${total === 1 ? '' : 's'}`);
    const names = items.map((a: { firstName: string; lastName: string }) => `${a.firstName} ${a.lastName}`);
    // name: /\S/ means "a link with a name". Each row also has a download link that has none.
    await expect(page.locator('tbody').getByRole('link', { name: /\S/ })).toHaveText(names);
});
