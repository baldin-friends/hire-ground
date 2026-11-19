# Frameworks · One spec, three frontends

The same career page, built in React, Angular and Vue. One spec file tests all three: a test talks to the page,
never to the framework.

**Time** 8 minutes · the finished example is `solutions/15-frameworks`

## Run it

```bash
cd solutions/15-frameworks
npx playwright test                      # 9 passed: three tests in three projects, from one spec file
npx playwright test --project=angular    # 3 passed: the Angular app alone
```

The three apps are prebuilt in `labs/15-frameworks/apps/<app>/dist`, and `apps/serve.mjs` serves them: React on
port 4301, Angular on 4302, Vue on 4303. No `npm install` is needed.

## Read it

| File | What it shows |
|---|---|
| `playwright.config.ts` | one project per app, each with its own `baseURL`; `webServer` as a list of three servers |
| `tests/careers.spec.ts` | three tests, and no line that names a framework |
| `labs/15-frameworks/apps/` | the sources: the dropdown is `react/src/Select.tsx`, `angular/src/app/select.ts`, `vue/src/SelectBox.vue` |

The dropdown is not a `<select>`, so `selectOption()` answers "Element is not a `<select>` element". Its options render
at the end of `<body>`, outside the form: a portal in React, a CDK overlay in Angular, a teleport in Vue. This dropdown
has ARIA roles, so `getByRole('combobox')` and `getByRole('option')` find it in all three. The stage dropdown of
Hire Ground (`labs/06-locators`) is the same overlay without roles.

## Try it

The starter is this folder, `labs/15-frameworks`: one project and one server are complete, and two tests are a TODO.

1. `npx playwright test`: 2 failed, both with `TODO`. `npx playwright test --project=angular` answers
   `Project(s) "angular" not found`.
2. Write the two tests in `tests/careers.spec.ts` and run them against React: `npx playwright test --project=react`.
   Three links are called "Apply": find the list item of the job first, then the link inside it.
3. Add the projects `angular` and `vue` and their servers to `playwright.config.ts`. `npx playwright test`: 6 passed.

<details>
<summary>Nearly the answer</summary>

```ts
const job = page.getByRole('listitem').filter({ hasText: 'Senior QA Engineer' });
await job.getByRole('link', { name: 'Apply' }).click();
await expect(page.getByRole('heading', { name: 'Apply: Senior QA Engineer' })).toBeVisible();
```

```ts
{ name: 'angular', use: { baseURL: 'http://localhost:4302' } },
```

```ts
{ command: 'node apps/serve.mjs angular 4302', url: 'http://localhost:4302', reuseExistingServer: !process.env.CI },
```

`net::ERR_CONNECTION_REFUSED at http://localhost:4302/` means: the project exists, and nothing serves its port.

</details>

## Angular's own way

`ng add playwright-ng-schematics` adds Playwright to an Angular workspace, and `ng e2e` runs it.

Warning: `npm install` downloads the Angular toolchain from the npm registry, about 400 packages and 260 MB.

```bash
cd labs/15-frameworks/apps/angular
npm install
npx ng add playwright-ng-schematics --skip-confirmation --defaults
npm install -D @playwright/test@1.64.1
npx ng e2e --test-project chromium
```

- The two flags answer the questions of `ng add` in advance: proceed, and do not download browsers.
- The schematic installs the newest `@playwright/test`. The fourth command goes back to the version of this course.
- `ng e2e` starts `ng serve` on port 4200 and runs `e2e/example.spec.ts`. The example expects the title "MyApp" and
  fails. Fix the title, then copy `careers.spec.ts` into `e2e/` and run `ng e2e` again.

## Read more

- Projects: <https://playwright.dev/docs/test-projects>
- Several web servers: <https://playwright.dev/docs/test-webserver#multiple-web-servers>
- Locators by role: <https://playwright.dev/docs/locators#locate-by-role>
- Angular schematics for Playwright: <https://github.com/playwright-community/playwright-ng-schematics>
