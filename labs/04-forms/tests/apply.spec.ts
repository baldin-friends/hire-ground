import { expect, test, type Page } from '@playwright/test';
import { cv, person } from './data';

type Upload = { name: string; mimeType: string; buffer: Buffer };

/** Fills the application form. Submitting stays in the test. */
async function fillApplication(page: Page, email: string, file: Upload) {
    const p = person();
    // TODO 1: fill "First name" and "Last name" from p, and "Email" from the parameter
    // TODO 2: attach the file to the field "CV (PDF or Word, max. 5 MB)"
    // TODO 3: tick the consent checkbox. Its name is long: match a part of it, /stores my data/
}

// The happy path: a normal application gets through.
test('apply with a CV', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer/apply');
    await fillApplication(page, person().email, cv);

    // TODO 4: press "Submit application"
    // TODO 5: the heading "Thank you for applying" is visible
    // TODO 6: the element with the test id "application-reference" has a text like HG-123456

    throw new Error('TODO: write the steps above, then delete this line');
});

// Three rejections, one loop. Each entry becomes its own test in the report.
const big = { ...cv, buffer: Buffer.alloc(5 * 1024 * 1024 + 1) }; // the limit plus one byte
const exe = { name: 'cv.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ') };

const rejected = [
    { name: 'missing email', email: '', file: cv, error: 'Please enter a valid email address.' },
    // TODO 7: add "CV too large" (the file `big`) and "wrong file type" (the file `exe`).
    //         Submit each one by hand in the browser first and copy the error text from the page.
];

for (const c of rejected) {
    test(`rejects: ${c.name}`, async ({ page }) => {
        await page.goto('/jobs/senior-qa-engineer/apply');
        await fillApplication(page, c.email, c.file);
        // TODO 8: submit, then expect the error text c.error to be visible

        throw new Error('TODO: write the steps above, then delete this line');
    });
}

// TODO 9: one more test on state. Submit the empty form, then assert that
//         "Email" has aria-invalid="true", or that "First name" has the focus.
