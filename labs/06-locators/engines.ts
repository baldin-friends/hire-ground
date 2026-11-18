import { test as base, expect } from '@playwright/test';

// A custom selector engine: https://playwright.dev/docs/extensibility#custom-selector-engines
//
//   page.locator('rating=4')    every <hg-rating> whose value PROPERTY is 4
//
// CSS cannot do this: the component keeps its value in a JavaScript property, not in an attribute.
// The function runs inside the page, so it must not use anything from outside its own body.
const ratingEngine = () => ({
    query(root: Element | Document, selector: string) {
        return this.queryAll(root, selector)[0];
    },
    queryAll(root: Element | Document, selector: string) {
        return Array.from(root.querySelectorAll('hg-rating')).filter((el) => String((el as any).value) === selector);
    },
});

// An engine is registered once per worker, before the first page exists.
// A worker-scoped fixture with auto: true does that without a line in the tests.
export const test = base.extend<{}, { selectorEngines: void }>({
    selectorEngines: [
        async ({ playwright }, use) => {
            await playwright.selectors.register('rating', ratingEngine);
            await use();
        },
        { scope: 'worker', auto: true },
    ],
});

export { expect };
