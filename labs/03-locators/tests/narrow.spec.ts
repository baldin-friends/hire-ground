import { expect, test, type Locator } from '@playwright/test';

// Step 8 · Twelve cards look alike. Narrow the search to the one you mean.
const todo = (): Locator => {
    throw new Error('TODO: write the locator on this line');
};

test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
});

test('1 · inside one card', async ({ page }) => {
    // every card is an "article", named after its job title
    const card = page.getByRole('article', { name: 'Senior QA Engineer' });

    // TODO: the salary line inside this card. Start from the card, not from the page: card.getByText('per year')
    const salary = todo();

    await expect(salary).toHaveText('62.000–78.000 € per year');
});

test('2 · the cards that contain a text', async ({ page }) => {
    const cards = page.getByRole('article');

    // TODO: keep the cards that mention Hamburg: cards.filter({ hasText: '…' })
    const inHamburg = todo();

    await expect(inHamburg).toHaveCount(2);
});

test('3 · from a card to its button', async ({ page }) => {
    // TODO: the card "UX Researcher", then the button "Save job" inside it
    const save = todo();

    await save.click();

    await expect(save).toHaveAttribute('aria-pressed', 'true');
});
