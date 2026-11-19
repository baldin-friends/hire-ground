import { test, expect } from '../../../support/fixtures';

// The stages of a candidate. From Case 4 (New to Hired) and Case 5 (a request that fails).
// The dropdown is built from <div>s, and its panel is rendered at the end of <body> (Case 2).

test('a candidate goes from New to Hired', { tag: '@smoke' }, async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    const row = page.getByRole('row', { name: applicant.name });
    const stage = row.locator('.hg-select__value');
    await expect(stage).toHaveText('New');

    for (const next of ['Screening', 'Interview', 'Offer', 'Hired']) {
        await row.locator('.hg-select__trigger').click();
        await page.locator('.hg-select__panel').getByText(next, { exact: true }).click();
        await expect(page.getByText(`${applicant.name} moved to ${next}.`)).toBeVisible();
    }

    await expect(stage).toHaveText('Hired');
});

test('when saving fails, the stage jumps back and the recruiter is told', async ({ page, applicant }) => {
    // every request to this candidate's address gets a 500: the page cannot save
    await page.route(`**/api/applications/${applicant.id}`, (route) => route.fulfill({ status: 500 }));
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const row = page.getByRole('row', { name: applicant.name });

    await row.locator('.hg-select__trigger').click();
    await page.locator('.hg-select__panel').getByText('Interview', { exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('The stage could not be saved. The change was undone.');
    await expect(row.locator('.hg-select__value')).toHaveText('New');
});
