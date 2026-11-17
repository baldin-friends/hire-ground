import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

test('twelve positions are open', async ({ page }) => {
    await page.goto('/jobs');

    await expect(page.getByRole('status')).toHaveText('12 jobs');
    await expect(page.getByRole('article')).toHaveCount(12);
});

test.describe('search as you type', () => {
    // These tests only type into the search box. One page for all of them saves a page load each.
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto('/jobs');
        await expect(page.getByRole('status')).toHaveText('12 jobs');
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('finds jobs by a word in the title', async () => {
        await page.getByRole('searchbox', { name: 'Search jobs' }).fill('QA');

        await expect(page.getByRole('article')).toHaveCount(3);
        await expect(page.getByRole('article').first()).toContainText('Senior QA Engineer');
    });

    test('finds jobs by the name of the team', async () => {
        await page.getByRole('searchbox', { name: 'Search jobs' }).fill('Engineering');

        expect(await page.getByRole('article').count()).toBe(3);
    });
});

test('search and location narrow the list together', async ({ page }) => {
    await page.goto('/jobs');
    await page.getByRole('searchbox', { name: 'Search jobs' }).fill('Engineer');
    await page.getByLabel('Location').selectOption('Berlin');

    await expect(page.getByRole('status')).toHaveText('2 jobs');
    await expect(page.getByRole('link', { name: 'Test Automation Engineer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Frontend Developer (React)' })).toBeVisible();
});
