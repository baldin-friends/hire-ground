import { expect, test, type Page } from '@playwright/test';
import { cv, person } from './data';

type Upload = { name: string; mimeType: string; buffer: Buffer };

/** Fills the application form. Submitting stays in the test. */
async function fillApplication(page: Page, email: string, file: Upload) {
    const p = person();
    await page.getByLabel('First name').fill(p.firstName);
    await page.getByLabel('Last name').fill(p.lastName);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(file);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();
}

// Step 13 · the happy path.
test('apply with a CV', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer/apply');
    await fillApplication(page, person().email, cv);
    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
    await expect(page.getByTestId('application-reference')).toHaveText(/^HG-\d{6}$/);
});

// Step 13 · three rejections, one loop.
const big = { ...cv, buffer: Buffer.alloc(5 * 1024 * 1024 + 1) };
const exe = { name: 'cv.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ') };

const rejected = [
    { name: 'missing email', email: '', file: cv, error: 'Please enter a valid email address.' },
    { name: 'CV too large', email: 'big@example.com', file: big, error: 'Your CV must not be larger than 5 MB.' },
    { name: 'wrong file type', email: 'exe@example.com', file: exe, error: 'Your CV must be a PDF or Word file.' },
];

for (const c of rejected) {
    test(`rejects: ${c.name}`, async ({ page }) => {
        await page.goto('/jobs/senior-qa-engineer/apply');
        await fillApplication(page, c.email, c.file);
        await page.getByRole('button', { name: 'Submit application' }).click();
        await expect(page.getByText(c.error)).toBeVisible();
    });
}

// Step 13 · the state, not only the message.
test('invalid fields are marked for assistive technology', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer/apply');
    await page.getByRole('button', { name: 'Submit application' }).click();
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('First name')).toBeFocused();
});

// Step 13 · done early: drop the file from outside the page.
test('drop the CV onto the drop zone', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer/apply');
    await page.getByTestId('cv-dropzone').drop({ files: cv });
    await expect(page.getByTestId('cv-selected')).toContainText('lebenslauf.pdf');
});
