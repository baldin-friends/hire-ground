# Pair challenge 1 · Locator traps

Eight red tests, eight tickets, 45 minutes. The tickets and their hints are in [TICKETS.md](TICKETS.md).

## Start

```bash
cd labs/pc1
npx playwright test
```

Eight tests fail. Ticket 5 takes 30 seconds to do so. Playwright starts the course app if it is not running yet.

## Work on one ticket

```bash
npx playwright test ticket-3                    # the test of ticket 3
npx playwright test ticket-3 --ui               # the same in UI mode, with Pick locator
npx playwright test ticket-3 --repeat-each=5    # the proof
npx playwright show-report                      # the last run: every red test has a trace
```

Each ticket has one file in `tests/`, and the file name starts with the ticket number.

## Rules

- No CSS, no XPath. `locator('#id')`, `locator('.class')` and `locator('//h1')` are out. `getByRole`, `getByLabel`, `getByText`, `getByTestId`, `filter()` and `within()` are in.
- The `?bugs=…` in the first URL switches the trap on. It stays. A test that passes without it has solved nothing.
- No `waitForTimeout`, no `force: true`, no `test.skip`.
- Fix the test, unless the ticket convinces you that the app is wrong.

## Done when

- A ticket is done when its test passes with `--repeat-each=5`. Tickets 4 and 5 depend on timing and chance: they ask for `--repeat-each=10`.
- The challenge is done when `npx playwright test --repeat-each=10` is green. Most pairs finish five or six tickets.

Ticket 6 sends one application to the course app on every run. A restart of the app removes them.
