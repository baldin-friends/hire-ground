# TypeScript for test writers

One sheet. Everything you need to read and write a Playwright test, and nothing else.
Course: Playwright · End-to-end testing for web applications

## One test, read line by line

```ts
import { expect, test } from '@playwright/test';          // 1
import { cv, person } from './data';                       // 2

test('apply with a CV', async ({ page }) => {              // 3
    const p = person();                                    // 4
    await page.goto('/jobs/senior-qa-engineer/apply');     // 5
    await page.getByLabel('Email').fill(p.email);          // 6
    await page.getByLabel('First name').fill(`${p.firstName} Maria`);   // 7
    await expect(page.getByTestId('application-reference')).toHaveText(/^HG-\d{6}$/);   // 8
});
```

| Line | What it says |
|---|---|
| 1 | Take `expect` and `test` from the Playwright package. Curly braces pick things by name. |
| 2 | Take two things from our own file `data.ts` in the same folder. No file ending. |
| 3 | A test has a name and a function. `async` allows `await` inside. `{ page }` asks Playwright for a fresh browser page. |
| 4 | `const` names a value that does not change. `person()` calls a function; the result is an object. |
| 5 | `await` waits until the browser has done it. Every Playwright action and every `expect` on a locator needs it. |
| 6 | `p.email` reads one field of the object. Calls chain from left to right: find the field, then fill it. |
| 7 | Backticks make a string with values inside: `${…}` is replaced by the value. |
| 8 | `/…/` is a regular expression: here "HG-, then six digits". Use it when you know the shape, not the value. |

## The few words you will type

| You write | It means |
|---|---|
| `const name = 'Erika';` | a value with a name; `let` if it has to change later |
| `'text'` · `"text"` · `` `text ${value}` `` | three kinds of strings; only backticks take `${…}` |
| `{ firstName: 'Erika', email: 'e@example.com' }` | an object: named fields |
| `['Dresden', 'Hamburg']` | an array: a list |
| `{ ...p, consent: 'true' }` | a copy of `p` with one more field |
| `const { id, token } = await res.json();` | take two fields out of an object in one line |
| `(route) => route.fulfill({ json: [] })` | a short function: parameter, arrow, result |
| `async (route) => { await …; }` | the same with several lines and `await` inside |
| `for (const c of cases) { … }` | once for every entry of a list |
| `if (x === 3) { … }` | `===` compares; `=` assigns |
| `p.firstName` · `cases[0]` · `cases.length` | a field, the first entry, the number of entries |
| `// a comment` | ignored by the computer, read by your colleagues |

## What the types are for

```ts
async function fillApplication(page: Page, email: string, file: Upload) { … }
```

`: Page`, `: string` say what kind of value belongs there. They change nothing at run time.
Their use: the editor completes names for you and marks mistakes in red before you run anything.
A red underline is the editor reading your code. Hover over it; the message usually says what it expected.

## Three mistakes everybody makes once

| Symptom | Cause |
|---|---|
| The test is green, and it did not do what it says | a missing `await`: the test sent the instruction and did not wait |
| `expect(received).toBe(expected)` fails with `Received: Promise` or `Locator` | `await` is missing inside `expect(…)`, or you compare a locator instead of asserting on it |
| `x is not a function` or `Cannot read properties of undefined` | a typo in a name, or a value that is not there yet: read the line number in the error first |

## Where to look things up

- Playwright: https://playwright.dev/docs/writing-tests
- The language itself: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- In VS Code: hover over any name, or press F12 to jump to where it is defined.
