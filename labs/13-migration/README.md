# Case 9 · From Selenide to Playwright

A Selenide suite cannot be translated into a good Playwright suite line by line. The lines translate; the habits
come along: a fixed candidate, tests that need each other, a sign-in through the form in every test, sleeps.
This case translates one test literally, and rewrites a second one.

**Time** warm-up 10 min · challenge 30 min · together on the projector

## What is in this folder

| Path | What |
|---|---|
| `selenide/` | a small Selenide suite for Hire Ground: `BaseTest`, two page objects, `JobSearchTest`, `CandidatePipelineTest`. Reference code: it compiles against Selenide 7.19.1 and JUnit 5.14.4, and it is not run in this course. |
| `tests/1-warm-up.spec.ts` | `JobSearchTest`, translated line by line, and then once more the way Playwright prefers it. Finished. |
| `tests/2-challenge.spec.ts` | `CandidatePipelineTest`, translated line by line. The starting point of the challenge. |
| `tests/auth.setup.ts` | the sign-in. The fixtures come from `support/fixtures.ts`: the ones of Case 4, and `withdrawAfterTest` |

Run `npx playwright test` in this folder once in a terminal before you open UI mode: that run signs in and saves
the session. UI mode does not run the `setup` project by itself.

## Warm-up

```bash
npx playwright test 1-warm-up
```

Read the first test next to `selenide/src/test/java/hireground/JobSearchTest.java`. Every Selenide line has a
Playwright line. Then read the second test: the same journey, without one id or class name.

## The challenge

```bash
npm run reset --prefix ../..          # once, in case the fixed candidate exists already
npx playwright test 2-challenge       # passes: 4 tests in about 9 seconds
npx playwright test 2-challenge       # fails: 1 failed, 2 did not run
```

The second run fails in test 1: the heading still says "Apply for Backend Developer (Java)", and the form shows
"You have already applied with this email address." Tests 2 and 3 never start.

Rewrite the file. Do not repair the translation.

1. Find the habits. Read the three tests and name what makes them depend on each other, on the data and on time.
2. Decide what is under test. The application form is tested through the browser once. Everything else a test
   needs gets there through the API.
3. `import { test, expect } from '../../../support/fixtures'`. The fixture `applicant` gives a test its own candidate with its
   own job; `withdrawAfterTest` removes an application that the form created.
4. Delete `test.use({ storageState … })` and `loginAsRecruiter`: the session comes from the config.
5. Replace every `waitForTimeout`: an assertion on the page, or `expect.poll` on `/api/mail?to=…` for the mail.
6. Replace ids, classes and XPath by role, label and text where the markup has them. The stage dropdown has no
   roles: keep CSS there, scoped to the row.

## Done when

```bash
npx playwright test 2-challenge --repeat-each=3 --workers=3
```

passes, every time, and leaves nothing behind: the candidates table still says "36 candidates" after `npm run reset`
and a run.

## Hints

<details>
<summary>Hint 1 · the habits</summary>

- `EMAIL` is the same in every run: the second application with it is refused.
- `reference` is written by test 1 and read by test 3: test 3 cannot run alone.
- Test 2 finds the candidate that test 1 created.
- Three sleeps, seven seconds in total, and still no guarantee.
- The mailbox assertion finds any mail with that subject, also one from last week.
- Nothing is cleaned up.

</details>

<details>
<summary>Hint 2 · the candidate's own data</summary>

```ts
test('a recruiter moves a candidate to Interview', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const row = page.getByRole('row', { name: applicant.name });
```

</details>

<details>
<summary>Hint 3 · cleaning up after the form</summary>

The form's own request answers with the id of the new application:

```ts
const created = page.waitForResponse((r) => r.url().endsWith('/api/applications') && r.request().method() === 'POST');
await page.getByRole('button', { name: 'Submit application' }).click();
withdrawAfterTest((await (await created).json()).id);
```

</details>

<details>
<summary>Hint 4 · the mail without a sleep</summary>

