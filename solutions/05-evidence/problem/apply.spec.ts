import { expect, test } from '@playwright/test';

const cv = {
    name: 'lebenslauf.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'),
};

test('a candidate applies for the Senior QA Engineer job', async ({ page }) => {
    const id = crypto.randomUUID().slice(0, 8);

    await page.goto('/jobs/senior-qa-engineer/apply?bugs=toast-overlay');
    await page.getByLabel('First name').fill('Erika');
    await page.getByLabel('Last name').fill(`Muster-${id}`);
    await page.getByLabel('Email').fill(`erika-${id}@example.com`);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();
    await page.getByRole('button', { name: 'Submit application' }).click({ force: true });

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
});
