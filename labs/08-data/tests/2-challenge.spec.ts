import { test, expect } from '@playwright/test';

// These two tests were written against the seed data.
//   npm run reset                         (repository root: a fresh database)
//   npx playwright test 2-challenge       green
//   npx playwright test 2-challenge       run it again
//
// The steps are in README.md. The fixtures for step 2 are in ../fixtures.ts.

test('a candidate goes from New to Hired', async ({ page }) => {
    await page.goto('/recruiter/candidates');
    await expect(page.getByRole('status')).toHaveText('36 candidates');

    const row = page.getByRole('row', { name: 'Hannah Becker' });
    const stage = row.locator('.hg-select__value');
    await expect(stage).toHaveText('New');

    for (const next of ['Screening', 'Interview', 'Offer', 'Hired']) {
        await row.locator('.hg-select__trigger').click();
        await page.locator('.hg-select__panel').getByText(next, { exact: true }).click();
        await expect(page.getByText(`Hannah Becker moved to ${next}.`)).toBeVisible();
    }

    await expect(stage).toHaveText('Hired');
});

test('a new application is in the candidates table', async ({ page, request }) => {
    const response = await request.post('/api/applications', {
        multipart: {
            jobId: '4',
            firstName: 'Max',
            lastName: 'Power',
            email: 'max.power@example.com',
            consent: 'true',
            cv: { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') },
        },
    });
    expect(response.status(), await response.text()).toBe(201);

    await page.goto('/recruiter/candidates');

    await expect(page.getByRole('status')).toHaveText('37 candidates');
    await expect(page.getByRole('row', { name: 'Max Power' })).toBeVisible();
});

// Step 5: no API makes an application older. Use the `db` fixture.
test.fixme('a candidate who has waited for more than 14 days is flagged', async () => {
    // UPDATE applications SET created_at = ? WHERE id = ?
    // then: the row shows "Waiting 16 days"
});

// Step 6: delete through the API, then ask the database.
test.fixme('a withdrawn application is gone from the database', async () => {});

// Step 7: data that was there before the test. Ask the API what is there, then compare the table with it.
test.fixme('the table shows what the API returns', async () => {
    // GET /api/candidates?q=mustermann&sort=name&dir=asc   answers { items, total }
});
