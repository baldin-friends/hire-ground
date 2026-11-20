# Visual comparison · A screenshot against a baseline

`toHaveScreenshot()` takes a screenshot and compares it with a baseline image, pixel by pixel. When the look of the
page changes, the test fails, and the report shows the difference as a picture.

**Time** 12 minutes · the finished example is `solutions/17-visual`

## Run it

```bash
cd solutions/17-visual
npx playwright test 1-screenshots --update-snapshots   # writes your baseline: 1 passed, an image in tests/__screenshots__/
npx playwright test 1-screenshots                      # compares with it: 1 passed
npx playwright test 2-regression                       # the same page with a new bar: 1 failed, "3354 pixels … are different"
npx playwright show-report                             # open the failed test: Diff, Actual, Expected, Side by side, Slider
```

Open your image in `tests/__screenshots__/`. The end of its name is your browser and your platform (`darwin` on a Mac, `win32` on Windows). The pink bar is
the mask over the closing date. The pixel count differs a little from machine to machine.

## Read it

| File | What it shows |
|---|---|
| `tests/1-screenshots.spec.ts` | one test: the job page, with a `mask` over the line that changes every day |
| `tests/2-regression.spec.ts` | fails on purpose: the same page with `?bugs=dup-apply`, a switch of Hire Ground that adds a bar with a second Apply link |
| `playwright.config.ts` | `updateSnapshots: 'none'`, where the baselines are stored, the tolerance |

## Try it

In `playwright.config.ts` set `maxDiffPixelRatio: 0.01` and run `npx playwright test 2-regression`: 1 passed. The new
bar is 0.4 % of the pixels, and a tolerance of one per cent hides it. Set the value back to `0`.

## Good to know

- Without `updateSnapshots: 'none'`, a first run writes the missing baseline and fails: nothing was compared.
- A baseline belongs to one browser on one platform. Yours stays on your machine (`.gitignore`). The file ending with
  `linux` is the baseline of the pipeline: the job `visual` in `.github/workflows/e2e-extended.yml` compares with it,
  in the Playwright image, and writes a new one when it is started with "update_baselines".
- `--update-snapshots` accepts whatever the page shows now. Read the difference before you use it.

## Read more

- Visual comparisons: <https://playwright.dev/docs/test-snapshots>
- `toHaveScreenshot()` and its options: <https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1>
