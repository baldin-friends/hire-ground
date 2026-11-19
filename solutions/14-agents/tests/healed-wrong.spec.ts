import { test, expect } from '../../../support/fixtures';

// DO NOT COPY. Written by hand: the second test of heal-me.spec.ts after a repair that only wanted a green run.
// The expectation was changed to what the page shows. The test passes, and it now protects the bug.
// No healer run of 19 November did this, but "fixing assertions and expected values" is on the healer's list of
// repairs. Look for this in every diff. A changed expectation is a question, not a fix.

const CV = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };

test('one person can apply for two jobs with the same e-mail address (repaired the wrong way)', async ({ page, applicant }) => {
    await page.goto('/jobs/backend-developer-java/apply');
    await page.getByLabel('First name').fill(applicant.firstName);
    await page.getByLabel('Last name').fill(applicant.lastName);
    await page.getByLabel('Email').fill(applicant.email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(CV);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();
    await page.getByRole('button', { name: 'Submit application' }).click();

    // was: await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveText('You have already applied with this email address.');
});
