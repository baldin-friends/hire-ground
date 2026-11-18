import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { openDatabase, type Database } from './db';

// The fixtures the room wrote in Case 4 (labs/08-data), and one small addition for cases 9 and 10
// (withdrawAfterTest). Every later case imports them from here:
//
//     import { test, expect } from '../../../support/fixtures';
//
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
    /** For an application the test creates through the form: hand over its id, and it is withdrawn after the test. */
    withdrawAfterTest: (applicationId: string) => void;
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

    // applicant depends on job. Playwright sets up job first and tears it down last:
    // the application is withdrawn before the job is deleted. The API would refuse the other order.
    applicant: async ({ request, job }, use) => {
        const id = randomUUID().slice(0, 8);
        const person = { firstName: 'Ada', lastName: `Test-${id}`, email: `ada.test-${id}@example.com` };
        const response = await request.post('/api/applications', {
            multipart: { jobId: job.id, ...person, consent: 'true', cv: CV },
        });
        expect(response.status(), `POST /api/applications: ${await response.text()}`).toBe(201);
        const created = await response.json();

        await use({ id: created.id, reference: created.reference, ...person, name: `${person.firstName} ${person.lastName}` });

        await request.delete(`/api/applications/${created.id}`);
    },

    // An application that comes from the form under test has no fixture that removes it. The test registers the id here.
    // It depends on job, so it is torn down before job: the applications go first, then the job can be deleted.
    withdrawAfterTest: async ({ request, job }, use) => {
        const ids: string[] = [];
        await use((applicationId) => ids.push(applicationId));
        for (const id of ids) await request.delete(`/api/applications/${id}`);
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
