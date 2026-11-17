import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Automated checks find part of the accessibility problems, and they find them on every run.
test('career page: no detectable WCAG A/AA violations', async ({ page }) => {
    await page.goto('/jobs?bugs=icon-save');
    await expect(page.getByRole('status')).toHaveText('12 jobs'); // scan the loaded page, not the spinner

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
});
