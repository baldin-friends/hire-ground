import { test, expect } from '../../../support/fixtures.per-worker';
import type { Locator } from '@playwright/test';

/** The stage dropdown from case 2: built from <div>s, and its panel is rendered at the end of <body>. */
async function selectStage(row: Locator, stage: string) {
    await row.locator('.hg-select__trigger').click();
    await row.page().locator('.hg-select__panel').getByText(stage, { exact: true }).click();
}

test('a new candidate moves to Screening', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    await selectStage(page.getByRole('row', { name: applicant.name }), 'Screening');
    await expect(page.getByText(`${applicant.name} moved to Screening.`)).toBeVisible();
});

test('a rejected candidate hears about it by mail', async ({ page, request, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    await page.getByRole('row', { name: applicant.name }).locator('button:has(use[href="#icon-reject"])').click();
    await page.getByRole('dialog', { name: `Reject ${applicant.name}?` }).getByRole('button', { name: 'Reject' }).click();
    await expect(page.getByText(`${applicant.name} rejected.`)).toBeVisible();

    // The mail leaves through a queue, one to two seconds later: poll the mailbox, never sleep (case 3).
    await expect
        .poll(async () => {
            const mails: { subject: string }[] = await (await request.get('/api/mail', { params: { to: applicant.email } })).json();
            return mails.map((mail) => mail.subject);
        })
        .toContainEqual(expect.stringContaining('Status update'));
});
