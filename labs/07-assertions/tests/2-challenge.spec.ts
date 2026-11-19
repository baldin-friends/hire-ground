import { test, expect } from '../expect';

test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset'); // a fresh database for every test; case 4 gets rid of this
});

// The recruiter invites Luis Hartmann to an interview. The test proves three things:
// the page confirms it, the candidate gets a mail, and the table shows the new stage.
//
// This version reads everything once and sleeps where it is unsure. Run it. The steps are in README.md.

test('an invitation to an interview reaches the candidate', async ({ page, request }) => {
    await page.goto('/recruiter/candidates');
    await page.getByLabel('Search').fill('Luis Hartmann');
    await page.waitForTimeout(2000); // the search needs a moment
    await page.getByRole('link', { name: 'Luis Hartmann' }).click();

    await page.getByLabel('Date and time').fill('2026-11-26T10:00');
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    expect(await page.getByText('Interview scheduled.').isVisible()).toBe(true);

    // the candidate gets a mail
    const response = await request.get('/api/mail?to=luis.hartmann@example.com');
    const mails = await response.json();
    expect(mails[0].subject).toBe('Invitation to an interview: Senior QA Engineer');

    // the table shows the new stage
    await page.goto('/recruiter/candidates');
    await page.getByLabel('Search').fill('Luis Hartmann');
    await page.waitForTimeout(2000);
    const stage = await page.getByRole('row', { name: 'Luis Hartmann' }).locator('.hg-select__value').textContent();
    expect(stage).toBe('Interview');
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The steps of the challenge as code, ready to copy. Try each step yourself first.
// To use a piece: copy its lines to the place named, select them, and remove the comment (Cmd+/ or Ctrl+/).
// The numbers are the steps in README.md. The finished files: solutions/07-assertions/tests/2-challenge.spec.ts and expect.ts
//
// Step 1 · the message. Instead of the line with isVisible():
//     await expect(page.getByText('Interview scheduled.')).toBeVisible();
// Run it: the next failure is the mail. "Cannot read properties of undefined (reading 'subject')" means: no mail yet.
//
// Step 2 · the mail. Instead of the three lines from  const response  to  expect(mails[0].subject):
//     await expect
//         .poll(async () => {
//             const response = await request.get('/api/mail', { params: { to: 'luis.hartmann@example.com' } });
//             return (await response.json()).map((mail: { subject: string }) => mail.subject);
//         }, { timeout: 10_000 })
//         .toContain('Invitation to an interview: Senior QA Engineer');
// Run it: green, and four seconds of it are sleep.
//
// Step 3 · no sleep. Delete both lines with page.waitForTimeout(2000). Nothing takes their place.
// Run it: green. click() waits for the link. textContent() waits for the row, then reads once: step 4 replaces it.
//
// Step 4 · the matcher. In expect.ts, instead of the lines from  // TODO 1  to  throw new Error(…):
//         const value = row.locator('.hg-select__value');
//         let pass: boolean;
//         let matcherResult: any;
//         try {
//             const expectation = this.isNot ? baseExpect(value).not : baseExpect(value);
//             await expectation.toHaveText(expected, options); // the retrying happens in here
//             pass = true;
//         } catch (e: any) {
//             matcherResult = e.matcherResult;
//             pass = false;
//         }
//         if (this.isNot) pass = !pass;
//
//         const message = () =>
//             this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
//             '\n\n' +
//             `Locator: ${row}\n` +
//             `Expected stage: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expected)}\n` +
//             (matcherResult ? `Received stage: ${this.utils.printReceived(matcherResult.actual)}` : '');
//
//         return { message, pass, name: assertionName, expected, actual: matcherResult?.actual };
// and here in the test, instead of the two lines from  const stage  to  expect(stage):
//     await expect(page.getByRole('row', { name: 'Luis Hartmann' })).toHaveStage('Interview');
// Run it: green. Before the matcher is written, the test fails with "TODO: write toHaveStage".
//
// Step 5 · read the message of your matcher. Write 'Offer' instead of 'Interview', run it, and change it back.
// After five seconds it says:  Expected stage: "Offer"  and  Received stage: "Interview"
//
// Done early · a date that does not age. Above the test:
// const tomorrowAt = (hhmm: string) => `${new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}T${hhmm}`;
// and in the test, instead of the line with .fill('2026-11-26T10:00'):
//     await page.getByLabel('Date and time').fill(tomorrowAt('10:00'));
