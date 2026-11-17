import type { Locator, Page } from '@playwright/test';

type Person = { firstName: string; lastName: string; email: string };
type Upload = { name: string; mimeType: string; buffer: Buffer };

// A thin page object: locators and intent. The assertions stay in the test.
export class JobPage {
    readonly page: Page;
    readonly applyLink: Locator;
    readonly submit: Locator;

    constructor(page: Page) {
        this.page = page;
        this.applyLink = page.getByRole('link', { name: 'Apply' });
        this.submit = page.getByRole('button', { name: 'Submit application' });
    }

    async open(slug: string) {
        await this.page.goto(`/jobs/${slug}`);
    }

    async apply(person: Person, cv: Upload) {
        await this.applyLink.click();
        await this.page.getByLabel('First name').fill(person.firstName);
        await this.page.getByLabel('Last name').fill(person.lastName);
        await this.page.getByLabel('Email').fill(person.email);
        await this.page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
        await this.page.getByRole('checkbox', { name: /stores my data/ }).check();
        await this.submit.click();
    }
}
