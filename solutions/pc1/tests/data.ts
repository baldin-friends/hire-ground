// Test data for the tickets. The same helpers as in step 13.

/** A small but valid PDF. */
export const cv = {
    name: 'lebenslauf.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'),
};

/** A person no other test uses: the e-mail address is new on every call. */
export function person(prefix = 'erika') {
    const id = crypto.randomUUID().slice(0, 8);
    return { firstName: 'Erika', lastName: `Muster-${id}`, email: `${prefix}-${id}@example.com` };
}
