import { test, expect } from '../../../support/fixtures';

const CV = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };

test('a recruiter opens the form for a new job', async ({ page }) => {
    await page.goto('/recruiter/jobs');

    await page.getByRole('button', { name: 'Create job' }).click();

    await expect(page.getByRole('heading', { name: 'New job' })).toBeVisible();
    await expect(page.getByLabel('Job title')).toBeEditable();
});

test('one person can apply for two jobs with the same e-mail address', async ({ page, applicant, withdrawAfterTest }) => {
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
