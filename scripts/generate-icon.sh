#!/bin/bash
# generate-icon.sh — convenience wrapper for svg-icon-generator.py
#
# Usage:
#   ./scripts/generate-icon.sh path/to/source.png icon-name [options]
#
# Examples:
#   ./scripts/generate-icon.sh ~/Downloads/trophy.png trophy
#   ./scripts/generate-icon.sh icon.png skill-badge --sizes 24,32,48,512
#   ./scripts/generate-icon.sh icon.png doc --colored-glyph --no-circle --tight   # colored ink on white
#   ./scripts/generate-icon.sh icon.png doc --alpha-glyph --no-circle --tight     # transparent-bg PNG

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GENERATOR="$PROJECT_ROOT/scripts/svg-icon-generator.py"

if [[ ! -f "$GENERATOR" ]]; then
    echo "Error: svg-icon-generator.py not found at $GENERATOR"
    exit 1
fi

if [[ $# -lt 2 ]]; then
    echo "Usage: $(basename "$0") <source-image> <icon-name> [options]"
    echo ""
    echo "Options (see 'python3 scripts/svg-icon-generator.py --help' for all):"
    echo "  --output DIR                Output directory (default: src/assets/icons)"
    echo "  --sizes SIZE1,SIZE2,...     Comma-separated output sizes (default: 24,512)"
    echo "  --no-badge                  Skip badge variant generation"
    echo "  --tight                     Borderless non-square viewBox (glyph flush to all edges)"
    echo "  --save-cropped PATH         Also write the auto-cropped source image"
    echo "  --config FILE               JSON config file for advanced tuning"
    echo ""
    echo "  Mask mode (pick per source; default = light glyph on a dark/colored circle):"
    echo "  --dark-glyph                Dark glyph on a light background"
    echo "  --colored-glyph             Colored/gradient ink on a white field  [--white-threshold N]"
    echo "  --alpha-glyph               Transparent-background PNG (mask via alpha)  [--alpha-threshold N]"
    echo "  --no-circle                 Source has no circular container to mask out"
    echo "  --no-auto-crop              Keep the source's empty border"
    echo "  --light-threshold N         Brightness threshold 0-255 (default: 180)"
    echo ""
    echo "Examples:"
    echo "  $0 ~/Downloads/trophy.png trophy"
    echo "  $0 icon.png doc --colored-glyph --no-circle --tight"
    echo "  $0 icon.png doc --alpha-glyph --no-circle --tight"
    echo ""
    exit 1
fi

SOURCE="$1"
ICON_NAME="$2"
shift 2

if [[ ! -f "$SOURCE" ]]; then
    echo "Error: Source image not found: $SOURCE"
    exit 1
fi

# Convert relative paths to absolute
SOURCE="$(cd "$(dirname "$SOURCE")" && pwd)/$(basename "$SOURCE")"

echo "🎨 Generating SVG icon: $ICON_NAME"
echo "   Source: $SOURCE"
echo ""

python3 "$GENERATOR" \
    --source "$SOURCE" \
    --name "$ICON_NAME" \
    "$@"

echo ""
echo "✓ Done. Icons saved to src/assets/icons/"
