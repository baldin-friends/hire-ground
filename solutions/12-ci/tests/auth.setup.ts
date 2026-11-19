import { test as setup, expect } from '@playwright/test';

// One sign-in per run: in the pipeline, one per machine. The session goes to a file, and the config hands it to every test.
// The account comes from the environment. In the pipeline these are secrets of the repository;
// without them the account of the training application is used.
// https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
const email = process.env.E2E_USER || 'rita.recruiter@hireground.test';
const password = process.env.E2E_PASSWORD || 'hire-ground';

setup('sign in as recruiter', async ({ request }) => {
    const response = await request.post('/api/auth/login', { data: { email, password } });
    expect(response.ok(), `the sign-in of ${email}`).toBeTruthy();
    await request.storageState({ path: 'playwright/.auth/recruiter.json' });
});
