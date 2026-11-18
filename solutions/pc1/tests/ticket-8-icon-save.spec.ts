import { expect, test } from '@playwright/test';

// Ticket 8: "Save job" is a bookmark icon without a name.
// Fix in the app, not here: this file is the starter, unchanged. See README.md.
// The test stays red until SaveButton.tsx gives the button its name again.
test('ticket 8: a candidate saves a job from the list', async ({ page }) => {
    await page.goto('/jobs?bugs=icon-save');
    const card = page.getByRole('article', { name: 'Senior QA Engineer' });
    const save = card.getByRole('button', { name: 'Save job' });

    await expect(save).toHaveAttribute('aria-pressed', 'false');
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
});
