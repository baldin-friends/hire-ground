# Job administration: test plan

Written by hand, in the layout the planner agent saves and the generator agent reads. Use it when the planner
is not available, or compare it with the plan the planner writes for you.

## Application overview

The job administration of Hire Ground (`/recruiter/jobs`) lists every job with its status. A recruiter creates a
job as a draft or publishes it at once, publishes and unpublishes it, and deletes it. A job with applications
cannot be deleted. A published job is visible on the career page (`/jobs`).

## Test scenarios

### 1. Job administration

**Seed:** `tests/seed.spec.ts`

#### 1.1 Save a new job as a draft

**Steps:**
1. Click the link "New job".
2. Fill "Job title" with a title that no other job has.
3. Choose a team and a location, fill the salary range, the deadline and the description.
4. Click "Save draft".

**Expected results:**
- The message "Draft saved." appears.
- The list shows the job with the status "Draft".
- The career page does not list the job.

#### 1.2 A second job with the same title is refused

**Steps:**
1. Create a job as in 1.1.
2. Create a second job with the same title.

**Expected results:**
- The form stays open and shows "A job with this title already exists."

#### 1.3 A job with applications cannot be deleted

**Steps:**
1. In the row of "Senior QA Engineer", click the delete button and confirm.

**Expected results:**
- The message "This job has applications and cannot be deleted." appears.
- The job is still in the list.
