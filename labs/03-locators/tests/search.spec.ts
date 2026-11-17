import { expect, test } from '@playwright/test';

// Step 9 · This test fails about three times in ten:  npx playwright test search --repeat-each=10
// It sleeps for a second and then counts once. Make it wait for the result instead:
//   1. find the search box and the button by role, as in step 7
//   2. delete the sleep
//   3. replace the last line by an assertion that waits: await expect(page.getByRole('article')).toHaveCount(3)
test('search for QA jobs', async ({ page }) => {
    await page.goto('/jobs?bugs=slow-search');
    await page.locator('#q').fill('QA');
    await page.locator('form button.button.primary').click();
    await page.waitForTimeout(1000);
    expect(await page.locator('.job-list > li').count()).toBe(3);
});
