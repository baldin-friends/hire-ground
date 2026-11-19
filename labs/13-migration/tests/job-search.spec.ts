import { test, expect } from '@playwright/test';

// JobSearchTest.java, translated line by line: the Selenide line is the comment, the Playwright line is below it.
// The Java source: selenide/src/test/java/hireground/JobSearchTest.java
// The same test the way Playwright prefers it: solutions/13-migration/tests/job-search.spec.ts
// Every call and its counterpart: handouts/selenide-to-playwright.md
//
// Three lines do not translate one to one. They are numbered.

test('the search opens the job and the form', async ({ page }) => {
    // open("/jobs");
    await page.goto('/jobs');

    // 1 · $() takes the first of twelve cards. A locator must match exactly one element: say first().
    // $(".job-card").shouldBe(visible);
    await expect(page.locator('.job-card').first()).toBeVisible();

    // $("#q").setValue("Reliability").pressEnter();
    await page.locator('#q').fill('Reliability');
    await page.locator('#q').press('Enter');

    // $$(".job-card").shouldHave(size(1));
    await expect(page.locator('.job-card')).toHaveCount(1);

    // $(".job-card h2").shouldHave(exactText("Site Reliability Engineer"));
    await expect(page.locator('.job-card h2')).toHaveText('Site Reliability Engineer');

    // $(".job-card .meta").shouldHave(text("München"));
    await expect(page.locator('.job-card .meta')).toContainText('München');
    // 2 · Selenide's text() ignores case: the page says "Remote possible". toContainText() does not.
    // $(".job-card .meta").shouldHave(text("remote possible"));
    await expect(page.locator('.job-card .meta')).toContainText('remote possible', { ignoreCase: true });

    // $(byText("Site Reliability Engineer")).click();
    await page.getByText('Site Reliability Engineer', { exact: true }).click();

    // webdriver().shouldHave(urlContaining("/jobs/site-reliability-engineer"));
    await expect(page).toHaveURL(/\/jobs\/site-reliability-engineer/);

    // $("h1").shouldHave(exactText("Site Reliability Engineer"));
    await expect(page.locator('h1')).toHaveText('Site Reliability Engineer');

    // $(".salary").shouldHave(text("68.000–86.000 €"));
    await expect(page.locator('.salary')).toContainText('68.000–86.000 €');

    // $("#apply-button").shouldBe(visible).click();
    await page.locator('#apply-button').click(); // click() waits for a visible, enabled element: one line is enough

    // $(byText("Submit application")).click();
    await page.getByText('Submit application', { exact: true }).click();

    // $("#email").shouldHave(attribute("aria-invalid", "true"));
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');

    // $("#email-error").shouldHave(exactText("Please enter a valid email address."));
    await expect(page.locator('#email-error')).toHaveText('Please enter a valid email address.');

    // 3 · There is no "at least" for a count. Say what you mean: the fourth error exists.
    // $$(".field-error").shouldHave(sizeGreaterThanOrEqual(4));
    await expect(page.locator('.field-error').nth(3)).toBeVisible();
});
