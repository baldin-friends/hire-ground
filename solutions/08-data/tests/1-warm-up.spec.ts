import { test, expect } from '../fixtures';

// Warm-up: one fixture, used by one test.
// Run it twice: npx playwright test 1-warm-up   Both runs pass, and no job is left behind.

test('a new job shows up in the job administration', async ({ page, job }) => {
    await page.goto('/recruiter/jobs');

    const row = page.getByRole('row', { name: job.title });
    await expect(row).toBeVisible();
    await expect(row.getByText('Published')).toBeVisible();
});

test('a candidate of my own shows up in the candidates table', async ({ page, applicant }) => {
    // The table has four pages, and other tests add rows. The search finds this test's candidate, wherever the row is.
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('status')).toHaveText('1 candidate');
    await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
});
