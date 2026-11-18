import { test, expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

// The challenge: CandidatePipelineTest.java, translated line by line. This is the starting point, not the goal.
// The Java source: selenide/src/test/java/hireground/CandidatePipelineTest.java
//
// Run it twice:  npx playwright test 2-challenge
// The first run passes (after `npm run reset` in the repository root). The second run fails in test 1,
// and tests 2 and 3 do not run. Why? Then rewrite it: the steps are in README.md.

const CV = fileURLToPath(new URL('../selenide/src/test/resources/cv.pdf', import.meta.url));

// The same candidate in every run, as in the Selenide suite.
const FIRST_NAME = 'Selma';
const LAST_NAME = 'Selenide';
const EMAIL = 'selma.selenide@example.com';

// BaseTest.loginAsRecruiter(): the Selenide suite signs in through the form in every test,
// so this file does not use the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

async function loginAsRecruiter(page: Page) {
    await page.goto('/login');
    await page.locator('#login-email').fill('rita.recruiter@hireground.test');
    await page.locator('#login-password').fill('hire-ground');
    await page.locator("xpath=//button[@type='submit']").click();
    await expect(page.locator('h1')).toContainText('Pipeline');
}

// @TestMethodOrder(OrderAnnotation.class): one after the other, and the next one needs the one before.
test.describe.serial('candidate pipeline', () => {
    let reference: string; // written by test 1, read by test 3

    test('1 · the candidate applies', async ({ page }) => {
        await page.goto('/jobs/backend-developer-java/apply');
        await page.locator('#firstName').fill(FIRST_NAME);
        await page.locator('#lastName').fill(LAST_NAME);
        await page.locator('#email').fill(EMAIL);
        await page.locator('#cv').setInputFiles(CV);
        await page.locator('#consent').check();
        await page.getByText('Submit application', { exact: true }).click();
        await page.waitForTimeout(3000); // sleep(3000): the confirmation page needs a moment
        await expect(page.locator('h1')).toContainText('Thank you for applying');
        reference = await page.locator("[data-testid='application-reference']").innerText();
    });

    test('2 · the recruiter moves the candidate to Interview', async ({ page }) => {
        await loginAsRecruiter(page);
        await page.goto('/recruiter/candidates');
        await page.locator('#candidate-search').fill(LAST_NAME);
        await page.waitForTimeout(1000); // sleep(1000): the table reloads 300 ms after the last key

        const row = page.locator(`xpath=//table[contains(@class,'candidates')]//tr[td[2]/a[text()='${FIRST_NAME} ${LAST_NAME}']]`);
        await expect(row).toBeVisible();
        await row.locator('.hg-select__trigger').click();
        await page.locator('.hg-select__option').filter({ hasText: /^Interview$/ }).click();
        await expect(page.locator('.toast-item')).toContainText('moved to Interview');
    });

    test('3 · the candidate hears about it', async ({ page }) => {
        await page.goto(`/status/${reference}`);
        await expect(page.locator('dl.facts')).toContainText('We would like to meet you.');

        await page.waitForTimeout(3000); // sleep(3000): the mail is sent by a queue
        await page.goto('/mailbox');
        await expect(page.locator('.mails .subject').filter({ hasText: 'Status update: Backend Developer (Java)' }).first()).toBeVisible();
    });
});
