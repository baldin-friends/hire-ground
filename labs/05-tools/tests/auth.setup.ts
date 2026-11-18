import { test as setup, expect } from '@playwright/test';

// One sign-in for the whole run. The API is faster than the form, and the result is the same:
// a session cookie. storageState() writes it to a file; the config hands that file to every test.
// https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
setup('sign in as recruiter', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
        data: { email: 'rita.recruiter@hireground.test', password: 'hire-ground' },
    });
    expect(response.ok(), 'the sign-in request').toBeTruthy();
    await request.storageState({ path: 'playwright/.auth/recruiter.json' });
});
