import { test, expect } from '../engines';

// Can we define our own selectors for our own component framework? Yes. Should we? Compare the two tests.

test.beforeEach(async ({ request, page }) => {
    await request.post('/api/test/reset');
    await page.goto('/recruiter/candidates?stage=screening');
});

test('with a custom selector engine: rating=4', async ({ page }) => {
    const rows = page.getByTestId('candidate-row');

    // has: a locator relative to each row. https://playwright.dev/docs/locators#filter-by-childdescendant
    const fourStars = rows.filter({ has: page.locator('rating=4') });

    await expect(fourStars).toHaveCount(3);
});

test('with what the component already says about itself: a checked radio', async ({ page }) => {
    const rows = page.getByTestId('candidate-row');

    const fourStars = rows.filter({ has: page.getByRole('radio', { name: '4 stars', checked: true }) });

    await expect(fourStars).toHaveCount(3);
});
