#!/usr/bin/env bash
# Shared helpers for page-team scripts.
page_team_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

page_team_init_paths() {
  ROOT="$(page_team_root)"
  STATE_FILE="$ROOT/.cursor/page-team.state.json"
  STATE_EXAMPLE="$ROOT/.cursor/page-team.state.json.example"
  ROUTING_CSV="$ROOT/.claude/skills/page-consistency-team/assets/page-routing.csv"
}

page_team_state_enabled() {
  if [[ ! -f "$STATE_FILE" ]]; then
    echo "false"
    return 0
  fi
  jq -r '.enabled // false' "$STATE_FILE" 2>/dev/null || echo "false"
}

page_team_phase() {
  if [[ ! -f "$STATE_FILE" ]]; then
    echo "none"
    return 0
  fi
  jq -r '.phase // "unknown"' "$STATE_FILE" 2>/dev/null || echo "unknown"
}

page_team_finding_counts() {
  if [[ ! -f "$STATE_FILE" ]]; then
    echo "0 0 0"
    return 0
  fi
  local p0 p1 p2
  p0=$(jq '[.findings[]? | select(.severity=="P0")] | length' "$STATE_FILE" 2>/dev/null || echo 0)
  p1=$(jq '[.findings[]? | select(.severity=="P1")] | length' "$STATE_FILE" 2>/dev/null || echo 0)
  p2=$(jq '[.findings[]? | select(.severity=="P2")] | length' "$STATE_FILE" 2>/dev/null || echo 0)
  echo "$p0 $p1 $p2"
}

page_team_new_run_id() {
  date -u +"%Y-%m-%dT%H%M%SZ"
}

page_team_init_state() {
  local goal="${1:-Baseline design consistency audit}"
  local mode="${2:-full}"
  local run_id
  run_id="$(page_team_new_run_id)"
  jq -n \
    --arg run_id "$run_id" \
    --arg mode "$mode" \
    --arg goal "$goal" \
    '{
      run_id: $run_id,
      mode: $mode,
      goal: $goal,
      phase: "init",
      enabled: true,
      active_views: ["home","experience","research","recognition","vision","contact"],
      findings: [],
      conflicts: [],
      decisions: [],
      acceptances: [],
      implementations: [],
      build: null
    }' > "$STATE_FILE"
}
