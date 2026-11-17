# Pair challenge 2 · Trace detective

Last night's pipeline run: six red tests, three green ones. 45 minutes. The tickets and their hints are in [TICKETS.md](TICKETS.md).

## Minutes 0–15 · artefacts only

```bash
cd labs/pc2
npx playwright show-report ci-report/
```

The recorded report opens in the browser. Every test in it has a trace: open the test, then **View Trace**. Stop the report server with Ctrl+C when you no longer need it.

A single trace without the report:

```bash
npx playwright show-trace ci-report/data/<name>.zip
```

Until minute 15 the editor stays closed and nothing is re-run. Write one hypothesis per ticket on paper: what happened, and which trace entry shows it.

## From minute 15 · reproduce, fix, prove

```bash
CI=1 npx playwright test                            # the pipeline's conditions on your laptop: six red, about 35 s
CI=1 npx playwright test ticket-3                   # one ticket
CI=1 npx playwright test ticket-3 --repeat-each=5   # the proof
npx playwright test ticket-3                        # the same test under laptop conditions
npx playwright show-report                          # the report of your own last run
```

Each ticket has one file in `tests/`, and the file name starts with the ticket number. `tests/api.spec.ts` holds the three green tests.

`CI=1` switches on what the pipeline has and a laptop has not. `playwright.config.ts` lists it at the top:

- the app as staging runs it, with three of its teaching bugs switched on
- a slow agent: 100 ms on top of every action
- the browser without the settings of a developer laptop

Without `CI=1` some of the six tests pass, at least when they run alone. That is a clue. It is not a fix.

Port 3000 taken? `PORT=3001 CI=1 npx playwright test` uses a second copy of the app.

## Rules

- Follow the debugging protocol: reproduce, isolate, hypothesis, evidence, fix the cause, prove.
- No `waitForTimeout`, no `retries`, no `force: true`, no longer timeouts, no `test.skip`.
- Fix the tests or the config. The app stays as it is.
- The `pipeline` block and the `slowMo` line in the config describe the pipeline. They stay.

## Done when

- A ticket is done when its test passes with `CI=1` and `--repeat-each=5`. Tickets 4, 5 and 6 name one more condition each.
- The challenge is done when `CI=1 npx playwright test --repeat-each=5 --workers=4` is green. Most pairs finish four tickets.

Every run in this folder first puts the course app back to its seed data (`global-setup.ts`). Applications from earlier labs are gone after the first run.
