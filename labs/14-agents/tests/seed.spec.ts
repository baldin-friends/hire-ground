import { test, expect } from '@playwright/test';

// The seed test of the Playwright test agents. The planner and the generator run it first and start
// from the page it leaves behind: the job administration, signed in as a recruiter.
// `npx playwright init-agents` creates an empty seed only when this file is missing.
test.describe('Job administration', () => {
    test('seed', async ({ page }) => {
        await page.goto('/recruiter/jobs');
        await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();
    });
});
