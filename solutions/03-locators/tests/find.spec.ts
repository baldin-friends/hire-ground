import { expect, test } from '@playwright/test';

// Step 7 · solution.
test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
});

test('1 · the search box, by role and name', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search jobs' });

    await expect(searchBox).toBeVisible();
});

test('2 · the Search button, by role and name', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Search' });

    await expect(button).toBeEnabled();
});

test('3 · the location filter, by its label', async ({ page }) => {
    const location = page.getByLabel('Location');

    await expect(location).toHaveValue('');
});

test('4 · the sentence under the heading, by its text', async ({ page }) => {
    const lead = page.getByText('no cover letter required');

    await expect(lead).toBeVisible();
});

test('5 · one heading out of thirteen', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'Test Automation Engineer' });

    await expect(heading).toHaveText('Test Automation Engineer');
});
