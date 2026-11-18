import { test, expect } from '../../../support/fixtures';

// The two tests after a person has looked at them.
//   Test 1: the test was wrong. The control is a link called "New job". The locator is repaired.
//   Test 2: the application is wrong. The expectation stays; the test is marked as an expected failure
//           with the reason. When the bug is fixed, the test passes "unexpectedly", and Playwright
//           reports that: the reminder to remove the mark. https://playwright.dev/docs/test-annotations

const CV = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };

test('a recruiter opens the form for a new job', async ({ page }) => {
    await page.goto('/recruiter/jobs');

    await page.getByRole('link', { name: 'New job' }).click();

    await expect(page.getByRole('heading', { name: 'New job' })).toBeVisible();
    await expect(page.getByLabel('Job title')).toBeEditable();
});

test('one person can apply for two jobs with the same e-mail address', async ({ page, applicant, withdrawAfterTest }) => {
    test.fail(true, 'Bug: a second application with the same e-mail address is refused across jobs. The expectation is right.');

    // `applicant` has applied for one job already. The same person now applies for a second one.
    await page.goto('/jobs/backend-developer-java/apply');
    await page.getByLabel('First name').fill(applicant.firstName);
    await page.getByLabel('Last name').fill(applicant.lastName);
    await page.getByLabel('Email').fill(applicant.email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(CV);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();

    const answer = page.waitForResponse((r) => r.url().endsWith('/api/applications') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Submit application' }).click();
    const created = await (await answer).json();
    if (created.id) withdrawAfterTest(created.id);

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
});
