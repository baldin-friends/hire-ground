import { expect, test } from '@playwright/test';
import { cv, person } from './data';

// Step 4 · steps make the report and the trace readable.
test('apply with a CV', async ({ page }) => {
    const p = person();

    await test.step('open the posting', async () => {
        await page.goto('/jobs/senior-qa-engineer');
        await page.getByRole('link', { name: 'Apply' }).click();
    });

    await test.step('fill the form', async () => {
        await page.getByLabel('First name').fill(p.firstName);
        await page.getByLabel('Last name').fill(p.lastName);
        await page.getByLabel('Email').fill(p.email);
        await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
        await page.getByRole('checkbox', { name: /stores my data/ }).check();
    }, { box: true }); // boxed: a failure inside is reported at this step, not at the line inside

    await test.step('submit and confirm', async () => {
        await page.getByRole('button', { name: 'Submit application' }).click();
        await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
    });
});
