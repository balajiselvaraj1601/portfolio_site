#!/usr/bin/env bash
# regenerate-marks-from-png.sh — Trace icon_*.png → logo_*.svg marks without
# batch normalizer (preserves square-centered line art).
#
# Usage:
#   ./scripts/regenerate-marks-from-png.sh [SOURCE_DIR]
#
# Default SOURCE_DIR: $PROJECT_ROOT/icon_collections_resized
#
# Does NOT run normalize-icon-sources.py or batch-icon-generate.sh.
# After this script, run:
#   python3 scripts/normalize-mark-viewbox.py apply
#   python3 scripts/normalize-mark-viewbox.py check

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="${1:-$PROJECT_ROOT/icon_collections_resized}"
GENERATOR="$PROJECT_ROOT/scripts/svg-icon-generator.py"
INSTALLER="$PROJECT_ROOT/scripts/install-vision-logos.sh"
CONFIG="$PROJECT_ROOT/scripts/icon-sets.json"

# Temp output dir must be named icon_collections_resized so install-vision-logos
# resolves install_overrides from icon-sets.json correctly.
GEN_OUT=$(mktemp -d)
trap 'rm -rf "$GEN_OUT"' EXIT
mkdir -p "$GEN_OUT/icon_collections_resized"
WORK="$GEN_OUT/icon_collections_resized"

if [[ ! -d "$SOURCE" ]]; then
  echo "✗ source directory not found: $SOURCE" >&2
  exit 1
fi
if [[ ! -f "$GENERATOR" ]]; then
  echo "✗ generator not found: $GENERATOR" >&2
  exit 1
fi

# Read generator flags from icon_sets.icon_collections in icon-sets.json
mapfile -t EXTRA_FLAGS < <(
  python3 - "$CONFIG" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1]))
flags = cfg["icon_sets"]["icon_collections"].get("generator_flags", [])
print("\n".join(flags))
PY
)

count=0
for png in "$SOURCE"/icon_*.png; do
  [[ -f "$png" ]] || continue
  base=$(basename "$png" .png)
  case "$base" in
    *_cropped|*_normalized) continue ;;
  esac

  stem="${base#icon_}"
  name="${stem//_/-}"

  echo "→ Tracing: $base → $name"
  python3 "$GENERATOR" \
    --source "$png" \
    --name "$name" \
    --output "$WORK" \
    --sizes 512 \
    --no-badge \
    --tight \
    --turdsize 2 \
    "${EXTRA_FLAGS[@]}"

  count=$((count + 1))
  echo ""
done

if [[ $count -eq 0 ]]; then
  echo "✗ no icon_*.png found in $SOURCE" >&2
  exit 1
fi

echo "→ Installing SVG marks from $WORK"
"$INSTALLER" "$WORK"

echo "✓ Regenerated $count mark(s). Run normalize-mark-viewbox.py apply + check next."
