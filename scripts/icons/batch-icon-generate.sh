#!/bin/bash
# batch-icon-generate.sh — Convert every icon_*.png in a directory to a tight,
# borderless SVG (512 longest side) plus a white-border-cropped PNG.
#
# Usage:
#   ./scripts/icons/batch-icon-generate.sh [ICONS_DIR] [extra generator flags...]
#
# Examples:
#   # icon_box — white glyph on a solid circle (the default archetype):
#   ./scripts/icons/batch-icon-generate.sh
#
#   # icon_multimodal — colored/gradient glyph + ring outline on white:
#   ./scripts/icons/batch-icon-generate.sh ~/workspace/icon_multimodal \
#       --colored-glyph --no-circle
#
# The first argument (if it doesn't start with "-") is the target directory;
# every remaining argument is passed straight through to the generator, so each
# icon set can specify its own masking mode without a bespoke script.

set -e

# Default icon directory: override with ICON_BOX_DIR, else ~/workspace/icon_box.
DEFAULT_DIR="${ICON_BOX_DIR:-$HOME/workspace/icon_box}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GENERATOR="$PROJECT_ROOT/scripts/icons/svg-icon-generator.py"
NORMALIZER="$PROJECT_ROOT/scripts/icons/normalize-icon-sources.py"
INK_EQUALIZER="$PROJECT_ROOT/scripts/icons/normalize-icon-ink.py"

# First arg = directory (unless it's a flag); the rest = pass-through flags.
if [[ $# -gt 0 && "$1" != -* ]]; then
    ICONS_DIR="$1"; shift
else
    ICONS_DIR="$DEFAULT_DIR"
fi
EXTRA_FLAGS=("$@")

# Load known icon sets from the configuration.
known_icon_sets() {
  python3 -c "import json; print(' '.join(json.load(open('$PROJECT_ROOT/scripts/icons/icon-sets.json'))['icon_sets'].keys()))"
}

if [[ ! -d "$ICONS_DIR" ]]; then
    echo "✗ icons directory not found: $ICONS_DIR"
    echo "  Pass a directory as the first argument or set ICON_BOX_DIR."
    exit 1
fi
if [[ ! -f "$GENERATOR" ]]; then
    echo "✗ Generator script not found: $GENERATOR"
    exit 1
fi

echo "🎨 Batch converting $ICONS_DIR/icon_*.png → tight SVG (512)"
[[ ${#EXTRA_FLAGS[@]} -gt 0 ]] && echo "   extra flags: ${EXTRA_FLAGS[*]}"
echo ""

# Normalize source PNGs when this folder is a known Vision icon set.
set_name=$(basename "$ICONS_DIR")
known_sets=$(known_icon_sets)
if [[ "$known_sets" =~ (^| )$set_name( |$) ]]; then
  if [[ -f "$NORMALIZER" ]]; then
    echo "⚖️  Normalizing sources in $set_name"
    python3 "$NORMALIZER" --dirs "$set_name"
    echo ""
  fi
fi

count=0
for png in "$ICONS_DIR"/icon_*.png; do
    if [[ ! -f "$png" ]]; then
        continue
    fi

    base=$(basename "$png" .png)
    case "$base" in
        *_cropped|*_normalized) continue ;;   # skip derived images
    esac

    normalized="$ICONS_DIR/${base}_normalized.png"
    if [[ -f "$normalized" ]]; then
        png="$normalized"
    fi

    stem="${base#icon_}"         # strip leading "icon_"
    name="${stem//_/-}"          # underscores → dashes
    cropped="$ICONS_DIR/icon_${stem}_cropped.png"

    echo "→ Converting: $base → $name"
    ICON_FLAGS=("${EXTRA_FLAGS[@]}")
    if [[ "$stem" == "drug_safety" ]]; then
        ICON_FLAGS=(--alpha-glyph --no-circle "${EXTRA_FLAGS[@]}")
    fi
    # --tight: borderless non-square viewBox; auto-crop stays ON so the white
    # margin is removed; --save-cropped emits the cropped icon_*_cropped.png.
    python3 "$GENERATOR" \
        --source "$png" \
        --name "$name" \
        --output "$ICONS_DIR" \
        --sizes 512 \
        --no-badge \
        --tight \
        --turdsize 2 \
        --save-cropped "$cropped" \
        "${ICON_FLAGS[@]}"

    count=$((count + 1))
    echo ""
done

# Post-trace ink equalizer for Vision icon sets.
set_name=$(basename "$ICONS_DIR")
known_sets=$(known_icon_sets)
if [[ "$known_sets" =~ (^| )$set_name( |$) ]]; then
  if [[ -f "$INK_EQUALIZER" && $count -gt 0 ]]; then
    echo "⚖️  Equalizing SVG ink in $set_name"
    python3 "$INK_EQUALIZER" --dirs "$set_name"
    echo ""
  fi
fi

echo "✓ Done. Processed $count icons."
echo "   Check: ls \"$ICONS_DIR\"/*-icon-512.svg | wc -l"
