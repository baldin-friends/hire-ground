import { expect, test } from '@playwright/test';

// Steps 8 and 9 · one spec for three apps. The baseURL comes from the project,
// so page.goto('/') opens the React, the Angular or the Vue app.

test('the career page lists the open positions', async ({ page }) => {
    await page.goto('/');
    // TODO: expect the heading "Open positions" to be visible
    throw new Error('TODO: write the steps above, then delete this line');
});

test('the Apply link opens the form', async ({ page }) => {
    await page.goto('/');
    // TODO: click the link "Apply" of the job "Senior QA Engineer". Three links have that name.
    // TODO: expect the heading "Apply: Senior QA Engineer" to be visible
    throw new Error('TODO: write the steps above, then delete this line');
});

// Done early? The third test is in the README under "Done early?".
