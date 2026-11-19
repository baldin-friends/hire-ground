import { test as base, expect } from '@playwright/test';
import { createJob, deleteJob, createApplicant, deleteApplicant, type Job, type Applicant } from './api';
import { openDatabase, type Database } from './db';

// A fixture is a beforeEach and an afterEach in one function, with a name.
// Everything above use() runs before the test. Everything below it runs afterwards, also when the test failed.
// A test gets a fixture by writing its name: async ({ page, job }) => { … }
// https://playwright.dev/docs/test-fixtures

export const test = base.extend<{ job: Job; applicant: Applicant }, { db: Database }>({
    // a published job that belongs to this test alone
    job: async ({ request }, use) => {
        const job = await createJob(request); // 1 · before the test
        await use(job); //                       2 · the test runs here, and receives the job
        await deleteJob(request, job); //        3 · after the test
    },

    // TODO (challenge, step 2): a candidate who has applied for `job`. The same three parts as above,
    // with createApplicant(request, job) and deleteApplicant(request, applicant).
    // It asks for `job`, so Playwright creates the job first and removes it last.
    applicant: async ({ request, job }, use) => {
        throw new Error('TODO: write the applicant fixture in labs/08-data/fixtures.ts');
    },

    // the database, for the few things no API can do. One connection for all tests of a worker process
    db: [
        async ({}, use) => {
            const db = await openDatabase();
            await use(db);
            db.close();
        },
        { scope: 'worker' },
    ],
});

export { expect };
export { inDays, type Job, type Applicant } from './api';
