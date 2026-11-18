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
