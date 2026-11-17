import type { Page } from '@playwright/test';
import { apply, cv, erika, mailbox, person, type Person } from './data';
import { expect, test } from './fixtures';

async function fillRequiredFields(page: Page, who: Person) {
    await page.getByLabel('First name').fill(who.firstName);
    await page.getByLabel('Last name').fill(who.lastName);
    await page.getByLabel('Email').fill(who.email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();
}

// Erika's applications go away after each test, so the next one starts clean.
test.afterEach(async ({ request }) => {
    const applications: { id: string; email: string }[] = await (await request.get('/api/applications')).json();
    for (const application of applications.filter((a) => a.email === erika.email)) {
        await request.delete(`/api/applications/${application.id}`);
    }
});

test('five fields are enough to apply', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer');
    await page.getByRole('link', { name: 'Apply' }).click();
    await fillRequiredFields(page, erika);
    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
    await expect(page.getByTestId('application-reference')).toHaveText(/^HG-\d{6}$/);
    await expect(page.getByText(`We have sent a confirmation to ${erika.email}.`)).toBeVisible();

    await page.goto('/recruiter');
    await expect(page.getByRole('article', { name: 'Erika Example' })).toContainText('Senior QA Engineer');
    await page.getByRole('link', { name: 'Erika Example' }).click();
    await expect(page.getByText('lebenslauf.pdf')).toBeVisible();
});

test('the optional fields reach the recruiter', async ({ page }) => {
    await page.goto('/jobs/frontend-developer-react/apply');
    await fillRequiredFields(page, erika);
    await page.getByLabel('Phone (optional)').fill('+49 351 555 0199');
    await page.getByLabel('Earliest start date (optional)').fill('2027-02-01');
    await page.getByLabel('Salary expectation in € per year (optional)').fill('68000');
    await page.getByLabel('Cover letter (optional)').fill('I test, therefore I am.');
    await page.getByRole('button', { name: 'Submit application' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();

    await page.goto('/recruiter');
    await page.getByRole('link', { name: 'Erika Example' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Erika Example');
    await expect(page.getByText('+49 351 555 0199')).toBeVisible();
    await expect(page.getByText('01.02.2027')).toBeVisible();
    await expect(page.getByText('68.000 €')).toBeVisible();
    await expect(page.getByText('I test, therefore I am.')).toBeVisible();
});

test('a second application for the same job is refused', async ({ page, request }) => {
    await apply(request, 'backend-developer-java', erika);

    await page.goto('/jobs/backend-developer-java/apply');
    await fillRequiredFields(page, erika);
    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByRole('alert')).toHaveText('You have already applied with this email address.');
    await expect(page).toHaveURL(/\/apply$/);
});

test('an empty form names what is missing', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer/apply');
    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByText('Please enter your first name.')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Please upload your CV.')).toBeVisible();
    await expect(page.getByText('Please agree to the privacy notice.')).toBeVisible();
    await expect(page.getByLabel('First name')).toHaveAttribute('aria-invalid', 'true');
});

test('the applicant gets a confirmation mail', async ({ request }) => {
    const applicant = person('mail');
    const { reference } = await apply(request, 'test-automation-engineer', applicant);

    await expect.poll(async () => (await mailbox(request, applicant.email)).length, { timeout: 15_000 }).toBe(1);
    const [mail] = await mailbox(request, applicant.email);
    expect(mail.subject).toBe('Your application for Test Automation Engineer');
    expect(mail.body).toContain(reference);
});
