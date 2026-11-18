import { test, expect } from '@playwright/test';

// Warm-up: three elements of the candidates table, from "has a role and a name" to "has nothing".

test.beforeEach(async ({ request, page }) => {
    await request.post('/api/test/reset'); // a fresh database for every test; case 4 gets rid of this
    await page.goto('/recruiter/candidates');
});

test('role and name: the row, the checkbox, the link', async ({ page }) => {
    // A <tr> has the role "row". Its accessible name is the text of its cells.
    // https://playwright.dev/docs/locators#locate-by-role
    const row = page.getByRole('row', { name: 'Ben Braun' });

    await row.getByRole('checkbox', { name: 'Select Ben Braun' }).check();

    await expect(page.getByText('1 selected')).toBeVisible();
    await expect(row.getByRole('link', { name: 'Ben Braun' })).toHaveAttribute('href', /\/recruiter\/applications\/\d+/);
});

test('shadow DOM: locators see into open shadow roots', async ({ page }) => {
    // <hg-rating> is a web component. Its five stars are radios inside a shadow root.
    // https://playwright.dev/docs/locators#locate-in-shadow-dom
    const row = page.getByRole('row', { name: 'Ben Braun' });
    const fourStars = row.getByRole('radio', { name: '4 stars' });

    await fourStars.click();

    await expect(fourStars).toBeChecked();
});

test('an icon without a name: describe the button by what is inside', async ({ page }) => {
    const row = page.getByRole('row', { name: 'Ben Braun' });
    // The button holds <svg><use href="#icon-star"></svg> and nothing else: no text, no label, no title.
    // CSS :has() selects "a button that contains this icon".
    // https://playwright.dev/docs/other-locators#css-locator
    const star = row.locator('button:has(use[href="#icon-star"])');

    await star.click();

    await expect(star).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Ben Braun added to the shortlist.')).toBeVisible();
});
