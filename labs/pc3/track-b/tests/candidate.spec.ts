import { expect, test } from '@playwright/test';

// Three tests from the candidate side of Hire Ground. All three were green
// before this morning's deployment.

const cv = {
    name: 'lebenslauf.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'),
};

test('the job list can be searched', async ({ page }) => {
    await page.goto('/jobs');
    await page.locator('#search').fill('QA');
    await page.locator('button.search').click();

    await expect(page.locator('.job')).toHaveCount(3);
    await expect(page.locator('.job').first()).toContainText('Senior QA Engineer');
});

test('one person can apply for two jobs', async ({ request }) => {
    const email = `erika-${crypto.randomUUID().slice(0, 8)}@example.com`;

    for (const jobId of ['1', '3']) {
        const response = await request.post('/api/applications', {
            multipart: { jobId, firstName: 'Erika', lastName: 'Musterfrau', email, consent: 'true', cv },
        });
        expect(response.status(), `application for job ${jobId}`).toBe(201);
    }
});

test('an applicant can send an application', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer');
    await page.getByRole('link', { name: 'Apply' }).click();
    await page.getByLabel('First name').fill('Erika');
    await page.getByLabel('Last name').fill('Musterfrau');
    await page.getByLabel('E-mail address').fill(`erika-${crypto.randomUUID().slice(0, 8)}@example.com`);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();
    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
    await expect(page.getByTestId('application-reference')).toHaveText(/^HG-\d{6}$/);
});
