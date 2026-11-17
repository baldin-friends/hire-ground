# Steps 8 and 9 · One test, three frontends

The same list, built in React, Angular and Vue. One test for all three.

**Time** step 8: 12 min · step 9: 10 min · alone

## Start here

The three one-page apps in `labs/scaffolds/`. They show the same career page with the same labels.

| App | Folder | Port | The dropdown is in |
|---|---|---|---|
| React | `labs/scaffolds/react/` | 4301 | `src/Select.tsx` |
| Angular | `labs/scaffolds/angular/` | 4302 | `src/app/select.ts` |
| Vue | `labs/scaffolds/vue/` | 4303 | `src/SelectBox.vue` |

Each app is prebuilt in its `dist/` folder, and `labs/scaffolds/serve.mjs` serves it. No `npm install` is needed.

Your files are in `labs/11-frameworks/`:

- `playwright.config.ts`: one project and one server are complete, two of each are a TODO.
- `tests/careers.spec.ts`: two tests with TODOs.

Run all commands in `labs/11-frameworks/`.

## Steps

1. Open the three apps and start each one once.

   ```bash
   node ../scaffolds/serve.mjs react 4301
   ```

   Open <http://localhost:4301>, click **Apply**, then stop the server with `Ctrl+C`. Do the same for the other two:

   ```bash
   node ../scaffolds/serve.mjs angular 4302
   node ../scaffolds/serve.mjs vue 4303
   ```

2. **Step 8:** write one spec in `tests/careers.spec.ts`: the heading is visible, the Apply link works. Run it against React first:

   ```bash
   npx playwright test --project=react
   ```

3. **Step 9:** run it as three projects, each with its own `webServer`. Add the projects `angular` and `vue` and their two servers to `playwright.config.ts`, then run:

   ```bash
   npx playwright test --project=react --project=angular --project=vue
   ```

## Done when

`npx playwright test --project=react --project=angular --project=vue` passes with one spec file: 6 passed, two tests in three projects.

## Stuck?

<details>
<summary>Hint 1: strict mode violation on the Apply link</summary>

`getByRole('link', { name: 'Apply' })` resolves to 3 elements, one per job. Find the list item of the job first, then the link inside it. The error message already suggests a locator.

</details>

<details>
<summary>Hint 2: "Project(s) not found" or ERR_CONNECTION_REFUSED</summary>

`Project(s) "angular", "vue" not found`: the config has no project with that name yet. Copy the `react` line in `projects` and change the name and the port.

`net::ERR_CONNECTION_REFUSED at http://localhost:4302/`: the project exists, but nothing serves its port. `webServer` needs one entry per app.

</details>

<details>
<summary>Hint 3: nearly the answer</summary>

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
    command: 'node ../scaffolds/serve.mjs angular 4302',
    url: 'http://localhost:4302',
    reuseExistingServer: !process.env.CI,
},
```

</details>

## Done early?

**The form and the dropdown.** Add a third test: open `/apply/senior-qa-engineer`, fill **Email**, choose **Hybrid** as **Working model**, submit, and expect the heading "Thank you for applying".

The dropdown is not a `<select>`, so `selectOption()` answers "Element is not a `<select>` element". Its options render at the end of `<body>`, outside the form: a portal in React, a CDK overlay in Angular, a teleport in Vue. `getByRole('combobox')` and `getByRole('option')` find them in all three. To see it, start the Angular app, open the dropdown and inspect it in the DevTools: the listbox sits in `div.cdk-overlay-container`, not in the form.

**Angular's own way.** `ng add playwright-ng-schematics`, then `ng e2e`.

Warning: `npm install` downloads the Angular toolchain from the npm registry, about 400 packages and 260 MB. On a slow or filtered network, skip this part. It needs Node 22.12 or newer.

```bash
cd ../scaffolds/angular
npm install
npx ng add playwright-ng-schematics --skip-confirmation --defaults
npm install -D @playwright/test@1.64.1
npx ng e2e --test-project chromium
```

- The two flags answer the questions of `ng add` in advance: proceed, and do not download browsers.
- The schematic installs the newest `@playwright/test`. Its browsers are not on your machine, so the fourth command goes back to the version of this course.
- `ng e2e` starts `ng serve` on port 4200 and runs `e2e/example.spec.ts`. The example expects the title "MyApp" and fails. Fix the title, then copy your `careers.spec.ts` into `e2e/` and run `ng e2e` again.
- Your lab keeps working: it serves `dist/`, not the source.
