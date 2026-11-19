# Rules for moving a Selenide test to Playwright

For a person and for an assistant. Read them before you rewrite a class from `selenide/`.

## Before you write

1. Say in one sentence per test what it proves. Two things proved: two tests.
2. Only what is under test goes through the browser. Everything else a test needs is created through the API, by a fixture.

## Data

- No fixed name and no fixed e-mail address. Every run creates its own.
- Use the fixtures in `support/fixtures.ts`: `job`, `applicant`, `withdrawAfterTest`, `db`.
- A test removes what it created, also when it fails.
- No test reads what another test wrote: no `test.describe.serial`, no variable shared between tests.
- No count of everything ("36 candidates"). Search for the test's own data.

## The page

- Locators in this order: `getByRole` with a name, `getByLabel`, `getByText`, `getByTestId`.
- CSS only where the markup has no role, scoped to a row or a region. No XPath.
- No sign-in inside a test: the session comes from `tests/auth.setup.ts`.
- Open the page where the test starts, for example `/recruiter/candidates?q=…`.

## Waiting

- No `waitForTimeout`.
- For the page: an assertion that waits, `await expect(locator)…`.
- For something outside the page (a mail, a queue): `expect.poll`.
- No `isVisible()` in an `if` or in an assertion.

## Structure

- No page object that copies a Selenide class. A function for a component that several tests use: yes.
- Assertions take a locator: `await expect(locator).toHaveText(…)`, not `expect(await locator.textContent())`.

## Done when

`npx playwright test <file> --repeat-each=3 --workers=3` passes twice in a row, and the application has as many
jobs and candidates as before.

## Report

- what each test proves, in one sentence
- every place where CSS stayed, and why
- what you could not verify by running
