import { expect, test as base } from '@playwright/test';
import { JobPage } from '../pages/job-page';
import { cv, person } from './data';

type Applicant = { id: string; firstName: string; lastName: string; email: string };

// Step 3 · fixtures provide state, page objects name actions.
// Tests import `test` and `expect` from this file instead of '@playwright/test'.
export const test = base.extend<{ jobPage: JobPage; applicant: Applicant }>({
    // a finished fixture, as a model: everything before `use` is setup, everything after it is teardown
    jobPage: async ({ page }, use) => {
        await use(new JobPage(page));
    },

    // an applicant who exists before the test and is gone after it
    applicant: async ({ request }, use) => {
        const p = person('fixture');
        // TODO: POST /api/applications with  multipart: { jobId: '4', ...p, consent: 'true', cv }
        // TODO: read { id, withdrawToken } from the response body
        // TODO: await use({ id, ...p });
        // TODO: after use: DELETE /api/applications/<id> with the header 'x-withdraw-token'
        throw new Error('TODO: finish the applicant fixture, then delete this line');
    },
});

export { expect };
