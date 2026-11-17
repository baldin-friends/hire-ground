import type { Page } from '@playwright/test';

type Person = { firstName: string; lastName: string; email: string };
type File = { name: string; mimeType: string; buffer: Buffer };

// The application form as a thin page object: locators and intent, no assertions.
export class ApplyPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open(slug: string) {
        await this.page.goto(`/jobs/${slug}/apply`);
    }

    async fill(person: Person, cv: File) {
        await this.page.getByLabel('First name').fill(person.firstName);
        await this.page.getByLabel('Last name').fill(person.lastName);
        await this.page.getByLabel('Email').fill(person.email);
        await this.page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
        await this.page.getByRole('checkbox', { name: /stores my data/ }).check();
    }

    async submit() {
        await this.page.getByRole('button', { name: 'Submit application' }).click();
    }
}
