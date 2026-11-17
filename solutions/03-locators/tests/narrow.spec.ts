import { expect, test } from '@playwright/test';

// Step 8 · solution.
test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
});

test('1 · inside one card', async ({ page }) => {
    const card = page.getByRole('article', { name: 'Senior QA Engineer' });

    const salary = card.getByText('per year');

    await expect(salary).toHaveText('62.000–78.000 € per year');
});

test('2 · the cards that contain a text', async ({ page }) => {
    const cards = page.getByRole('article');

    const inHamburg = cards.filter({ hasText: 'Hamburg' });

    await expect(inHamburg).toHaveCount(2);
});

test('3 · from a card to its button', async ({ page }) => {
    const save = page.getByRole('article', { name: 'UX Researcher' }).getByRole('button', { name: 'Save job' });

    await save.click();

    await expect(save).toHaveAttribute('aria-pressed', 'true');
});
