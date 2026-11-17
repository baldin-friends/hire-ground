import { cv, person, recruiterState } from './data';
import { expect, test } from './fixtures';

// The fixture creates the applicant, the stored session signs in.
test.describe('recruiter', () => {
    test.use({ storageState: recruiterState });

    test('sees a new applicant in the pipeline', async ({ page, applicant }) => {
        await page.goto('/recruiter');
        const card = page
            .getByRole('region', { name: 'New' })
            .getByRole('article', { name: `${applicant.firstName} ${applicant.lastName}` });
        await expect(card).toBeVisible();
    });
});

// Two roles, two browser contexts, one test.
test('applicant applies, recruiter sees it', async ({ browser, jobPage }) => {
    const p = person('two-roles');
    await jobPage.open('backend-developer-java');
    await jobPage.apply(p, cv);
    await expect(jobPage.page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();

    const recruiter = await browser.newContext({ storageState: recruiterState });
    const board = await recruiter.newPage();
    await board.goto('/recruiter');
    await expect(
        board.getByRole('region', { name: 'New' }).getByRole('article', { name: `${p.firstName} ${p.lastName}` }),
    ).toBeVisible();
    await recruiter.close();
});
