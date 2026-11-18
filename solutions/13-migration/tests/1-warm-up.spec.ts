import { test, expect } from '@playwright/test';

// Warm-up: JobSearchTest.java, twice.
//   1. line by line: every Selenide line (as a comment) and its Playwright line below it
//   2. the same test with the locators Playwright prefers
//   3. three things that do not translate one to one
// The Java source: selenide/src/test/java/hireground/JobSearchTest.java
// The mapping table with links into the documentation: README.md

test('line by line: the search opens the job and the form', async ({ page }) => {
    // open("/jobs");
    await page.goto('/jobs');

    // $("#q").setValue("Reliability").pressEnter();
    await page.locator('#q').fill('Reliability');
    await page.locator('#q').press('Enter');

    // $$(".job-card").shouldHave(size(1));
    await expect(page.locator('.job-card')).toHaveCount(1);

    // $(".job-card h2").shouldHave(exactText("Site Reliability Engineer"));
    await expect(page.locator('.job-card h2')).toHaveText('Site Reliability Engineer');

    // $(".job-card .meta").shouldHave(text("München"), text("Remote possible"));
    await expect(page.locator('.job-card .meta')).toContainText('München');
    await expect(page.locator('.job-card .meta')).toContainText('Remote possible');

    // $(byText("Site Reliability Engineer")).click();
    await page.getByText('Site Reliability Engineer', { exact: true }).click();

    // webdriver().shouldHave(urlContaining("/jobs/site-reliability-engineer"));
    await expect(page).toHaveURL(/\/jobs\/site-reliability-engineer/);

    // $("h1").shouldHave(exactText("Site Reliability Engineer"));
    await expect(page.locator('h1')).toHaveText('Site Reliability Engineer');

    // $(".salary").shouldHave(text("68.000–86.000 €"));
    await expect(page.locator('.salary')).toContainText('68.000–86.000 €');

    // $("#apply-button").shouldBe(visible).click();
    await expect(page.locator('#apply-button')).toBeVisible(); // not needed: click() waits for a visible, enabled element
    await page.locator('#apply-button').click();

    // $(byText("Submit application")).click();
    await page.getByText('Submit application', { exact: true }).click();

    // $("#email").shouldHave(attribute("aria-invalid", "true"));
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');

    // $("#email-error").shouldHave(exactText("Please enter a valid email address."));
    await expect(page.locator('#email-error')).toHaveText('Please enter a valid email address.');

    // $$(".field-error").shouldHave(sizeGreaterThanOrEqual(4));
    // There is no "at least" for a count. Say what you mean instead: the fourth error exists.
    await expect(page.locator('.field-error').nth(3)).toBeVisible();
});

// The same journey, described the way a user would describe it: by role, by label, by text.
// No id and no class name: the markup may change, the test stays.
// https://playwright.dev/docs/locators#quick-guide
test('the Playwright way: the search opens the job and the form', async ({ page }) => {
    await page.goto('/jobs');

    await page.getByLabel('Search jobs').fill('Reliability');
    await page.getByRole('button', { name: 'Search' }).click();

    const card = page.getByRole('article', { name: 'Site Reliability Engineer' });
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(card).toContainText('München');
    await expect(card).toContainText('Remote possible');

    await card.getByRole('link', { name: 'Site Reliability Engineer' }).click();
    await expect(page).toHaveURL(/\/jobs\/site-reliability-engineer/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Site Reliability Engineer');
    await expect(page.getByText('68.000–86.000 € per year')).toBeVisible();

    await page.getByRole('link', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Please upload your CV.')).toBeVisible();
});

// Three things that do not translate one to one.
test('what does not translate one to one', async ({ page }) => {
    await page.goto('/recruiter/jobs');

    // 1 · Selenide's text() ignores case. toContainText() does not, unless you ask for it.
    // $("h1").shouldHave(text("jobs"));
    await expect(page.locator('h1')).toContainText('jobs', { ignoreCase: true });

    // 2 · A new tab: Selenide switches its one driver to it. Playwright hands you a second Page.
    // $(byText("Senior QA Engineer")).click();
    // switchTo().window(1);
    const popup = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Senior QA Engineer' }).click();
    const careerPage = await popup;
    await expect(careerPage.getByRole('heading', { level: 1 })).toHaveText('Senior QA Engineer');

    // 3 · Both pages stay usable at the same time: there is nothing to switch back to.
    // switchTo().window(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jobs');
});
