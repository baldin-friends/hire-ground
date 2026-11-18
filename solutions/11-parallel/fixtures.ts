import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { openDatabase, type Database } from '../../support/db';

// Fixtures: https://playwright.dev/docs/test-fixtures
// Each test asks for the data it needs. The fixture creates it before the test and removes it afterwards,
// also when the test fails.

export type Job = { id: string; slug: string; title: string };
export type Applicant = { id: string; reference: string; firstName: string; lastName: string; name: string; email: string };
export type Account = { email: string; name: string };

type TestFixtures = {
    /** A published job that belongs to this test alone. */
    job: Job;
    /** A candidate who has applied for `job`. */
    applicant: Applicant;
};
type WorkerFixtures = {
    /** The application's database, for the few things no API can do. One connection per worker. */
    db: Database;
    /** The recruiter account of this worker: recruiter-1 for the first worker, recruiter-2 for the second, … */
    account: Account;
    /** The signed-in session of `account`: cookies, as storageState() returns them. */
    accountState: Awaited<ReturnType<import('@playwright/test').APIRequestContext['storageState']>>;
};

/** A date as YYYY-MM-DD, n days from today. A fixed date in a test is a failure with a start date. */
export const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

const CV = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };
const ACCOUNTS = 8; // recruiter-1 … recruiter-8@hireground.test

export const test = base.extend<TestFixtures, WorkerFixtures>({
    // ---- new today: one account per worker
    // https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker

    account: [
        async ({}, use, workerInfo) => {
            // parallelIndex is 0 … workers-1, and a worker that restarts after a failure keeps its number.
            const n = workerInfo.parallelIndex + 1;
            if (n > ACCOUNTS) throw new Error(`There are ${ACCOUNTS} recruiter accounts: run with --workers=${ACCOUNTS} or fewer.`);
            await use({ email: `recruiter-${n}@hireground.test`, name: `Recruiter ${n}` });
        },
        { scope: 'worker' },
    ],

    // Signs in once per worker, through the API, and keeps the session in memory.
    accountState: [
        async ({ playwright, account }, use, workerInfo) => {
            const api = await playwright.request.newContext({ baseURL: workerInfo.project.use.baseURL });
            const response = await api.post('/api/auth/login', { data: { email: account.email, password: 'hire-ground' } });
            expect(response.ok(), `sign-in of ${account.email}`).toBeTruthy();
            const state = await api.storageState();
            await api.dispose();
            await use(state);
        },
        { scope: 'worker' },
    ],

    // Every page and every `request` of a test starts with the session of this worker's account.
    storageState: ({ accountState }, use) => use(accountState),

    // ---- from case 4: data per test

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
