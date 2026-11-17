#!/usr/bin/env bash
# Lab 10 without a CI system: two shards on your laptop, one merged report.
# The same blob reports, the same merge. Only the machines are missing.
set -u
rm -rf ../../all-blob-reports && mkdir -p ../../all-blob-reports

# ";" and not "&&": a shard with a failing test exits with 1, and its report is the one you want
npx playwright test --shard=1/2 --reporter=blob; mv ../../blob-report/*.zip ../../all-blob-reports/
npx playwright test --shard=2/2 --reporter=blob; mv ../../blob-report/*.zip ../../all-blob-reports/

npx playwright merge-reports --reporter html ../../all-blob-reports
echo "Merged. Open it with: npx playwright show-report"
