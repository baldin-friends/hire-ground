# Accessibility · the fix

The tests in `tests/a11y.spec.ts` are the ones from `labs/16-accessibility`. They turn green through two changes in
the application, not in the tests.

`app/src/pages/Candidates.tsx`, the last cell of a row: every `IconButton` gets a `label`.

```tsx
<IconButton icon="star" label={`Shortlist ${fullName(a)}`} pressed={a.shortlisted} onClick={() => shortlist(a)} />
<IconButton icon="download" label={`Download the CV of ${fullName(a)}`} href={`/api/applications/${a.id}/cv`} />
<IconButton icon="reject" label={`Reject ${fullName(a)}`} onClick={() => setConfirm([a])} />
```

`app/src/components/SaveButton.tsx`: the name stays, whatever the teaching bug says.

```tsx
aria-label="Save job"
```

Stop the app, run `npx playwright test` in this folder: the run builds and starts the app again, and both scans pass.
