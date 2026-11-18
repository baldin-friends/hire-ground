import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { openDatabase, type Database } from './db';

// Fixtures: https://playwright.dev/docs/test-fixtures
// Each test asks for the data it needs. The fixture creates it before the test and removes it afterwards,
// also when the test fails.

export type Job = { id: string; slug: string; title: string };
export type Applicant = { id: string; reference: string; firstName: string; lastName: string; name: string; email: string };

type TestFixtures = {
    /** A published job that belongs to this test alone. */
    job: Job;
    /** A candidate who has applied for `job`. */
    applicant: Applicant;
};
type WorkerFixtures = {
    /** The application's database, for the few things no API can do. One connection per worker. */
    db: Database;
};

/** A date as YYYY-MM-DD, n days from today. A fixed date in a test is a failure with a start date. */
export const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

const CV = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };

export const test = base.extend<TestFixtures, WorkerFixtures>({
    job: async ({ request }, use) => {
        // setup: everything before use()
        const response = await request.post('/api/jobs', {
            data: {
                title: `Fixture job ${randomUUID().slice(0, 8)}`, // unique: a second run and a second worker get their own
                team: 'People',
                location: 'Dresden',
                remote: true,
                salaryMin: 50_000,
                salaryMax: 60_000,
                deadline: inDays(30),
                description: 'Created by a test fixture.',
                status: 'published',
            },
        });
        expect(response.status(), `POST /api/jobs: ${await response.text()}`).toBe(201);
        const job: Job = await response.json();

        await use(job); // the test runs here

        // teardown: everything after use(), also after a failed test
        await request.delete(`/api/jobs/${job.id}`);
    },

    // TODO (challenge, step 2): a candidate who has applied for `job`.
    //   1. POST /api/applications as multipart: jobId, firstName, lastName, email, consent: 'true', cv: CV
    //      Name and e-mail are unique: randomUUID().slice(0, 8), as in the job title.
    //   2. await use({ id, reference, firstName, lastName, email, name })
    //   3. afterwards: DELETE /api/applications/<id>
    // It asks for `job`, so Playwright sets up the job first and removes it last.
    applicant: async ({ request, job }, use) => {
        throw new Error('TODO: write the applicant fixture in labs/08-data/fixtures.ts');
    },

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
