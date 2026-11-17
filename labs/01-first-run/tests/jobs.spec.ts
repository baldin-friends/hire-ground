import { expect, test } from '@playwright/test';

// test('shows the job title', async({page}) => {
//     // Precondition: Open the jobs page
//     await page.goto('http://localhost:3000/jobs/senior-qa-engineer');

//     // Expectation: Heading is "Senior QA Engineer"
//     await expect(page.getByRole('heading', { name: 'Senior QA Engineer'})).toBeVisible();
// })

test.describe('the jobs page', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('http://localhost:3000/jobs/senior-qa-engineer');
    });

    test('shows the job title', async({page}) => {
        // Expectation: Heading is "Senior QA Engineer"
        await expect(page.getByRole('heading', { name: 'Senior QA Engineer'})).toBeVisible();
    })

    test('has Apply link', async ({page})=> {
        // Expect: Page has link named Apply
        await expect(page.getByRole('link', {name: "Apply"})).toBeVisible();
    })
});