import type { Locator, Page } from '@playwright/test';

type Person = { firstName: string; lastName: string; email: string };
type Upload = { name: string; mimeType: string; buffer: Buffer };

// Step 2 · a thin page object: locators and intent. The assertions stay in the test.
export class JobPage {
    readonly page: Page;
    readonly applyLink: Locator;
    readonly submit: Locator;

    constructor(page: Page) {
        this.page = page;
        this.applyLink = page.getByRole('link', { name: 'Apply' });
        this.submit = page.getByRole('button', { name: 'Submit application' });
    }

    /** Opens a posting, e.g. open('backend-developer-java'). */
    async open(slug: string) {
        // TODO: go to /jobs/<slug>
    }

    /** Applies for the open posting: Apply, fill the form, attach the CV, consent, submit. */
    async apply(person: Person, cv: Upload) {
        // TODO: you wrote these lines yesterday, in the form step. Here they use this.page instead of page.
    }
}
