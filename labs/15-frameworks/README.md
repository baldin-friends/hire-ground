# Frameworks · One test, three frontends

The same career page, built in React, Angular and Vue. One spec file tests all three: a test talks to the page,
never to the framework.

**Time** 10 min · together on the projector

## The situation

Three one-page apps in `labs/15-frameworks/apps/`. They show the same career page with the same labels.

| App | Folder | Port | The dropdown is in |
|---|---|---|---|
| React | `labs/15-frameworks/apps/react/` | 4301 | `src/Select.tsx` |
| Angular | `labs/15-frameworks/apps/angular/` | 4302 | `src/app/select.ts` |
| Vue | `labs/15-frameworks/apps/vue/` | 4303 | `src/SelectBox.vue` |

Each app is prebuilt in its `dist/` folder, and `labs/15-frameworks/apps/serve.mjs` serves it. No `npm install` is needed.

In `labs/15-frameworks/`:

- `playwright.config.ts`: one project and one server are complete, two of each are a TODO.
- `tests/careers.spec.ts`: two tests with TODOs.

Run all commands in `labs/15-frameworks/`.

## Steps

1. Look at one app: `node apps/serve.mjs angular 4302`, open <http://localhost:4302>, click **Apply**, stop the
   server with `Ctrl+C`.
2. Write the two tests in `tests/careers.spec.ts` and run them against React: `npx playwright test --project=react`.
3. Add the projects `angular` and `vue` and their two servers to `playwright.config.ts`, then run all three:

   ```bash
   npx playwright test
   ```

## Done when

`npx playwright test` says `6 passed`: two tests in three projects, from one spec file.

Before you start it fails: the two tests throw `TODO`, and `--project=angular` answers `Project(s) "angular" not found`.

## Hints

<details>
<summary>Hint 1 · strict mode violation on the Apply link</summary>

`getByRole('link', { name: 'Apply' })` resolves to 3 elements, one per job. Find the list item of the job first, then
the link inside it. The error message already suggests a locator.

</details>

<details>
<summary>Hint 2 · "Project(s) not found" or ERR_CONNECTION_REFUSED</summary>

`Project(s) "angular", "vue" not found`: the config has no project with that name yet. Copy the `react` line in
`projects` and change the name and the port.

`net::ERR_CONNECTION_REFUSED at http://localhost:4302/`: the project exists, but nothing serves its port. `webServer`
needs one entry per app.

</details>

<details>
<summary>Hint 3 · nearly the answer</summary>

The spec:

```ts
const job = page.getByRole('listitem').filter({ hasText: 'Senior QA Engineer' });
await job.getByRole('link', { name: 'Apply' }).click();
await expect(page.getByRole('heading', { name: 'Apply: Senior QA Engineer' })).toBeVisible();
```

The config, once per app:

```ts
{ name: 'angular', use: { baseURL: 'http://localhost:4302' } },
```

```ts
{
    command: 'node apps/serve.mjs angular 4302',
    url: 'http://localhost:4302',
    reuseExistingServer: !process.env.CI,
},
```

</details>

## More

**The form and the dropdown.** A third test: open `/apply/senior-qa-engineer`, fill **Email**, choose **Hybrid** as
**Working model**, submit, and expect the heading "Thank you for applying". It is in `solutions/15-frameworks`.

The dropdown is not a `<select>`, so `selectOption()` answers "Element is not a `<select>` element". Its options render
at the end of `<body>`, outside the form: a portal in React, a CDK overlay in Angular, a teleport in Vue. This dropdown
has ARIA roles, so `getByRole('combobox')` and `getByRole('option')` find it in all three. Compare it with the stage
dropdown of Hire Ground from `labs/06-locators`: the same overlay, without roles. To see it, start the Angular app, open
the dropdown and inspect it in the DevTools: the listbox sits in `div.cdk-overlay-container`, not in the form.

**Angular's own way.** `ng add playwright-ng-schematics`, then `ng e2e`.

Warning: `npm install` downloads the Angular toolchain from the npm registry, about 400 packages and 260 MB. On a slow
or filtered network, skip this part.

```bash
cd apps/angular
npm install
npx ng add playwright-ng-schematics --skip-confirmation --defaults
npm install -D @playwright/test@1.64.1
npx ng e2e --test-project chromium
```

- The two flags answer the questions of `ng add` in advance: proceed, and do not download browsers.
- The schematic installs the newest `@playwright/test`. Its browsers are not on your machine, so the fourth command goes
  back to the version of this course.
- `ng e2e` starts `ng serve` on port 4200 and runs `e2e/example.spec.ts`. The example expects the title "MyApp" and
  fails. Fix the title, then copy your `careers.spec.ts` into `e2e/` and run `ng e2e` again.
- This folder keeps working: it serves `dist/`, not the source.

## Read more

- Projects: <https://playwright.dev/docs/test-projects>
- Several web servers: <https://playwright.dev/docs/test-webserver#multiple-web-servers>
- Locators by role: <https://playwright.dev/docs/locators#locate-by-role>
- Angular schematics for Playwright: <https://github.com/playwright-community/playwright-ng-schematics>
