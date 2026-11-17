import { expect, test as base } from '@playwright/test';
import { JobPage } from '../pages/job-page';
import { cv, person } from './data';

type Applicant = { id: string; firstName: string; lastName: string; email: string };

// Fixtures provide state, page objects name actions.
export const test = base.extend<{ jobPage: JobPage; applicant: Applicant }, { account: { email: string } }>({
    jobPage: async ({ page }, use) => {
        await use(new JobPage(page));
    },

    // created through the API before the test, withdrawn after it
    applicant: async ({ request }, use) => {
        const p = person('fixture');
        const res = await request.post('/api/applications', { multipart: { jobId: '4', ...p, consent: 'true', cv } });
        const { id, withdrawToken } = await res.json();
        await use({ id, ...p });
        await request.delete(`/api/applications/${id}`, { headers: { 'x-withdraw-token': withdrawToken } });
    },

    // done early: one recruiter account per worker, so parallel tests never share one
    account: [
        async ({}, use, workerInfo) => {
            await use({ email: `recruiter-${workerInfo.parallelIndex + 1}@hireground.test` });
        },
        { scope: 'worker' },
    ],
});

export { expect };
