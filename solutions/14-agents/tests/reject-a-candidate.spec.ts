import { test, expect } from '../../../support/fixtures';

// Locators, role and name first: https://playwright.dev/docs/locators
test('a recruiter rejects a candidate', async ({ page, applicant }) => {
    await page.goto('/recruiter/candidates');

    // The table shows ten candidates per page. The search leaves the one row this test owns.
    // It runs 300 ms after the last key: the count says when the table has caught up.
    await page.getByRole('searchbox', { name: 'Search' }).fill(applicant.lastName);
    await expect(page.getByRole('status')).toHaveText('1 candidate');

    const row = page.getByRole('row', { name: applicant.name });
    // The stage is a custom dropdown without a role or a name. The table cell around it carries the text.
    await expect(row.getByRole('cell', { name: 'New', exact: true })).toBeVisible();

    // The reject button has no name: an icon, no text, no aria-label, no title, no test id.
    // The page offers only the icon it draws, so the locator asks for the button with that icon.
    await row.getByRole('button').filter({ has: page.locator('use[href="#icon-reject"]') }).click();

    const dialog = page.getByRole('dialog', { name: `Reject ${applicant.name}?` });
    await dialog.getByRole('button', { name: 'Reject' }).click();

    // The message has the role "status" and no name, like the count above. It is gone after four seconds.
    await expect(page.getByRole('status').filter({ hasText: `${applicant.name} rejected.` })).toBeVisible();
    await expect(dialog).toBeHidden();
    // After the save the page loads the list again, so this text comes from the server.
    await expect(row.getByRole('cell', { name: 'Rejected', exact: true })).toBeVisible();
});
