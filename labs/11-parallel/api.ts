import { expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';

// One function per call to the API of Hire Ground. The fixtures in fixtures.ts use them.
// Titles and names get a random part, so a second run and a second worker never meet.

export type Job = { id: string; slug: string; title: string };
export type Applicant = { id: string; reference: string; firstName: string; lastName: string; name: string; email: string };

/** A date as YYYY-MM-DD, n days from today. A fixed date in a test is a failure with a start date. */
export const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/** A published job with a title nobody else has. */
export async function createJob(request: APIRequestContext): Promise<Job> {
    const response = await request.post('/api/jobs', {
        data: {
            title: `Fixture job ${randomUUID().slice(0, 8)}`,
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
    return response.json();
}

export async function deleteJob(request: APIRequestContext, job: Job) {
    await request.delete(`/api/jobs/${job.id}`);
}

/** A candidate with a name nobody else has, who has applied for the job. */
export async function createApplicant(request: APIRequestContext, job: Job): Promise<Applicant> {
    const id = randomUUID().slice(0, 8);
    const person = { firstName: 'Ada', lastName: `Test-${id}`, email: `ada.test-${id}@example.com` };
    const cv = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };
    const response = await request.post('/api/applications', {
        multipart: { jobId: job.id, ...person, consent: 'true', cv },
    });
    expect(response.status(), `POST /api/applications: ${await response.text()}`).toBe(201);
    const created = await response.json();
    return { id: created.id, reference: created.reference, ...person, name: `${person.firstName} ${person.lastName}` };
}

export async function deleteApplicant(request: APIRequestContext, applicant: Applicant) {
    await request.delete(`/api/applications/${applicant.id}`);
}
