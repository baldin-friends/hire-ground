import { test as setup, expect } from '@playwright/test';

// Once per run: the database goes back to its seed, and Rita signs in.
// The reset is the reason this suite is green with one worker. A staging system has no such button,
// and two people who run the suite at the same time reset each other.
setup('reset the data and sign in as recruiter', async ({ request }) => {
    const reset = await request.post('/api/test/reset');
    expect(reset.ok(), 'the reset request').toBeTruthy();

    const response = await request.post('/api/auth/login', {
        data: { email: 'rita.recruiter@hireground.test', password: 'hire-ground' },
    });
    expect(response.ok(), 'the sign-in request').toBeTruthy();
    await request.storageState({ path: 'playwright/.auth/recruiter.json' });
});
