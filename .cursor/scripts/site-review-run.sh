#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=site-review-lib.sh
source "$SCRIPT_DIR/site-review-lib.sh"

site_review_init_paths
site_review_load_env
site_review_require_agent

mkdir -p "$LOG_DIR"
stamp="$(date -u +"%Y%m%dT%H%M%SZ")"
log_file="$LOG_DIR/run-${stamp}.log"

cd "$ROOT"

if [[ ! -f "$STATE_FILE" ]]; then
  site_review_init_state "$SITE_REVIEW_GOAL"
fi

tmp="$(mktemp)"
jq --arg log_path "$log_file" --arg phase "running" \
  '.phase = $phase | .log_path = $log_path' "$STATE_FILE" > "$tmp"
mv "$tmp" "$STATE_FILE"

{
  echo "=== site review run ${stamp} ==="
  echo "repo: $ROOT"
  echo "model: $SITE_REVIEW_MODEL"
  echo "allow_commit: $SITE_REVIEW_ALLOW_COMMIT"
  echo "goal: $SITE_REVIEW_GOAL"
  echo "---"
} | tee "$log_file"

prompt="Run site-review-fix skill in full auto mode.
Read .claude/agents/site-review-fix.md and .claude/skills/site-review-fix/references/review-protocol.md.
Goal: ${SITE_REVIEW_GOAL}
State file: .cursor/site-review.state.json (update after each phase).
Allow commit: ${SITE_REVIEW_ALLOW_COMMIT} (commit only after npm run verify passes; never push).
Fix all verified issues across CI, content SSOT, dead code, a11y/SEO, design (delegate design to page-consistency-team full mode).
Baseline checklist: docs/audits/simplification-refactor-2026-07-03.md — re-verify every theme."

args=(-p --output-format text --model "$SITE_REVIEW_MODEL")
# shellcheck disable=SC2206
if [[ -n "${SITE_REVIEW_EXTRA_FLAGS:-}" ]]; then
  extra=($SITE_REVIEW_EXTRA_FLAGS)
  args+=("${extra[@]}")
fi
args+=("$prompt")

if agent "${args[@]}" 2>&1 | tee -a "$log_file"; then
  echo "---" | tee -a "$log_file"
  echo "status: ok" | tee -a "$log_file"
  site_review_update_phase "complete"
else
  status=$?
  echo "---" | tee -a "$log_file"
  echo "status: failed (exit $status)" | tee -a "$log_file"
  site_review_update_phase "failed"
  exit "$status"
fi
