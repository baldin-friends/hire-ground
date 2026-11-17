import { expect, test, type Locator } from '@playwright/test';

// Step 7 · Find five elements the way a user would describe them.
// Replace each todo() by a locator: page.getByRole(…), page.getByLabel(…) or page.getByText(…). No CSS, no XPath.
const todo = (): Locator => {
    throw new Error('TODO: write the locator on this line');
};

test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
});

test('1 · the search box, by role and name', async ({ page }) => {
    const searchBox = todo(); // role "searchbox", name "Search jobs"

    await expect(searchBox).toBeVisible();
});

test('2 · the Search button, by role and name', async ({ page }) => {
    const button = todo();

    await expect(button).toBeEnabled();
});

test('3 · the location filter, by its label', async ({ page }) => {
    const location = todo();

    await expect(location).toHaveValue('');
});

test('4 · the sentence under the heading, by its text', async ({ page }) => {
    const lead = todo(); // a part of the text is enough: "no cover letter required"

    await expect(lead).toBeVisible();
});

test('5 · one heading out of thirteen', async ({ page }) => {
    // This locator matches every heading on the page. Run the test and read the error first.
    // Then give the locator a name, so that it matches one heading: "Test Automation Engineer".
    const heading = page.getByRole('heading');

    await expect(heading).toHaveText('Test Automation Engineer');
});
