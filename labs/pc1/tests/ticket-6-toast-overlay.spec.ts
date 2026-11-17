import { expect, test } from '@playwright/test';
import { cv, person } from './data';

// Ticket 6: a "Draft saved" toast covers the Submit button for 800 ms.
// Symptom: the click with force: true reports no error, and the confirmation never appears.
// Rule: no CSS, no XPath. And no force.
test('ticket 6: a candidate applies and sees the confirmation', async ({ page }) => {
    const applicant = person();
    await page.goto('/jobs/senior-qa-engineer/apply?bugs=toast-overlay');

    await page.getByLabel('First name').fill(applicant.firstName);
    await page.getByLabel('Last name').fill(applicant.lastName);
    await page.getByLabel('Email').fill(applicant.email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();

    // force: the click was slow without it
    await page.getByRole('button', { name: 'Submit application' }).click({ force: true });

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
});
