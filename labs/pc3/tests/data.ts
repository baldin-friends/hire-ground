import type { APIRequestContext } from '@playwright/test';

// Test data and two API shortcuts.

export type Person = { firstName: string; lastName: string; email: string };
export type Mail = { id: string; to: string; subject: string; body: string; createdAt: string };

/** A small but valid PDF. A buffer travels with the test: no file on disk. */
export const cv = {
    name: 'lebenslauf.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'),
};

/** Our standard applicant. */
export const erika: Person = { firstName: 'Erika', lastName: 'Example', email: 'erika.example@example.com' };

/** A new person on every call. */
export function person(prefix = 'applicant'): Person {
    const id = crypto.randomUUID().slice(0, 8);
    return { firstName: 'Erika', lastName: `Muster-${id}`, email: `${prefix}-${id}@example.com` };
}

export const fullName = (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`;

/** Applies through the API. `job` is a slug such as 'senior-qa-engineer'. */
export async function apply(request: APIRequestContext, job: string, who: Person) {
    const response = await request.post('/api/applications', { multipart: { jobId: job, ...who, consent: 'true', cv } });
    return (await response.json()) as { id: string; reference: string; withdrawToken: string };
}

/** Every mail the app has sent to this address, newest first. */
export async function mailbox(request: APIRequestContext, to: string) {
    const response = await request.get('/api/mail', { params: { to } });
    return (await response.json()) as Mail[];
}
