#!/usr/bin/env bash
# Re-records labs/05-evidence/problem/trace.zip from the failing test in this folder.
#
#   ./record-trace.sh              app on port 3000 (started if it is not running)
#   PORT=3102 ./record-trace.sh    another copy of the app
#
# The run happens in a copy under /tmp/hire-ground, so that the paths inside the
# trace are neutral. Expected result: 1 failed.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
participant="$(cd "$here/../../.." && pwd)"
target="$participant/labs/05-evidence/problem/trace.zip"
stage="${STAGE:-/tmp/hire-ground}"

rm -rf "$stage"
mkdir -p "$stage/labs/05-evidence"
cp -R "$participant/node_modules" "$stage/node_modules"
ln -s "$(cd "$participant/app" && pwd -P)" "$stage/app"
mkdir -p "$stage/labs/05-evidence/problem"
cp "$here/playwright.config.ts" "$here/apply.spec.ts" "$stage/labs/05-evidence/problem/"

cd "$stage/labs/05-evidence/problem"
"$stage/node_modules/.bin/playwright" test --output "$stage/test-results" || true

trace="$(find "$stage/test-results" -name trace.zip | head -1)"
test -n "$trace" || { echo "No trace was written."; exit 1; }
if unzip -p "$trace" | grep -qa "$HOME"; then echo "WARNING: the trace contains $HOME."; fi

mkdir -p "$(dirname "$target")"
cp "$trace" "$target"
rm -rf "$stage"
echo "Recorded: $(du -h "$target" | cut -f1) in $target"
