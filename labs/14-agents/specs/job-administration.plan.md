# Job administration (/recruiter/jobs) Test Plan

## Application Overview

Hire Ground recruiter job administration at /recruiter/jobs. The seed (tests/seed.spec.ts) opens /recruiter/jobs signed in as Rita Recruiter (storageState playwright/.auth/recruiter.json, baseURL http://localhost:3000 or $PORT, locale de-DE). Fresh state: heading "Jobs", status text "12 jobs", 12 seeded jobs, all Published. The status text counts all jobs (drafts included). Table columns: Title, Team, Location, Deadline, Status, Applications, Actions. Row actions: a text button ("Publish" for a draft, "Unpublish" for a published job) and an icon-only trash button with NO accessible name (locate it with row.locator('button.icon-btn')). Status messages appear as toasts with role=status. Deadline is shown as dd.mm.yyyy. Note: there is no separate "offline" state: Unpublish returns the job to Draft. Required fields on /recruiter/jobs/new (also for "Save draft"): Job title, Team, Location, Salary From and To, Application deadline, Description. Skills and "Remote possible" are optional. Each scenario uses its own unique title and creates its own data.

## Test Scenarios

### 1. Job administration

**Seed:** `tests/seed.spec.ts`

#### 1.1. Create a job and save it as a draft

**File:** `tests/job-administration/save-draft.spec.ts`

**Steps:**
  1. Open /recruiter/jobs (seed). Click the link "New job".
    - expect: URL is /recruiter/jobs/new
    - expect: Heading "New job" is visible
    - expect: Link "← Jobs" is visible
    - expect: Buttons "Save draft" and "Publish" are visible
  2. Without filling anything click "Save draft" (negative check).
    - expect: URL stays /recruiter/jobs/new; no job is created
    - expect: Inline errors: "Please enter a title.", "Please choose a team.", "Please choose a location.", "Please enter a salary range.", "Please choose a date.", "Please describe the job."
    - expect: So drafts need all required fields too
  3. Fill: Job title "Draft Job <unique suffix, e.g. timestamp>"; Team = QA; Location = Berlin; Salary From 50000, To 60000; Application deadline 2026-12-31 (date input, fill with ISO value yyyy-mm-dd); Description "Draft scenario job". Leave Skills and Remote possible untouched.
    - expect: No error messages remain visible after a valid save
  4. Click "Save draft".
    - expect: URL is /recruiter/jobs
    - expect: Status text reads "13 jobs"
    - expect: A new row with the unique title is present, listed first in the table
    - expect: Row cells: Team "QA", Location "Berlin", Deadline "31.12.2026", Status "Draft", Applications "0"
    - expect: Row action button is "Publish" (no "Unpublish" button in that row)
    - expect: Title is a link to /jobs/<slug of title>
  5. Cleanup: delete the job via the trash button and "Delete" in the dialog (so the app stays clean).
    - expect: Row is gone, status text back to "12 jobs"

#### 1.2. Publish a draft and take it offline again

**File:** `tests/job-administration/publish-unpublish.spec.ts`

**Steps:**
  1. Precondition inside the test: go to /recruiter/jobs/new, fill all required fields with a unique title "Publish Job <suffix>" (Team QA, Location Berlin, Salary 50000 to 60000, Deadline 2026-12-31, Description "Publish scenario job") and click "Save draft".
    - expect: Back on /recruiter/jobs, row of the new job shows Status "Draft" and button "Publish"
  2. In that row click "Publish".
    - expect: Row Status changes to "Published" without a page reload
    - expect: Row button changes from "Publish" to "Unpublish"
    - expect: Toast (role=status) with text "<title> is published."
    - expect: Status text stays "13 jobs"
  3. In the same row click "Unpublish".
    - expect: Row Status changes to "Draft" (the app has no "offline" or "unpublished" status)
    - expect: Row button is "Publish" again
    - expect: Toast (role=status) with text "<title> is a draft again."
    - expect: Status text stays "13 jobs"; row is still present
  4. Cleanup: delete the job (trash button, then "Delete").
    - expect: Row is gone, status text "12 jobs"

#### 1.3. Delete a job with confirmation

**File:** `tests/job-administration/delete-job.spec.ts`

**Steps:**
  1. Precondition inside the test: create a draft with unique title "Delete Job <suffix>" through /recruiter/jobs/new (all required fields as in the other scenarios) and "Save draft". Publishing is not needed because deletion also works for drafts.
    - expect: Row present with Status "Draft"; status text "13 jobs"
  2. In the row click the trash icon button (icon only, no accessible name: use row.locator('button.icon-btn')).
    - expect: A modal dialog opens with heading "Delete <title>?" and text "A job with applications cannot be deleted."
    - expect: Dialog buttons "Cancel" and "Delete"
    - expect: The row is still in the table and the status text is still "13 jobs"
  3. Click "Cancel".
    - expect: Dialog closes
    - expect: Row is still present, still "Draft"; status text "13 jobs"
  4. Click the trash button again, then click "Delete" in the dialog.
    - expect: Dialog closes; URL stays /recruiter/jobs
    - expect: Row with the title is no longer in the table
    - expect: Status text reads "12 jobs"
    - expect: Toast (role=status) "<title> deleted."
  5. Reload /recruiter/jobs.
    - expect: Row stays absent, status text "12 jobs" (deletion is persisted)
