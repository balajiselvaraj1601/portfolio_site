#!/bin/bash
# check-skill-sync.sh — assert the .skill bundle ships the canonical pipeline.
#
# Single source of truth: scripts/svg-icon-generator.py. The bundle carries a
# verbatim copy as icon_pipeline.py (prefixed with #SYNC# header lines) plus a
# verbatim copy of verify-icon.py. This script proves they haven't drifted.
#
# Usage:  ./scripts/check-skill-sync.sh
# Exit 0 = in sync; exit 1 = drift (with a diff).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL="$ROOT/../svg-icon-generator.skill"
PROD="$ROOT/scripts/svg-icon-generator.py"
VERIFY="$ROOT/scripts/verify-icon.py"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

if [[ ! -f "$SKILL" ]]; then
    echo "✗ skill bundle not found: $SKILL"
    exit 1
fi

unzip -oq "$SKILL" -d "$work"
bundled_pipe="$work/svg-icon-generator/scripts/icon_pipeline.py"
bundled_verify="$work/svg-icon-generator/scripts/verify-icon.py"

status=0

# icon_pipeline.py — strip the #SYNC# header, then it must equal production.
if [[ ! -f "$bundled_pipe" ]]; then
    echo "✗ bundle missing scripts/icon_pipeline.py"
    status=1
elif ! diff <(grep -v '^#SYNC#' "$bundled_pipe") "$PROD" >/tmp/skillsync_pipe.diff 2>&1; then
    echo "✗ icon_pipeline.py has DRIFTED from svg-icon-generator.py:"
    sed 's/^/    /' /tmp/skillsync_pipe.diff
    status=1
else
    echo "✓ icon_pipeline.py in sync with svg-icon-generator.py"
fi

# verify-icon.py — verbatim copy, must equal production.
if [[ ! -f "$bundled_verify" ]]; then
    echo "✗ bundle missing scripts/verify-icon.py"
    status=1
elif ! diff "$bundled_verify" "$VERIFY" >/tmp/skillsync_verify.diff 2>&1; then
    echo "✗ verify-icon.py has DRIFTED:"
    sed 's/^/    /' /tmp/skillsync_verify.diff
    status=1
else
    echo "✓ verify-icon.py in sync"
fi

exit $status
