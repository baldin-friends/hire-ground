import { expect as baseExpect, type Locator } from '@playwright/test';

export { test } from '@playwright/test';

// Custom matchers: https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend
//
// Step 4 of the challenge: write toHaveStage, so that a test can say
//
//     await expect(row).toHaveStage('Interview');
//
// A matcher is a function that gets the value from expect(...) first, then the arguments.
// It returns { pass, message, name, expected, actual }.

export const expect = baseExpect.extend({
    async toHaveStage(row: Locator, expected: string, options?: { timeout?: number }) {
        const assertionName = 'toHaveStage';
        // TODO 1: the stage of a row is the text of  row.locator('.hg-select__value')
        // TODO 2: let a web-first assertion do the waiting:
        //           const expectation = this.isNot ? baseExpect(value).not : baseExpect(value);
        //           await expectation.toHaveText(expected, options);
        //         It throws when it gives up. Catch that: the error has  e.matcherResult.actual
        // TODO 3: return pass, and a message that names the locator, the expected and the received stage
        throw new Error('TODO: write toHaveStage in labs/07-assertions/expect.ts');
    },
});
