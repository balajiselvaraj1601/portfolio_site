#!/usr/bin/env bash
# install-vision-logos.sh — Copy pipeline *-icon-512.svg outputs into
# public/assets/logos/ with the logo_ prefix (underscores, not dashes).
#
# Usage:
#   ./scripts/icons/install-vision-logos.sh [icon_dir ...]
#
# Defaults: install_order from scripts/icons/icon-sets.json under ~/workspace.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="$PROJECT_ROOT/public/assets/logos/marks"
WORKSPACE="${ICON_WORKSPACE:-$HOME/workspace}"
CONFIG="$PROJECT_ROOT/scripts/icons/icon-sets.json"

resolve_slug() {
  local set_name="$1"
  local base="$2"
  python3 - "$CONFIG" "$set_name" "$base" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1]))
set_name, base = sys.argv[2], sys.argv[3]
overrides = cfg.get("install_overrides", {}).get(set_name, {})
slug = overrides.get(base)
if slug:
    print(slug)
else:
    print(f"logo_{base.replace('-', '_')}")
PY
}

if [[ $# -gt 0 ]]; then
  DIRS=("$@")
else
  mapfile -t DIRS < <(
    python3 - "$CONFIG" "$WORKSPACE" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1]))
workspace = sys.argv[2]
order = cfg.get("install_order") or list(cfg["icon_sets"].keys())
for name in order:
    d = cfg["icon_sets"][name]["dir"]
    print(f"{workspace}/{d}")
PY
  )
fi

mkdir -p "$DEST"
count=0

for dir in "${DIRS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    echo "✗ skip missing dir: $dir" >&2
    continue
  fi
  set_name=$(basename "$dir")
  for svg in "$dir"/*-icon-512.svg; do
    [[ -f "$svg" ]] || continue
    base=$(basename "$svg" -icon-512.svg)
    slug=$(resolve_slug "$set_name" "$base")
    cp "$svg" "$DEST/${slug}.svg"
    echo "→ $svg → ${slug}.svg"
    count=$((count + 1))
  done
done

echo "✓ Installed $count logo SVG(s) to $DEST"
