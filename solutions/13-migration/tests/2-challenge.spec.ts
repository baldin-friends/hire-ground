import { randomUUID } from 'node:crypto';
import { test, expect } from '../../../support/fixtures';

// CandidatePipelineTest.java, rewritten instead of translated.
//
// What changed, and why:
//   - Three tests in a fixed order became two tests that do not know each other. Each one runs alone,
//     in any order, on any worker, as often as you like.
//   - No fixed candidate. Test 1 types a new e-mail address; test 2 gets its candidate from a fixture, through the API.
//     Only the form under test is driven through the browser.
//   - No sign-in through the form: the session comes from tests/auth.setup.ts and playwright.config.ts.
//   - No sleep. Assertions wait for the page; expect.poll waits for the mail.
//   - Locators by role and label where the markup has them. The stage dropdown has none: CSS, scoped to the row.
//
// Try it: npx playwright test 2-challenge --repeat-each=3 --workers=3

const CV = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };

test('a candidate applies through the form', async ({ page, job, withdrawAfterTest }) => {
    const email = `mia.migration-${randomUUID().slice(0, 8)}@example.com`;

    await page.goto(`/jobs/${job.slug}/apply`);
    await page.getByLabel('First name').fill('Mia');
    await page.getByLabel('Last name').fill('Migration');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(CV);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();

    // The response of the form's own request carries the id: the test needs it to clean up.
    // https://playwright.dev/docs/network#network-events
    const created = page.waitForResponse((r) => r.url().endsWith('/api/applications') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Submit application' }).click();
    withdrawAfterTest((await (await created).json()).id);

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
    await expect(page.getByTestId('application-reference')).toHaveText(/^HG-\d{6}$/);
});

test('a recruiter moves a candidate to Interview, and the candidate hears about it', async ({ page, browser, request, job, applicant }) => {
    // The search is part of the address: this test's candidate, wherever the row is in the table.
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    const row = page.getByRole('row', { name: applicant.name });
    await row.locator('.hg-select__trigger').click();
    await page.locator('.hg-select__panel').getByText('Interview', { exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: `${applicant.name} moved to Interview.` })).toBeVisible();

    // The candidate's side: a second browser context in the same test, without the recruiter's session.
    // https://playwright.dev/docs/browser-contexts#multiple-contexts-in-a-single-test
    const candidate = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const status = await candidate.newPage();
    await status.goto(`/status/${applicant.reference}`);
    await expect(status.getByText('We would like to meet you.')).toBeVisible();
    await candidate.close();

    // The mail leaves through a queue, one to two seconds later. Ask the mailbox until it is there,
    // and ask for this candidate's mail only. https://playwright.dev/docs/test-assertions#expectpoll
    await expect
        .poll(async () => {
            const mails: { subject: string }[] = await (await request.get('/api/mail', { params: { to: applicant.email } })).json();
            return mails.map((m) => m.subject);
        })
        .toContain(`Status update: ${job.title}`);
});
