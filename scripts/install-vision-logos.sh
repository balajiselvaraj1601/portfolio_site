#!/usr/bin/env bash
# install-vision-logos.sh — Copy pipeline *-icon-512.svg outputs into
# public/assets/logos/ with the logo_ prefix (underscores, not dashes).
#
# Usage:
#   ./scripts/install-vision-logos.sh [icon_dir ...]
#
# Defaults: icon_box, icon_kaggle, icon_multimodal under ~/workspace.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$PROJECT_ROOT/public/assets/logos"
WORKSPACE="${WORKSPACE_ROOT:-$HOME/workspace}"

DEFAULT_DIRS=(
  "$WORKSPACE/icon_box"
  "$WORKSPACE/icon_kaggle"
  "$WORKSPACE/icon_multimodal"
)

if [[ $# -gt 0 ]]; then
  DIRS=("$@")
else
  DIRS=("${DEFAULT_DIRS[@]}")
fi

mkdir -p "$DEST"
count=0

for dir in "${DIRS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    echo "✗ skip missing dir: $dir" >&2
    continue
  fi
  for svg in "$dir"/*-icon-512.svg; do
    [[ -f "$svg" ]] || continue
    base=$(basename "$svg" -icon-512.svg)
    slug="logo_${base//-/_}"
    cp "$svg" "$DEST/${slug}.svg"
    echo "→ $svg → ${slug}.svg"
    count=$((count + 1))
  done
done

echo "✓ Installed $count logo SVG(s) to $DEST"
