#!/usr/bin/env bash
# Three machines on one laptop. Each shard gets what a machine in the pipeline has:
# its own application, its own empty database, and CI=1. Each one writes a blob report;
# the last step merges them into one HTML report.
#
#   ./shard-locally.sh        three shards
#   ./shard-locally.sh 5      five shards
#
# https://playwright.dev/docs/test-sharding
set -u
SHARDS=${1:-3}
export PORT=${PORT:-3012}     # not 3000: with CI=1 the run starts an application of its own

rm -rf blob-report all-blob-reports merged-report shard-data
mkdir -p all-blob-reports shard-data

status=0
for i in $(seq 1 "$SHARDS"); do
    echo
    echo "── shard $i of $SHARDS ──────────────────────────────"
    CI=1 HG_DB="$PWD/shard-data/shard-$i.db" npx playwright test --shard="$i/$SHARDS" \
        && cp blob-report/*.zip all-blob-reports/ \
        || status=1
done

echo
echo "── merge ────────────────────────────────────────────"
PLAYWRIGHT_HTML_OUTPUT_DIR=merged-report PLAYWRIGHT_HTML_OPEN=never npx playwright merge-reports --reporter html ./all-blob-reports
echo
echo "One report from $SHARDS shards. Open it with:  npx playwright show-report merged-report"
exit $status
