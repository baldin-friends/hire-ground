import { expect as baseExpect, type APIRequestContext, type Locator } from '@playwright/test';

export { test } from '@playwright/test';

// Custom matchers: https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend
// A matcher of your own is worth it when the same question comes up in many tests and the built-in
// answer needs knowledge about the markup ("the stage is the text of .hg-select__value").

export const expect = baseExpect.extend({
    /**
     * await expect(row).toHaveStage('Interview')
     * The candidate row shows this stage. It waits and retries, because it is built on a web-first assertion.
     */
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
