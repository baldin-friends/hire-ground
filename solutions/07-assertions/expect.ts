import { expect as baseExpect, type Locator } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test'; // for toHaveMail

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
        const value = row.locator('.hg-select__value');
        let pass: boolean;
        let matcherResult: any;
        try {
            const expectation = this.isNot ? baseExpect(value).not : baseExpect(value);
            await expectation.toHaveText(expected, options); // the retrying happens in here
            pass = true;
        } catch (e: any) {
            matcherResult = e.matcherResult;
            pass = false;
        }
        if (this.isNot) pass = !pass;

        const message = () =>
            this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            `Locator: ${row}\n` +
            `Expected stage: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expected)}\n` +
            (matcherResult ? `Received stage: ${this.utils.printReceived(matcherResult.actual)}` : '');

        return { message, pass, name: assertionName, expected, actual: matcherResult?.actual };
    },

    // Done early: a matcher for the mailbox
    /**
     * await expect(request).toHaveMail('ada@example.com', 'Invitation to an interview: …')
     * A mail with this subject has arrived. Mail is sent by a queue, so the matcher asks the mailbox
     * until the mail is there: expect.poll does the asking.
     */
    async toHaveMail(request: APIRequestContext, to: string, subject: string, options?: { timeout?: number }) {
        const assertionName = 'toHaveMail';
        if (this.isNot) throw new Error('toHaveMail has no .not: "no mail arrives" needs a time limit you choose yourself.');
        let subjects: string[] = [];
        let pass = true;
        try {
            await baseExpect
                .poll(
                    async () => {
                        const response = await request.get('/api/mail', { params: { to } });
                        subjects = (await response.json()).map((mail: { subject: string }) => mail.subject);
                        return subjects;
                    },
                    { timeout: options?.timeout ?? 10_000 },
                )
                .toContain(subject);
        } catch {
            pass = false;
        }

        const message = () =>
            this.utils.matcherHint(assertionName, undefined, undefined) +
            '\n\n' +
            `Mailbox of: ${to}\n` +
            `Expected a mail with the subject: ${this.utils.printExpected(subject)}\n` +
            `Received these subjects: ${this.utils.printReceived(subjects)}`;

        return { message, pass, name: assertionName, expected: subject, actual: subjects };
    },
});
