# Visual comparison · A screenshot against a baseline

`toHaveScreenshot()` takes a screenshot and compares it with a baseline image, pixel by pixel. When the look of the
page changes, the test fails, and the report shows the difference as a picture.

**Time** 12 minutes · the finished example is `solutions/17-visual`

## Run it

```bash
cd solutions/17-visual
npx playwright test 1-screenshots --update-snapshots   # writes the baselines: 3 passed, two images in tests/__screenshots__/
npx playwright test 1-screenshots                      # compares with them: 3 passed
npx playwright test 2-regression                       # the same page with a new bar: 1 failed, "3354 pixels … are different"
npx playwright show-report                             # open the red test: Diff, Actual, Expected, Side by side, Slider
```

Open `tests/__screenshots__/job-page-chromium-darwin.png`. The end of the name is your browser and your platform.
The pink bar is the mask over the closing date. The pixel count differs a little from machine to machine.

## Read it

| File | What it shows |
|---|---|
| `tests/1-screenshots.spec.ts` | a page with a `mask`, one element, and the same element as an ARIA snapshot |
| `tests/2-regression.spec.ts` | red on purpose: the job page with `?bugs=dup-apply`, a switch of Hire Ground that adds a bar with a second Apply link |
| `playwright.config.ts` | `updateSnapshots: 'none'`, the folder and the names of the baselines, the tolerance |

## Try it

1. **The tolerance.** In `playwright.config.ts` set `maxDiffPixelRatio: 0.01` and run `npx playwright test 2-regression`:
   1 passed. The new bar is 0.4 % of the pixels. Set it back to `0`.
2. **Another browser.** `npx playwright test 1-screenshots --project=firefox`: 2 failed, "A snapshot doesn't exist".
   A baseline belongs to one browser on one platform.
3. **Accept a change.** `npx playwright test 2-regression --update-snapshots`: 1 passed, and the baseline now shows the
   bar. `npx playwright test 1-screenshots`: 1 failed. The flag accepts whatever the page shows, so read the diff first.
   Put the baseline back with the first command of this sheet.

## Good to know

- Without `updateSnapshots: 'none'`, a first run writes the missing baselines and fails: nothing was compared.
- Your own baselines stay on your machine (`.gitignore`): a Mac and a Windows laptop draw their own.
- The baselines of the pipeline are in the repository: `tests/__screenshots__/*-linux.png`. The pipeline made them
  itself, because a Mac and the Linux image draw text differently. To make them again: start the workflow by hand
  with `update_baselines`, download the artifact `baselines`, commit the images. Case 8 shows it.
- Before each screenshot Playwright stops CSS animations and waits until two screenshots in a row are equal.

## Read more

- Visual comparisons: <https://playwright.dev/docs/test-snapshots>
- `toHaveScreenshot()` and its options: <https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1>
- ARIA snapshots: <https://playwright.dev/docs/aria-snapshots>
- Where the baselines are stored: <https://playwright.dev/docs/api/class-testconfig#test-config-snapshot-path-template>
