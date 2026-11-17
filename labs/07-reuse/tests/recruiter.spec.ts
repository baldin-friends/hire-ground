import { cv, person, recruiterState } from './data';
import { expect, test } from './fixtures';

// Step 4 · the recruiter is signed in before the test starts.
test.describe('recruiter', () => {
    test.use({ storageState: recruiterState });

    test('sees a new applicant in the pipeline', async ({ page, applicant }) => {
        await page.goto('/recruiter');
        // TODO: in the column "New" (a region), find the card (an article) named after the applicant, and expect it to be visible
        throw new Error('TODO: write the steps above, then delete this line');
    });
});

// Step 5 · two roles, two browser contexts, one test.
test('applicant applies, recruiter sees it', async ({ browser, jobPage }) => {
    const p = person('two-roles');
    // TODO: the candidate applies for 'backend-developer-java' with jobPage.open() and jobPage.apply(p, cv)
    // TODO: expect the heading "Thank you for applying"

    // TODO: const recruiter = await browser.newContext({ storageState: recruiterState });
    // TODO: open /recruiter in a new page of that context, find the card of p in "New"
    // TODO: close the recruiter context
    throw new Error('TODO: write the steps above, then delete this line');
});
