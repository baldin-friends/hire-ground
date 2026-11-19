import { test, expect } from '../../../support/fixtures';
import type { Page } from '@playwright/test';

// CandidatePipelineTest.java, three tests that depended on each other and on one fixed candidate.
// Here each test creates its own job and candidate through the API (fixtures) and removes them afterwards.

/** The row of one candidate in the table. Found by the link with the name: the row itself has no role. */
function candidateRow(page: Page, name: string) {
    return page.getByRole('row').filter({ has: page.getByRole('link', { name, exact: true }) });
}

// Proves: a candidate can apply through the form and gets a confirmation with a reference.
test('a candidate applies and gets a reference', async ({ page, job, withdrawAfterTest }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await page.goto(`/jobs/${job.slug}/apply`);

    await page.getByLabel('First name').fill('Selma');
    await page.getByLabel('Last name').fill(`Selenide-${id}`);
    await page.getByLabel('Email').fill(`selma.${id}@example.com`);
    await page.getByLabel(/^CV/).setInputFiles({
        name: 'cv.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n%%EOF\n'),
    });
    await page.getByLabel(/consent|agree/i).check();

    const created = page.waitForResponse((r) => r.url().endsWith('/api/applications') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Submit application' }).click();
    const body = await (await created).json();
    withdrawAfterTest(body.id); // removed after the test, also when an assertion below fails

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thank you for applying');
    await expect(page.getByTestId('application-reference')).toHaveText(/^HG-\d{6}$/);
});

// Proves: a recruiter can move a candidate to the stage Interview, and the app confirms it.
test('a recruiter moves the candidate to Interview', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${encodeURIComponent(applicant.lastName)}`);

    const row = candidateRow(page, applicant.name);
    await expect(row).toBeVisible();

    // CSS stays: the stage dropdown is made of <div>s without a role. Scoped to the row; the panel is in #overlays.
    await row.locator('.hg-select__trigger').click();
    await page.locator('#overlays .hg-select__option', { hasText: /^Interview$/ }).click();

    await expect(page.getByRole('status').filter({ hasText: `${applicant.name} moved to Interview.` })).toBeVisible();
    await expect(row.locator('.hg-select__value')).toHaveText('Interview');
});

// Proves: when the stage becomes Interview, the candidate sees it on the status page.
test('the candidate sees the interview on the status page', async ({ page, request, applicant }) => {
    const moved = await request.patch(`/api/applications/${applicant.id}`, { data: { stage: 'interview' } });
    expect(moved.ok(), 'PATCH stage').toBeTruthy();

    await page.goto(`/status/${applicant.reference}`);
    await expect(page.getByText('We would like to meet you.')).toBeVisible();
});

// Proves: when the stage becomes Interview, the candidate gets a status mail.
test('the candidate gets a status mail about the interview', async ({ request, job, applicant }) => {
    const moved = await request.patch(`/api/applications/${applicant.id}`, { data: { stage: 'interview' } });
    expect(moved.ok(), 'PATCH stage').toBeTruthy();

    // The mail leaves through a queue, one to two seconds later: poll the mailbox of this candidate.
    await expect
        .poll(
            async () => {
                const mails: { subject: string }[] = await (await request.get('/api/mail', { params: { to: applicant.email } })).json();
                return mails.map((m) => m.subject);
            },
            { message: 'mails for the candidate', timeout: 10_000 },
        )
        .toContain(`Status update: ${job.title}`);
});
