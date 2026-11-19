import { test, expect } from '@playwright/test';

// The session of a recruiter. From Case 6: page.clock replaces Date and the timers of the page.
// https://playwright.dev/docs/clock

test('after 30 minutes without input the recruiter is warned', async ({ page }) => {
    await page.clock.install();
    await page.goto('/recruiter');
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();

    await page.clock.fastForward('30:00'); // 30 minutes pass in a few milliseconds

    await expect(page.getByRole('alertdialog')).toContainText('Your session expires in 2 minutes.');
    // Do not wait for the 32nd minute: the page would sign out, and every test of this run uses this session.
    await page.getByRole('button', { name: 'Stay signed in' }).click();
    await expect(page.getByRole('alertdialog')).toBeHidden();
});
