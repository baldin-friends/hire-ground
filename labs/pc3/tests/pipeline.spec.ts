import { apply, fullName, person } from './data';
import { expect, test } from './fixtures';

let applicationId: string;

test('a new application lands in the first column', async ({ page, request }) => {
    const applicant = person('new');
    const application = await apply(request, 'frontend-developer-react', applicant);
    applicationId = application.id;

    await page.goto('/recruiter');
    const card = page.getByRole('region', { name: 'New' }).getByRole('article', { name: fullName(applicant) });
    await expect(card).toContainText('Frontend Developer (React)');

    await card.getByRole('link').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(fullName(applicant));
});

test('a recruiter can leave a note', async ({ page }) => {
    await page.goto(`/recruiter/applications/${applicationId}`);
    const note = `Call back on Monday. (${Date.now()})`;
    await page.getByLabel('Note').fill(note);
    await page.getByRole('button', { name: 'Add note' }).click();

    await expect(page.getByRole('status')).toHaveText('Note added.');
    await expect(page.getByText(note)).toBeVisible();
});

test('a card can be dragged to the next stage', async ({ page, request }) => {
    const applicant = person('drag');
    await apply(request, 'backend-developer-java', applicant);
    const name = fullName(applicant);

    await page.goto('/recruiter');
    const screening = page.getByRole('region', { name: 'Screening' });

    // by hand: dragTo() and the card animation did not get on
    await page.getByRole('article', { name }).hover();
    await page.mouse.down();
    await screening.hover();
    await page.mouse.up();

    await expect(screening.getByRole('article', { name })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(`${name} moved to Screening.`);
});

test('all six stages are on screen side by side', async ({ page }) => {
    await page.goto('/recruiter');

    for (const stage of ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']) {
        await expect(page.getByRole('region', { name: stage })).toBeInViewport();
    }
});

test('the CV can be downloaded from the candidate page', async ({ page, request }) => {
    const applicant = person('cv');
    await apply(request, 'site-reliability-engineer', applicant);

    await page.goto('/recruiter');
    await page.getByRole('link', { name: fullName(applicant) }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(fullName(applicant));
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download CV' }).click();
    expect((await download).suggestedFilename()).toBe('lebenslauf.pdf');
});
