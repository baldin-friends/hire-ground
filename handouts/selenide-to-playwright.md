# From Selenide to Playwright, call by call

A reference for moving a test. The Selenide names are those of Selenide 7.19.1. Every Playwright line on this sheet
ran against Playwright 1.64.1.
Course: Playwright · End-to-end testing for web applications

`page` is the fixture of a test, `l` is a locator. Every Playwright call needs `await`, except the ones that
only describe an element (`page.locator(…)`, `page.getByRole(…)`, `l.filter(…)`, `l.first()`).

## Open and find

| Selenide | Playwright |
|---|---|
| `open("/jobs")` | `page.goto('/jobs')` |
| `refresh()`, `back()` | `page.reload()`, `page.goBack()` |
| `$("#q")`, `$x("//button")` | `page.locator('#q')`, `page.locator('xpath=//button')` |
| `$(byText("Apply"))` | `page.getByText('Apply', { exact: true })` |
| `$(withText("Appl"))` | `page.getByText('Appl')` |
| `$(byRole("button", "Apply"))` (since 7.17) | `page.getByRole('button', { name: 'Apply' })` |
| `$(byLabel("Email"))`, `$(byPlaceholder("Search"))` (since 7.12) | `page.getByLabel('Email')`, `page.getByPlaceholder('Search')` |
| `$(byTestId("row"))`: attribute `data-test-id` | `page.getByTestId('row')`: attribute `data-testid`. Both can be set. |
| `$(".row").$(".name")`, `.find(".name")` | `page.locator('.row').locator('.name')` |
| `$(shadowCss("button", "hg-rating"))` | any locator: open shadow roots are searched by default |

`$()` takes the first element that matches. A locator must match exactly one element when you act on it or
assert on it. With twelve matches it fails at once: "strict mode violation". Say `.first()`, or describe the one
element you mean.

