#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=page-team-lib.sh
source "$SCRIPT_DIR/page-team-lib.sh"

page_team_init_paths

GOAL="${*:-Baseline design consistency audit across all 6 views; fix P0/P1 issues where consensus is clear.}"
MODE="${PAGE_TEAM_MODE:-full}"

mkdir -p "$ROOT/.cursor"
page_team_init_state "$GOAL" "$MODE"

echo "Page-team enabled: $STATE_FILE"
echo "Run ID: $(jq -r '.run_id' "$STATE_FILE")"
echo "Mode: $MODE"
echo ""
echo "Paste into Agent chat:"
echo "---"
cat <<EOF
Run page-consistency-team skill in ${MODE} mode.
Goal: ${GOAL}
State file is enabled at .cursor/page-team.state.json.
Follow interaction-protocol.md phases; spawn page agents in parallel for audit.
EOF
echo "---"
