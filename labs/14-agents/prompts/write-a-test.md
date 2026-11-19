Open http://localhost:3000/login with the playwright MCP server and sign in as
rita.recruiter@hireground.test with the password hire-ground.

Go to the candidates page and find out how a recruiter rejects a candidate. Do it once in the browser.

Then write tests/reject-a-candidate.spec.ts:

- Import test and expect from '../../../support/fixtures' and use its applicant fixture.
  The test rejects the candidate the fixture created, never one from the seed data.
- Role and name first. Where an element has no name, use what the page offers and say so in a comment.
- Run it with: npx playwright test reject-a-candidate
  It must pass twice in a row.

At the end, tell me in three lines what on this page was hard to test.
