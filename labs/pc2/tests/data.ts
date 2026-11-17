// Test data shared by the specs.

export const cv = {
    name: 'lebenslauf.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'),
};

/** A person no other test uses: parallel runs never collide on the e-mail address. */
export function person(prefix = 'erika') {
    const id = crypto.randomUUID().slice(0, 8);
    return { firstName: 'Erika', lastName: `Muster-${id}`, email: `${prefix}-${id}@example.com` };
}

export const recruiter = { email: 'rita.recruiter@hireground.test', password: 'hire-ground' };
