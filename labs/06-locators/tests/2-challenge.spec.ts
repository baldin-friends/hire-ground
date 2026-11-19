import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset'); // a fresh database for every test; case 4 gets rid of this
});

// The recruiter moves Felix Wagner to Screening, gives him four stars, puts him on the shortlist
// and rejects Lea Neumann.
//
// This version is written the way Day 1 taught it: by role and by name. It fails five times, each time
// for a different reason. Run it, read the failure, repair that line, run it again. The steps are in README.md.

test('work through the candidates table', async ({ page }) => {
    await page.goto('/recruiter/candidates');

    // 1. Felix Wagner
    const felix = page.getByRole('row', { name: 'Felix Wagner' });
    await expect(felix).toBeVisible();

    // 2. move him to Screening
    await felix.getByRole('combobox').click();
    await felix.getByText('Screening').click();
    await expect(page.getByText('Felix Wagner moved to Screening.')).toBeVisible();

    // 3. four stars
    await felix.getByRole('radio', { name: '4 stars' }).click();
    await expect(felix.getByRole('radio', { name: '4 stars' })).toBeChecked();

    // 4. on the shortlist
    await felix.getByRole('button', { name: 'Shortlist' }).click();
    await expect(page.getByText('Felix Wagner added to the shortlist.')).toBeVisible();

    // 5. reject Lea Neumann
    const lea = page.getByRole('row', { name: 'Lea Neumann' });
    await lea.getByRole('button', { name: 'Reject' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Reject' }).click();
    await expect(page.getByText('Lea Neumann rejected.')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The steps of the challenge as code, ready to copy. Try each step yourself first.
// To use a piece: copy its lines to the place named, select them, and remove the comment (Cmd+/ or Ctrl+/).
// The numbers are the steps in README.md. The finished test: solutions/06-locators/tests/2-challenge.spec.ts
//
// Step 1 · Felix Wagner is on page 3 of the table. Search for him. Above  const felix = …
//     await page.getByLabel('Search').fill('Felix Wagner');
//     await expect(page.getByText('1 candidate', { exact: true })).toBeVisible();
// Run it: the next failure is the line with getByRole('combobox').
//
// Step 2 · the dropdown is built from <div>s and has no role. Instead of  await felix.getByRole('combobox').click();
//     await felix.locator('.hg-select__trigger').click();
// Run it: the next failure is felix.getByText('Screening').
//
// Step 3 · the options are not inside the row: the panel is drawn at the end of <body>.
// Instead of  await felix.getByText('Screening').click();
//     await page.locator('.hg-select__panel').getByText('Screening', { exact: true }).click();
// Run it: "Screening" and the four stars pass. The next failure is the button 'Shortlist'.
//
// Step 4 · the star is a button with an icon and no name.
// Instead of  await felix.getByRole('button', { name: 'Shortlist' }).click();
//     const star = felix.locator('button:has(use[href="#icon-star"])');
//     await star.click();
//     await expect(star).toHaveAttribute('aria-pressed', 'true');
// Run it: the next failure is the row of Lea Neumann.
//
// Step 5 · Lea is on page 4, and the search still shows Felix. Search for her. Above  const lea = …
//     await page.getByLabel('Search').fill('Lea Neumann');
// The button 'Reject' has no name either. Instead of  await lea.getByRole('button', { name: 'Reject' }).click();
//     await lea.locator('button:has(use[href="#icon-reject"])').click();
// The dialog has a role and a name. Instead of the line with getByRole('dialog'):
//     await page.getByRole('dialog', { name: 'Reject Lea Neumann?' }).getByRole('button', { name: 'Reject' }).click();
// Run it: green.
//
// Step 6 · one function knows the dropdown, one knows how to find a row. In line 1, the import becomes:
// import { test, expect, type Locator, type Page } from '@playwright/test';
// Above the test:
// async function candidateRow(page: Page, name: string): Promise<Locator> {
//     await page.getByLabel('Search').fill(name);
//     await expect(page.getByText('1 candidate', { exact: true })).toBeVisible();
//     return page.getByTestId('candidate-row').filter({ hasText: name });
// }
//
// async function selectStage(row: Locator, stage: string) {
//     await row.locator('.hg-select__trigger').click();
//     await row.page().locator('.hg-select__panel').getByText(stage, { exact: true }).click();
// }
// and in the test, instead of the search lines, the row lines and the two dropdown lines:
//     const felix = await candidateRow(page, 'Felix Wagner');
//     await selectStage(felix, 'Screening');
//     const lea = await candidateRow(page, 'Lea Neumann');
