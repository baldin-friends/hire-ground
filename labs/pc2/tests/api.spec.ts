import { expect, test } from '@playwright/test';
import { cv, person, recruiter } from './data';

// The API without a browser: fast checks that run before anything is clicked.

test('API: twelve jobs are published', async ({ request }) => {
    const response = await request.get('/api/jobs');
    expect(response.status()).toBe(200);
    expect(await response.json()).toHaveLength(12);
});

test('API: a candidate applies and withdraws', async ({ request }) => {
    const created = await request.post('/api/applications', {
        multipart: { jobId: '1', ...person('api'), consent: 'true', cv },
    });
    expect(created.status()).toBe(201);
    const { id, withdrawToken } = await created.json();

    const withdrawn = await request.delete(`/api/applications/${id}`, { headers: { 'x-withdraw-token': withdrawToken } });
    expect(withdrawn.status()).toBe(204);
});

test('API: a recruiter rejects an application', async ({ request }) => {
    await request.post('/api/auth/login', { data: recruiter });
    const applications = await (await request.get('/api/applications')).json();
    const inInterview = applications.find((a: { stage: string }) => a.stage === 'interview');

    const response = await request.patch(`/api/applications/${inInterview.id}`, { data: { stage: 'rejected' } });
    expect(response.status()).toBe(200);
    expect((await response.json()).stage).toBe('rejected');
});