```ts
await expect
    .poll(async () => {
        const mails = await (await request.get('/api/mail', { params: { to: applicant.email } })).json();
        return mails.map((m) => m.subject);
    })
    .toContain(`Status update: ${job.title}`);
```

</details>

## Selenide to Playwright

`page` is the fixture of a test; `l` is a locator. Every Playwright line needs `await`.

| Selenide | Playwright | Read more |
|---|---|---|
| `open("/jobs")` | `page.goto('/jobs')` | [navigations](https://playwright.dev/docs/navigations) |
| `Configuration.baseUrl`, `browserSize`, `headless` | `use: { baseURL, viewport, headless }` in `playwright.config.ts` | [test-use-options](https://playwright.dev/docs/test-use-options) |
| `Configuration.browser = "firefox"` | one project per browser | [test-projects](https://playwright.dev/docs/test-projects) |
| `$("css")`, `$x("//xpath")` | `page.locator('css')`, `page.locator('xpath=//xpath')` | [other-locators](https://playwright.dev/docs/other-locators) |
| `$(byText("Apply"))` | `page.getByText('Apply', { exact: true })`; better: `getByRole('link', { name: 'Apply' })` | [locators](https://playwright.dev/docs/locators) |
| `$$(".card")` | `page.locator('.card')`: one locator matches any number of elements | [locators#lists](https://playwright.dev/docs/locators#lists) |
| `$$(…).filterBy(text("QA"))`, `findBy(…)`, `first()`, `get(2)` | `l.filter({ hasText: 'QA' })`, `l.first()`, `l.nth(2)` | [locators#filtering-locators](https://playwright.dev/docs/locators#filtering-locators) |
| `$(shadowCss("button", "hg-rating"))` | any locator: open shadow roots are searched by default | [locators#locate-in-shadow-dom](https://playwright.dev/docs/locators#locate-in-shadow-dom) |
| `shouldBe(visible)`, `shouldNotBe(visible)`, `should(disappear)` | `expect(l).toBeVisible()`, `expect(l).toBeHidden()` | [test-assertions](https://playwright.dev/docs/test-assertions) |
| `shouldHave(text("x"))`: part of the text, ignores case | `expect(l).toContainText('x')`: case-sensitive; `{ ignoreCase: true }` behaves like Selenide | [toContainText](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-contain-text) |
| `shouldHave(exactText("x"))` | `expect(l).toHaveText('x')` | [toHaveText](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text) |
| `$$(…).shouldHave(size(3))`, `texts("a", "b")` | `expect(l).toHaveCount(3)`, `expect(l).toHaveText(['a', 'b'])` | [toHaveCount](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-count) |
| `shouldHave(attribute("a", "b"))`, `value("x")`, `cssClass("c")` | `toHaveAttribute('a', 'b')`, `toHaveValue('x')`, `toHaveClass(/c/)` | [LocatorAssertions](https://playwright.dev/docs/api/class-locatorassertions) |
| `shouldBe(enabled)`, `disabled`, `checked` | `toBeEnabled()`, `toBeDisabled()`, `toBeChecked()` | [LocatorAssertions](https://playwright.dev/docs/api/class-locatorassertions) |
| `shouldHave(text("x"), Duration.ofSeconds(10))` | `toContainText('x', { timeout: 10_000 })` | [test-timeouts](https://playwright.dev/docs/test-timeouts) |
| `Configuration.timeout = 8000` (default 4 s) | `expect: { timeout: 8000 }` in the config (default 5 s) | [test-timeouts](https://playwright.dev/docs/test-timeouts) |
| `isDisplayed()`, `exists()`: look once | `l.isVisible()`, `l.count()`: look once. Not for assertions. | [isVisible](https://playwright.dev/docs/api/class-locator#locator-is-visible) |
| `setValue("x")`, `pressEnter()` | `l.fill('x')`, `l.press('Enter')` | [input](https://playwright.dev/docs/input) |
| `click()`, `doubleClick()`, `contextClick()`, `hover()` | `l.click()`, `l.dblclick()`, `l.click({ button: 'right' })`, `l.hover()` | [input](https://playwright.dev/docs/input#mouse-click) |
| `selectOption("Berlin")`, `selectOptionByValue("b")` | `l.selectOption({ label: 'Berlin' })`, `l.selectOption('b')` | [input#select-options](https://playwright.dev/docs/input#select-options) |
| `setSelected(true)` | `l.check()` or `l.setChecked(true)` | [input#checkboxes-and-radio-buttons](https://playwright.dev/docs/input#checkboxes-and-radio-buttons) |
| `uploadFile(file)`, `uploadFromClasspath("cv.pdf")` | `l.setInputFiles('cv.pdf')`, or a buffer: `{ name, mimeType, buffer }` | [input#upload-files](https://playwright.dev/docs/input#upload-files) |
| `File f = $("a").download()` | `const d = page.waitForEvent('download')`, click, `(await d).path()` | [downloads](https://playwright.dev/docs/downloads) |
| `switchTo().window(1)` | `const p = page.waitForEvent('popup')`, click, `await p` is a second `Page`: nothing to switch | [pages#handling-new-pages](https://playwright.dev/docs/pages#handling-new-pages) |
| `switchTo().frame("name")` | `page.frameLocator('iframe[name="name"]')` | [frames](https://playwright.dev/docs/frames) |
| `confirm()`, `dismiss()` | `page.on('dialog', (d) => d.accept())` before the click | [dialogs](https://playwright.dev/docs/dialogs) |
| `executeJavaScript("return …")` | `page.evaluate(() => …)` | [evaluating](https://playwright.dev/docs/evaluating) |
| `sleep(2000)` | an assertion that waits; `expect.poll` or `expect(…).toPass()` for things outside the page | [test-assertions#expectpoll](https://playwright.dev/docs/test-assertions#expectpoll) |
| `clearBrowserCookies()` between tests | nothing: every test gets a new browser context | [browser-contexts](https://playwright.dev/docs/browser-contexts) |
| a page object with `SelenideElement` fields | a class with `Locator` fields: both are lazy descriptions | [pom](https://playwright.dev/docs/pom) |
| `BaseTest`, `@BeforeAll`, a login helper | fixtures, and a saved session (`storageState`) | [test-fixtures](https://playwright.dev/docs/test-fixtures), [auth](https://playwright.dev/docs/auth) |
| `@TestMethodOrder`, `@Order(1)` | tests that do not need each other; `test.describe.serial` exists and is the exception | [test-parallel#serial-mode](https://playwright.dev/docs/test-parallel#serial-mode) |
| screenshot and page source on failure, Allure | a trace per failed test, the HTML report | [trace-viewer-intro](https://playwright.dev/docs/trace-viewer-intro), [test-reporters](https://playwright.dev/docs/test-reporters) |
| Selenoid or Selenium Grid, `Configuration.remote` | workers on one machine, shards across machines; the browsers come from `npx playwright install` or the Docker image | [test-parallel](https://playwright.dev/docs/test-parallel), [test-sharding](https://playwright.dev/docs/test-sharding), [docker](https://playwright.dev/docs/docker) |

Two things that have no row, because Selenide has no counterpart: a second user in the same test
([browser contexts](https://playwright.dev/docs/browser-contexts#multiple-contexts-in-a-single-test)), and the
network ([mock](https://playwright.dev/docs/mock), [API testing](https://playwright.dev/docs/api-testing)).

## TypeScript or Java?

Playwright has a Java library: <https://playwright.dev/java/docs/intro>. Locators, assertions (`assertThat(locator).hasText(…)`),
codegen (`--target=java-junit`) and the trace viewer are there. The test runner is not: Java tests run on JUnit or
TestNG, and the JUnit integration (`@UsePlaywright`) is marked experimental in the documentation. UI mode, fixtures,
projects, shards and the HTML report belong to Playwright Test, which is the Node.js runner used in this course.
See <https://playwright.dev/java/docs/test-runners> and <https://playwright.dev/java/docs/junit>.
