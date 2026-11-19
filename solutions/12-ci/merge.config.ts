// For the last job of the pipeline: one report from the three shards of the suite and from the visual comparison.
// Their tests live in different folders, so the merge is told one folder that contains both.
//   npx playwright merge-reports -c solutions/12-ci/merge.config.ts ./all-blob-reports
// https://playwright.dev/docs/test-sharding#merge-reports-cli
export default {
    testDir: '..',
    // html: the report people open. json: the same results for the summary that scripts/ci-summary.mjs writes.
    reporter: [['html', { open: 'never' }], ['json', { outputFile: 'results.json' }]],
};
