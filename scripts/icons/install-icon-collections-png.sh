#!/usr/bin/env bash
# install-icon-collections-png.sh — Copy square-centered icon_*.png from
# assets/icon-collections-resized/ into public/assets/logos/{subfolder}/ by prefix rule.
#
# Usage:
#   ./scripts/icons/install-icon-collections-png.sh [SOURCE_DIR]
#
# Default SOURCE_DIR: $PROJECT_ROOT/assets/icon-collections-resized

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SOURCE="${1:-$PROJECT_ROOT/assets/icon-collections-resized}"
DEST_BASE="$PROJECT_ROOT/public/assets/logos"

if [[ ! -d "$SOURCE" ]]; then
  echo "✗ source directory not found: $SOURCE" >&2
  exit 1
fi

# Longest-prefix-first routing (filename without path).
resolve_subdir() {
  local base="$1"
  case "$base" in
    icon_education_*) echo "education" ;;
    icon_general_*) echo "general" ;;
    icon_trophy_awards*) echo "awards" ;;
    icon_hub_kaggle_*|icon_kaggle_*|icon_metric_kaggle_*|icon_trophy_kaggle*) echo "kaggle" ;;
    icon_hub_multimodal_*|icon_vision_*) echo "vision" ;;
    *) echo "" ;;
  esac
}

installed=0
unchanged=0
unmapped=()

for png in "$SOURCE"/icon_*.png; do
  [[ -f "$png" ]] || continue
  base=$(basename "$png")
  sub=$(resolve_subdir "$base")
  if [[ -z "$sub" ]]; then
    unmapped+=("$base")
    continue
  fi
  dest_dir="$DEST_BASE/$sub"
  mkdir -p "$dest_dir"
  dest="$dest_dir/$base"
  if [[ -f "$dest" ]] && cmp -s "$png" "$dest"; then
    unchanged=$((unchanged + 1))
  else
    cp -v "$png" "$dest"
    installed=$((installed + 1))
  fi
done

echo ""
echo "✓ PNG install summary (source: $SOURCE)"
echo "  installed/updated: $installed"
echo "  unchanged:         $unchanged"

if [[ ${#unmapped[@]} -gt 0 ]]; then
  echo "✗ unmapped files (no routing rule):" >&2
  printf '  %s\n' "${unmapped[@]}" >&2
  exit 1
fi
