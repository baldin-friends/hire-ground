# Step 10 · Apply with a CV

The application form: text fields, a file, a checkbox. One application that gets through, and three that the form rejects.

**Time** 22 min · alone

## Start here

`labs/04-forms`: `tests/apply.spec.ts` with nine TODOs, and `tests/data.ts` with a CV and a `person()` who gets a new e-mail address on every call.
Fill in the form once by hand first: http://localhost:3000/jobs/senior-qa-engineer/apply

## Steps

1. TODOs 1–3: the helper `fillApplication`.
2. TODOs 4–6: the application that gets through, with a CV from a buffer and the consent box.

```bash
cd labs/04-forms
npx playwright test -g "apply with a CV"
```

## Done when

"apply with a CV" passes, twice in a row. Each run uses a new e-mail address.

## Done early?

3. TODOs 7–8: three rejections in one loop: missing e-mail, CV over 5 MB, wrong file type.
4. TODO 9: one assertion on state: `aria-invalid`, or the focus.

Then all five tests pass: `npx playwright test`.

## Stuck?

<details>
<summary>Hint 1 · fields and files</summary>

Fields with a label: `page.getByLabel('First name').fill('Erika')`.
The file field takes the buffer directly: `page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(file)`.

</details>

<details>
<summary>Hint 2 · "You have already applied with this email address."</summary>

The app accepts one application per address and job. `person().email` is new on every call; a fixed address works exactly once.

</details>

<details>
<summary>Hint 3 · the reference number</summary>

You do not know the number, but you know its shape: `toHaveText(/^HG-\d{6}$/)`.
The element has a test id: `page.getByTestId('application-reference')`.

</details>

<details>
<summary>Hint 4 · the two missing rejections</summary>

```ts
{ name: 'CV too large', email: 'big@example.com', file: big, error: 'Your CV must not be larger than 5 MB.' },
{ name: 'wrong file type', email: 'exe@example.com', file: exe, error: 'Your CV must be a PDF or Word file.' },
```

</details>

## Still time?

Drop the CV onto the drop zone instead of using the file field: `page.getByTestId('cv-dropzone').drop({ files: cv })`,
then assert the file name in `getByTestId('cv-selected')`.
