import { test, expect } from '../fixtures';

// The same test, repaired: it changes and reads only the candidate it created.
//
//   npx playwright test 2-fixed --workers=4 --repeat-each=3     passes, as often as you like
//
// No reset: the fixture removes the candidate after the test. No count of all candidates: the test searches for its own.

test('a new application is in the candidates table', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('status')).toHaveText('1 candidate');
    await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
});
