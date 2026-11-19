import { test, expect } from '@playwright/test';

// Visual comparison: the test takes a screenshot and compares it with a baseline image, pixel by pixel.
//   npx playwright test 1-screenshots --update-snapshots     writes the baselines into tests/__screenshots__/
//   npx playwright test 1-screenshots                        compares with them
// https://playwright.dev/docs/test-snapshots

test('the job page looks like its baseline', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer');

    // The line "Apply by …" shows another date tomorrow. A mask paints a box over the element in both images.
    await expect(page).toHaveScreenshot('job-page.png', { mask: [page.getByText(/^Apply by/)] });
});

test('one element: the search form of the career page', async ({ page }) => {
    await page.goto('/jobs');

    // A locator instead of the page: only this element is compared. The job list below it may change.
    await expect(page.getByRole('search', { name: 'Job search' })).toHaveScreenshot('job-search.png');
});

test('the same form as structure: roles and names instead of pixels', async ({ page }) => {
    await page.goto('/jobs');

    // An ARIA snapshot fails when a field loses its name or the order changes. Colours and spacing may change freely.
    // https://playwright.dev/docs/aria-snapshots
    await expect(page.getByRole('search', { name: 'Job search' })).toMatchAriaSnapshot(`
      - search "Job search":
        - searchbox "Search jobs"
        - button "Search"
        - combobox "Location"
        - combobox "Team"
        - checkbox "Remote only"
    `);
});
