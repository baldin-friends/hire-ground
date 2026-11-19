import { test as setup, expect } from '@playwright/test';

// Once per run, before the tests: Rita signs in, and the session is saved for every test.
setup('sign in as recruiter', async ({ request }) => {
    // The reset is the reason this suite is green with one worker. Step 5 deletes these three lines.
    const reset = await request.post('/api/test/reset');
    expect(reset.ok(), 'the reset request').toBeTruthy();

    const response = await request.post('/api/auth/login', {
        data: { email: 'rita.recruiter@hireground.test', password: 'hire-ground' },
    });
    expect(response.ok(), 'the sign-in request').toBeTruthy();
    await request.storageState({ path: 'playwright/.auth/recruiter.json' });
});
