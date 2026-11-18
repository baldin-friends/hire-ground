import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// An automated scan finds part of the accessibility problems, and it finds them on every run.
// https://playwright.dev/docs/accessibility-testing
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test('career page: no detectable WCAG A/AA violations', async ({ page }) => {
    await page.goto('/jobs?bugs=icon-save');
    await expect(page.getByRole('status')).toHaveText('12 jobs'); // scan the loaded page, not the spinner

    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations).toEqual([]);
});

test('candidates table: no detectable WCAG A/AA violations', async ({ page }) => {
    // page.request shares its cookies with the page: one request signs the recruiter in
    await page.request.post('/api/auth/login', {
        data: { email: 'rita.recruiter@hireground.test', password: 'hire-ground' },
    });
    await page.goto('/recruiter/candidates');
    await expect(page.getByRole('table')).toHaveAttribute('aria-busy', 'false'); // the rows have arrived

    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    // id, number of elements: short enough to read in the terminal. The report has the full list.
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} elements`)).toEqual([]);
});
