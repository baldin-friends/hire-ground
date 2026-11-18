import { test, expect } from '../fixtures';

// Every test here brings its own data and takes it away again.
// Prove it: npx playwright test --repeat-each=5 --workers=4

test('a candidate goes from New to Hired', async ({ page, applicant }) => {
    // Find my candidate by a name nobody else has. The table has pages; a search has none.
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

test('a new application is in the candidates table', async ({ page, applicant, job }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    // No "37 candidates": how many others exist is not this test's business.
    const row = page.getByRole('row', { name: applicant.name });
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: job.title })).toBeVisible();
});

test('a candidate who has waited for more than 14 days is flagged', async ({ page, applicant, db }) => {
    // No API makes an application older. The database does.
    const sixteenDaysAgo = new Date(Date.now() - 16 * 86_400_000).toISOString();
    db.prepare('UPDATE applications SET created_at = ? WHERE id = ?').run(sixteenDaysAgo, Number(applicant.id));

    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('row', { name: applicant.name }).getByText('Waiting 16 days')).toBeVisible();
});

test('a withdrawn application is gone from the database', async ({ request, applicant, db }) => {
    const response = await request.delete(`/api/applications/${applicant.id}`);
    expect(response.status()).toBe(204);

    // The UI can show that a row is no longer listed. Only the database can show that it is gone.
    const { n } = db.prepare('SELECT count(*) AS n FROM applications WHERE email = ?').get(applicant.email) as { n: number };
    expect(n).toBe(0);
});

test('the table shows what the API returns', async ({ page, request }) => {
    // Data that was there before the test: do not assume it, ask for it.
    const response = await request.get('/api/candidates', { params: { q: 'mustermann', sort: 'name', dir: 'asc' } });
    const { items, total } = await response.json();
    expect(total, 'this test needs at least one match').toBeGreaterThan(0);

    await page.goto('/recruiter/candidates?q=mustermann&sort=name&dir=asc');

    await expect(page.getByRole('status')).toHaveText(`${total} candidate${total === 1 ? '' : 's'}`);
    const names = items.map((a: { firstName: string; lastName: string }) => `${a.firstName} ${a.lastName}`);
    // name: /\S/ means "a link with a name". Each row also has a download link that has none.
    await expect(page.locator('tbody').getByRole('link', { name: /\S/ })).toHaveText(names);
});
