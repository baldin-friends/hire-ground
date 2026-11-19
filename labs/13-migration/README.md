# Case 9 · From Selenide to Playwright

A Selenide test translates to Playwright line by line. A class whose tests share data (a fixed candidate, a
fixed order) can be translated as it is, or changed on the way: by a person, or by an assistant that has your rules.
Nothing in that class is forced by Selenide; the same change is possible in Java.

**Time** 75 minutes · read and run together

## Run

```bash
cd labs/13-migration
npx playwright test job-search          # 2 passed: the test and the sign-in

cd ../../solutions/13-migration
npx playwright test candidate-pipeline.spec --repeat-each=3 --workers=3     # 7 passed, about 5 seconds
npx playwright test assistant --repeat-each=3 --workers=3                   # 13 passed
```

Open UI mode only after one run in a terminal: that run signs in and saves the session.

## Read

| File | What |
|---|---|
| `selenide/src/test/java/hireground/JobSearchTest.java` | example 1 in Selenide. The Java code is read here, not run. |
| `tests/job-search.spec.ts` | example 1, line by line: the Selenide line is the comment, the Playwright line is below it |
| `../../solutions/13-migration/tests/job-search.spec.ts` | example 1 by role, label and text |
| `selenide/src/test/java/hireground/CandidatePipelineTest.java` | example 2 in Selenide, an invented class: one fixed candidate, three tests in a fixed order |
| `../../solutions/13-migration/tests/candidate-pipeline.spec.ts` | example 2 in Playwright, written by a person: two tests that do not know each other, each with its own candidate |
| `migration-rules.md` | the rules of a rewrite, for a person and for an assistant |
| `prompt.md` | the prompt for an assistant. It writes `tests/candidate-pipeline.assistant.spec.ts`, which is not in the repository: you make it |
| `../../solutions/13-migration/assistant/candidate-pipeline.assistant.spec.ts` | example 2 as an assistant wrote it on 19 November, unchanged |
| `../../solutions/13-migration/tests/candidate-pipeline.assistant.spec.ts` | the same file after the review: three places marked `review:` |
| `../../handouts/selenide-to-playwright.md` | every Selenide call and its Playwright counterpart |

Three lines of example 1 do not translate one to one. They are numbered in `tests/job-search.spec.ts`:

1. `$()` takes the first match. A locator must match exactly one element: `.first()`.
2. Selenide's `text()` ignores case. `toContainText()` does not, unless you pass `ignoreCase`.
3. A count has no "at least": assert that the fourth element is visible.

## With an assistant

Try it yourself. The file the prompt asks for is not in the repository, so the result is your own.

```bash
# in the repository root, with Hire Ground running (npm run app)
claude "$(cat labs/13-migration/prompt.md)"                                           # Claude Code. Approve the file and the test runs
npx playwright test -c labs/13-migration assistant --repeat-each=3 --workers=3        # the tests it wrote. Run it twice
```

Another assistant with access to the repository: give it the text of `prompt.md`. A chat without access: paste
`migration-rules.md` and the Java class, and save the answer as `tests/candidate-pipeline.assistant.spec.ts`.
To try again, delete that file first. Git ignores it.

Then review your file:

| Check | What the result of 19 November had |
|---|---|
| Does it pass twice with `--repeat-each=3 --workers=3`? | yes: 13 passed |
| Labels and names: as the page shows them, or guessed? | a guessed label: `getByLabel(/consent\|agree/i)` |
| Helpers and comments: is the reason true? | a helper because "the row has no role". A table row has the role `row` |
| Who is signed in on each page? | the candidate's page was opened with the recruiter's session |
| What does each test prove, and what is missing? | four small tests. None follows the recruiter's click to the mail |

When a review finds a mistake, change `migration-rules.md` too.

Measured here with Claude Code 2.1.325, model Sonnet 5.5, one run each:

- 19 November, without the rules, class pasted into a chat: 24 seconds. The result fails on its second run.
- 19 November, with the rules and the repository: 76 seconds, 4 tests, 13 passed in parallel.
- 20 November, with `prompt.md` as it is now: 64 seconds, 3 tests, 10 passed in parallel, twice.

## Read more

- Locators: https://playwright.dev/docs/locators
- Assertions that wait: https://playwright.dev/docs/test-assertions
- Fixtures in place of a base class: https://playwright.dev/docs/test-fixtures
- One sign-in per run: https://playwright.dev/docs/auth
- Playwright for Java: https://playwright.dev/java/docs/intro
