import { expect, test } from '@playwright/test';

// One spec, three projects. The baseURL comes from the project,
// so no line in this file knows which framework it tests.

test('the career page lists the open positions', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Open positions' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Apply' })).toHaveCount(3);
});

test('the Apply link opens the form', async ({ page }) => {
    await page.goto('/');

    // Three links are called "Apply": take the one in the list item of the job.
    const job = page.getByRole('listitem').filter({ hasText: 'Senior QA Engineer' });
    await job.getByRole('link', { name: 'Apply' }).click();

    await expect(page).toHaveURL('/apply/senior-qa-engineer');
    await expect(page.getByRole('heading', { name: 'Apply: Senior QA Engineer' })).toBeVisible();
});

// The form and the custom dropdown: a portal in React, a CDK overlay in Angular, a teleport in Vue.
test('send an application with a working model', async ({ page }) => {
    await page.goto('/apply/senior-qa-engineer');

    await page.getByLabel('Email').fill('erika.muster@example.com');

    // The options render at the end of <body>, outside the form: a React portal,
    // a CDK overlay, a Vue teleport. A role locator on the page finds all three.
    const model = page.getByRole('combobox', { name: 'Working model' });
    await model.click();
    await page.getByRole('option', { name: 'Hybrid' }).click();
    await expect(model).toHaveText('Hybrid');

    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
    await expect(page.getByText('We will write to erika.muster@example.com')).toContainText('Working model: Hybrid.');
});
