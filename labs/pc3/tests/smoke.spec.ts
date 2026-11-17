import { fullName, mailbox } from './data';
import { expect, test } from './fixtures';

// What must be true for the applicant who is in the system before any test
// starts: the `candidate` from fixtures.ts.

test('the application is on the board', async ({ page, candidate }) => {
    await page.goto('/recruiter');

    const card = page.getByRole('region', { name: 'New' }).getByRole('article', { name: fullName(candidate) });
    await expect(card).toContainText(candidate.jobTitle);

    await card.getByRole('link').click();
    await expect(page.getByText(candidate.reference)).toBeVisible();
});

test('the applicant has a confirmation mail', async ({ request, candidate }) => {
    const mails = await mailbox(request, candidate.email);

    expect(mails.map((mail) => mail.subject)).toEqual([`Your application for ${candidate.jobTitle}`]);
});

test('the confirmation mail quotes the reference', async ({ request, candidate }) => {
    const [mail] = await mailbox(request, candidate.email);

    expect(mail.body).toContain(`Your reference is ${candidate.reference}.`);
});
