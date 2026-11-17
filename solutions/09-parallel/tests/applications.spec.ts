import { expect, test } from '@playwright/test';
import { cv, person } from './data';

// Confirmation mails. The app runs these tests with two teaching bugs:
// unique-email (one address may apply only once, across all jobs) and mail-delay (mails take 2 to 8 seconds).
// Fixed: every test brings its own person, so no two tests share an address.

for (const job of [
    { id: '1', title: 'Senior QA Engineer' },
    { id: '2', title: 'Backend Developer (Java)' },
]) {
    test(`applying for "${job.title}" sends a confirmation mail`, async ({ request }) => {
        const candidate = person('mail');
        const mails = async () => (await (await request.get(`/api/mail?to=${candidate.email}`)).json()).length;
        const before = await mails();

        const res = await request.post('/api/applications?bugs=unique-email,mail-delay', {
            multipart: { jobId: job.id, ...candidate, consent: 'true', cv },
        });
        expect(res.status()).toBe(201);
        const { id, withdrawToken } = await res.json();

        await expect.poll(mails, { timeout: 15_000 }).toBe(before + 1);

        await request.delete(`/api/applications/${id}`, { headers: { 'x-withdraw-token': withdrawToken } });
    });
}
