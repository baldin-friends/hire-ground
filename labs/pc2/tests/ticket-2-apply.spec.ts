import { expect, test } from '@playwright/test';
import { ApplyPage } from '../pages/apply-page';
import { cv, person } from './data';

test('a candidate applies for the backend job', async ({ page }) => {
    const form = new ApplyPage(page);
    const applicant = person('apply');

    await form.open('backend-developer-java');
    form.fill(applicant, cv);
    await form.submit();

    await expect(page.getByRole('heading', { name: 'Thank you for applying' })).toBeVisible();
    await expect(page.getByText(/HG-\d{6}/)).toBeVisible();
});