Read more: [locators](https://playwright.dev/docs/locators) · [other locators](https://playwright.dev/docs/other-locators)

## Conditions

| Selenide | Playwright |
|---|---|
| `shouldBe(visible)`, `should(appear)` | `expect(l).toBeVisible()` |
| `shouldBe(hidden)`, `should(disappear)`, `shouldNot(exist)` | `expect(l).toBeHidden()` |
| `shouldHave(text("x"))`: part of the text, ignores case | `expect(l).toContainText('x', { ignoreCase: true })` |
| `shouldHave(exactText("x"))`: the whole text, ignores case | `expect(l).toHaveText('x', { ignoreCase: true })` |
| `textCaseSensitive("x")`, `exactTextCaseSensitive("x")` | `toContainText('x')`, `toHaveText('x')` |
| `shouldHave(value("x"))`, `attribute("a", "b")`, `cssClass("c")` | `toHaveValue('x')`, `toHaveAttribute('a', 'b')`, `toHaveClass(/c/)` |
| `shouldBe(enabled)`, `disabled`, `checked`, `empty` | `toBeEnabled()`, `toBeDisabled()`, `toBeChecked()`, `toBeEmpty()` |
| `shouldHave(text("x"), Duration.ofSeconds(10))` | `toContainText('x', { timeout: 10_000 })` |
| `webdriver().shouldHave(urlContaining("/jobs"))` | `expect(page).toHaveURL(/\/jobs/)` |
| `isDisplayed()`, `exists()`: look once | `l.isVisible()`, `l.count()`: look once. Not for assertions. |
| `getText()`, `getAttribute("a")`, `getValue()` | `l.innerText()`, `l.getAttribute('a')`, `l.inputValue()` |

Selenide's `text` and `exactText` ignore case. Playwright's `toContainText` and `toHaveText` do not, unless you
pass `ignoreCase`. A translated assertion can fail on one capital letter.

Read more: [assertions](https://playwright.dev/docs/test-assertions) · [LocatorAssertions](https://playwright.dev/docs/api/class-locatorassertions)

## Collections

| Selenide | Playwright |
|---|---|
| `$$(".card")` | `page.locator('.card')`: one locator matches any number of elements |
| `$$(…).shouldHave(size(3))` | `expect(l).toHaveCount(3)` |
| `shouldHave(sizeGreaterThanOrEqual(4))` | no counterpart: `expect(l.nth(3)).toBeVisible()` |
| `shouldHave(exactTexts("a", "b"))` | `expect(l).toHaveText(['a', 'b'])` |
| `filterBy(text("QA"))`, `excludeWith(text("QA"))` | `l.filter({ hasText: 'QA' })`, `l.filter({ hasNotText: 'QA' })` |
| `findBy(text("QA"))`, `first()`, `last()`, `get(2)` | `l.filter({ hasText: 'QA' })`, `l.first()`, `l.last()`, `l.nth(2)` |
| `texts()` | `l.allTextContents()` |

Read more: [lists](https://playwright.dev/docs/locators#lists) · [filtering](https://playwright.dev/docs/locators#filtering-locators)

## Actions

| Selenide | Playwright |
|---|---|
| `setValue("x")`, `clear()` | `l.fill('x')`, `l.clear()` |
| `type("x")`: key by key | `l.pressSequentially('x')` |
| `pressEnter()`, `pressTab()`, `pressEscape()` | `l.press('Enter')`, `l.press('Tab')`, `l.press('Escape')` |
| `click()`, `doubleClick()`, `contextClick()`, `hover()` | `l.click()`, `l.dblclick()`, `l.click({ button: 'right' })`, `l.hover()` |
| `shouldBe(visible).click()` | `l.click()`: it waits for a visible, enabled element itself |
| `selectOption("Berlin")`, `selectOptionByValue("b")` | `l.selectOption({ label: 'Berlin' })`, `l.selectOption('b')` |
| `setSelected(true)` | `l.check()`, or `l.setChecked(true)` |
| `uploadFile(file)`, `uploadFromClasspath("cv.pdf")` | `l.setInputFiles('path/cv.pdf')`, or `{ name, mimeType, buffer }` |
| `File f = $("a").download()` | `const d = page.waitForEvent('download')`, click, `await (await d).path()` |
| `scrollIntoView(…)` | nothing: an action scrolls by itself. `l.scrollIntoViewIfNeeded()` exists. |
| `screenshot("name")` | `page.screenshot({ path })`, `l.screenshot({ path })` |

Read more: [actions](https://playwright.dev/docs/input) · [downloads](https://playwright.dev/docs/downloads)

## Windows, frames, dialogs, JavaScript

| Selenide | Playwright |
|---|---|
| `switchTo().window(1)` | `const p = page.waitForEvent('popup')`, click, `const tab = await p` |
| `switchTo().window(0)` | nothing: `page` and `tab` are two objects, both usable |
| `switchTo().frame("pay")` | `page.frameLocator('iframe[name="pay"]')`: a place to search in |
| `confirm()`, `dismiss()` | `page.once('dialog', (d) => d.accept())` before the click; `d.dismiss()` |
| `executeJavaScript("return document.title")` | `page.evaluate(() => document.title)` |
| `clearBrowserCookies()` between tests | nothing: every test gets a new browser context |

Read more: [pages](https://playwright.dev/docs/pages) · [frames](https://playwright.dev/docs/frames) · [dialogs](https://playwright.dev/docs/dialogs) · [evaluating](https://playwright.dev/docs/evaluating)

## Waiting

| Selenide | Playwright |
|---|---|
| `sleep(2000)` | for the page: an assertion, it waits. For a mail or a queue: `expect.poll(…)` |
| `Wait().until(…)` | `expect.poll(…)`, or `expect(async () => { … }).toPass()` |
| `Configuration.timeout = 8000` (default 4 s) | `expect: { timeout: 8000 }` in the config (default 5 s) |
| `Configuration.pageLoadTimeout` (default 30 s) | `use: { navigationTimeout }`; the test itself has 30 s: `timeout` |
| `Configuration.assertionMode = SOFT` | `expect.soft(l)…` for the assertions that may fail without stopping the test |

Selenide's own documentation on `sleep`: "Not recommended. Test should not sleep, but should wait for some
condition instead."

Read more: [auto-waiting](https://playwright.dev/docs/actionability) · [expect.poll](https://playwright.dev/docs/test-assertions#expectpoll) · [timeouts](https://playwright.dev/docs/test-timeouts)

## Around the test

| Selenide and its companions | Playwright |
|---|---|
| `Configuration.baseUrl`, `browserSize`, `headless` | `use: { baseURL, viewport, headless }` in `playwright.config.ts` |
| `Configuration.browser = "firefox"` | one project per browser, all in one run |
| `BaseTest`, `@BeforeEach`, `@AfterEach` | fixtures: setup, the test, teardown in one function |
| a login helper in every test | one sign-in per run, saved as `storageState` |
| a page object with `SelenideElement` fields | a class with `Locator` fields, or a function per component |
| `@TestMethodOrder`, `@Order(1)`, a static field | tests that do not need each other; `test.describe.serial` is the exception |
| `@Step`, `Allure.step("…")` | `await test.step('…', async () => { … })` |
| `@Tag("smoke")` | `test('…', { tag: '@smoke' }, …)` and `--grep @smoke` |
| screenshot and page source on failure | a trace: every action, the page before and after, the network, the console |
| Allure report | the HTML report; `allure-playwright` exists if Allure has to stay |
| REST Assured for test data | the `request` fixture; it can share the session of the browser |
| the Selenide proxy for the network | `page.route(…)`: stub, change or fail a request |
| JUnit parallel execution | workers: on by default, one browser per worker |
| Selenoid or Selenium Grid, `Configuration.remote` | shards across machines; the browsers come with `npx playwright install` or the Docker image |

Read more: [configuration](https://playwright.dev/docs/test-configuration) · [fixtures](https://playwright.dev/docs/test-fixtures) · [sign-in](https://playwright.dev/docs/auth) · [trace viewer](https://playwright.dev/docs/trace-viewer-intro) · [mock](https://playwright.dev/docs/mock) · [sharding](https://playwright.dev/docs/test-sharding)

## Six things that do not translate one to one

1. **The first match.** `$(".job-card")` is the first of twelve. `page.locator('.job-card')` is all twelve, and an action on it fails.
2. **Case.** `text("remote possible")` matches "Remote possible". `toContainText('remote possible')` does not.
3. **"At least".** There is no `sizeGreaterThanOrEqual`. Assert the element you need: `l.nth(3)`.
4. **One browser.** Selenide keeps its browser between tests: a sign-in in test 2 still holds in test 3. In Playwright every test starts in a new browser context.
5. **Order.** `@Order` and a static field translate into `test.describe.serial`, and one failure then skips the rest. Give each test its own data instead.
6. **`await`.** Java blocks on every call. A Playwright call without `await` has not happened yet when the next line runs. ESLint finds it: `@typescript-eslint/no-floating-promises`.

## If you stay in Java

Playwright has a Java library: <https://playwright.dev/java/docs/intro>. Locators, assertions that wait
(`assertThat(locator).hasText(…)`), codegen (`--target=java-junit`) and the trace viewer are there. The test runner
is not: Java tests run on JUnit or TestNG. Fixtures, projects, shards, UI mode and the HTML report belong to
Playwright Test, the Node.js runner of this course.

An example in the repository: `labs/13-migration` (the Selenide classes, the line-by-line translation, the rules
for an assistant) and `solutions/13-migration` (the same tests, rewritten).
