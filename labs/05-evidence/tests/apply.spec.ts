import { expect, test } from '@playwright/test';
import { cv, person } from './data';

// Steps 2 to 4 · this test is green. Break it three ways (README.md)
// and find each cause in the trace alone.
test('apply with a CV', async ({ page }) => {
    const p = person();

    await page.goto('/jobs/senior-qa-engineer');
    await page.getByRole('link', { name: 'Apply' }).click();

    await page.getByLabel('First name').fill(p.firstName);
    await page.getByLabel('Last name').fill(p.lastName);
    await page.getByLabel('Email').fill(p.email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();

    await page.getByRole('button', { name: 'Submit application' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
});
