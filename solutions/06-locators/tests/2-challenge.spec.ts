import { test, expect, type Locator, type Page } from '@playwright/test';

test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset'); // a fresh database for every test; case 4 gets rid of this
});

/** The table row of one candidate. The search brings the row to page 1, wherever it was. */
async function candidateRow(page: Page, name: string): Promise<Locator> {
    await page.getByLabel('Search').fill(name);
    await expect(page.getByText('1 candidate', { exact: true })).toBeVisible();
    // data-qa is this application's test attribute; the config tells getByTestId() to read it
    return page.getByTestId('candidate-row').filter({ hasText: name });
}

/**
 * The stage dropdown of the component library. It is built from <div>s without roles, and its panel is rendered
 * at the end of <body>: the options are not inside the row. One helper knows that; the tests do not have to.
 */
async function selectStage(row: Locator, stage: string) {
    await row.locator('.hg-select__trigger').click();
    await row.page().locator('.hg-select__panel').getByText(stage, { exact: true }).click();
}

test('work through the candidates table', async ({ page }) => {
    await page.goto('/recruiter/candidates');

    // 1. Felix Wagner is on page 3. Searching is more stable than paging.
    const felix = await candidateRow(page, 'Felix Wagner');

    // 2. Screening
    await selectStage(felix, 'Screening');
    await expect(page.getByText('Felix Wagner moved to Screening.')).toBeVisible();
    await expect(felix.locator('.hg-select__value')).toHaveText('Screening');

    // 3. four stars: the radios are in a shadow root, and role locators see them
    const fourStars = felix.getByRole('radio', { name: '4 stars' });
    await fourStars.click();
    await expect(fourStars).toBeChecked();

    // 4. shortlist: a button with nothing but an icon
    const star = felix.locator('button:has(use[href="#icon-star"])');
    await star.click();
    await expect(star).toHaveAttribute('aria-pressed', 'true');

    // 5. reject Lea Neumann. The dialog has a role and a name: back to getByRole.
    const lea = await candidateRow(page, 'Lea Neumann');
    await lea.locator('button:has(use[href="#icon-reject"])').click();
    await page.getByRole('dialog', { name: 'Reject Lea Neumann?' }).getByRole('button', { name: 'Reject' }).click();
    await expect(page.getByText('Lea Neumann rejected.')).toBeVisible();
    await expect(lea.locator('.hg-select__value')).toHaveText('Rejected');
});
