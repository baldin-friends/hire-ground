# Accessibility · One scan, two pages

On Thursday three controls in the candidates table could not be found by role: the star, the download link and the
reject button have an icon and no name. An accessibility scan reports these controls without a locator.

**Time** 8 minutes · the scans are `tests/a11y.spec.ts`, the fix is in the application

## Run it

```bash
cd labs/16-accessibility
npx playwright test -g "candidates table"    # 1 failed: "button-name: 20 elements", "link-name: 10 elements"
npx playwright test                          # 2 failed: the second scan is the career page with one unnamed button
```

`button-name`: a button needs a name that assistive technology can read. `link-name`: the same for a link.
An icon alone has no name. The career page is opened with `?bugs=icon-save`, a switch of Hire Ground that takes
the name of the "Save job" button away: 12 buttons, one per job.

## Read it

| File | What it shows |
|---|---|
| `tests/a11y.spec.ts` | two scans with `@axe-core/playwright`: wait for the loaded page, scan, expect no violations |
| `solutions/16-accessibility/README.md` | the fix: three `label` attributes in the application, no change in the tests |

## Try it

1. Fix the candidates table: `app/src/pages/Candidates.tsx`, the three `IconButton`s in the last cell of a row.
   `IconButton` has a `label` prop for the accessible name.

   ```tsx
   <IconButton icon="star" label={`Shortlist ${fullName(a)}`} pressed={a.shortlisted} onClick={() => shortlist(a)} />
   <IconButton icon="download" label={`Download the CV of ${fullName(a)}`} href={`/api/applications/${a.id}/cv`} />
   <IconButton icon="reject" label={`Reject ${fullName(a)}`} onClick={() => setConfirm([a])} />
   ```

2. Stop the app if it runs in a terminal, then `npx playwright test`: the run builds and starts the app, and the
   scan of the candidates table passes. Thursday's locator becomes `row.getByRole('button', { name: 'Shortlist Ben Braun' })`.
3. Fix the career page the same way: in `app/src/components/SaveButton.tsx` the button keeps `aria-label="Save job"`
   in every case. Now `npx playwright test` says `2 passed`.

## Good to know

A scan finds the part of the problems a machine can see, and it finds them on every run. The Playwright documentation
says that many accessibility problems can only be discovered through manual testing.

## Read more

- Accessibility testing with axe: <https://playwright.dev/docs/accessibility-testing>
- ARIA snapshots: <https://playwright.dev/docs/aria-snapshots>
- The rules axe checks: <https://dequeuniversity.com/rules/axe/4.14/button-name>
