# UI components, one snippet each

A reference for the widgets a real product has. Every snippet on this sheet ran against Playwright 1.64.1.
Course: Playwright · End-to-end testing for web applications

The pattern is always the same: find it by role and name, act, assert what the user sees afterwards.

## Checkboxes and radio buttons

```ts
await page.getByRole('checkbox', { name: 'Remote only' }).check();        // also uncheck(), setChecked(false)
await expect(page.getByRole('checkbox', { name: 'Remote only' })).toBeChecked();
await page.getByRole('radio', { name: 'Part-time' }).check();
```

`check()` does nothing if the box is already ticked. `click()` would untick it.

## Dropdowns

```ts
// a native <select>
const location = page.getByRole('combobox', { name: 'Location' });
await location.selectOption('Dresden');                  // by value or label; { label: 'Hamburg' } to be explicit
await expect(location).toHaveValue('Dresden');

// a custom dropdown built from divs: open it, then click the option
await page.getByRole('combobox', { name: 'Location' }).click();
await page.getByRole('option', { name: 'Dresden' }).click();
```

If `selectOption` fails with "not a select element", it is a custom dropdown. The options often render
at the end of the page, outside the component: search them from `page`, not from the dropdown.

## Lists and tables

```ts
const cards = page.getByRole('article');
await expect(cards).toHaveCount(12);
const card = cards.filter({ hasText: 'Senior QA Engineer' });            // one item by its content
const titles = await cards.getByRole('heading').allTextContents();       // all texts, for sorting checks

const row = page.getByRole('row').filter({ hasText: 'Max Beispiel' });   // find the row first
await expect(row.getByRole('cell').nth(1)).toHaveText('Interview');      // then the cell
await row.getByRole('button', { name: 'Reject' }).click();               // or the button in that row
```

Never address a row by its number. Rows move; the name in the row stays.

## Dialogs

```ts
// browser dialogs (alert, confirm, prompt): register the handler BEFORE the click
page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('Delete the note?');
    await dialog.accept();                                // or dialog.dismiss()
});
await page.getByRole('button', { name: 'Delete' }).click();

// dialogs built in HTML are ordinary elements
await page.getByRole('dialog', { name: 'Cookies' }).getByRole('button', { name: 'Accept all' }).click();
await expect(page.getByRole('dialog')).toBeHidden();
```

Without a handler Playwright dismisses browser dialogs by itself, and the test goes on.

## Tooltips

```ts
await page.getByRole('button', { name: 'Save job' }).hover();
await expect(page.getByRole('tooltip')).toHaveText('Saved jobs appear in your profile');
```

## Dates and sliders

```ts
await page.getByLabel('Earliest start date').fill('2026-12-01');         // native date input: always ISO

// a date picker widget: open it, pick the day by its accessible name
await page.getByRole('button', { name: 'Choose date' }).click();
await page.getByRole('dialog', { name: 'December 2026' }).getByRole('button', { name: '2 December 2026' }).click();

const slider = page.getByRole('slider', { name: 'Salary expectation' });
await slider.fill('72000');                              // native range input
await slider.press('ArrowRight');                        // or step with the keyboard
```

A test that needs "today" in a date picker also needs `page.clock`, or it fails on the first of the month.

## iframes

```ts
const frame = page.frameLocator('iframe[title="Video interview"]');
await frame.getByRole('button', { name: 'Join call' }).click();
```

Everything inside an iframe is found through its `frameLocator`. This is one of the few places where a CSS selector is the normal way in.

## Drag and drop

```ts
const card = page.getByRole('region', { name: 'New' }).getByRole('article').first();
await card.dragTo(page.getByRole('region', { name: 'Screening' }));
await expect(page.getByRole('region', { name: 'Screening' }).getByRole('article', { name })).toBeVisible();
```

Assert where the card ended up. The drag itself proves nothing.

## New tabs and downloads

```ts
const popup = page.waitForEvent('popup');                // start waiting, then click
await page.getByRole('link', { name: 'Open positions' }).click();
const tab = await popup;
await expect(tab.getByRole('heading', { name: 'Open positions' })).toBeVisible();

const download = page.waitForEvent('download');
await page.getByRole('link', { name: 'Download CV' }).click();
expect((await download).suggestedFilename()).toBe('cv-muster.txt');
```

Same order as the network spy on Day 2: listen first, act second, await third.

## File uploads

```ts
await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer });
await page.getByTestId('cv-dropzone').drop({ files: cv });               // a drop zone
```
