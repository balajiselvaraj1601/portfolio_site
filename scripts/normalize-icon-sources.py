#!/usr/bin/env python3
"""Normalize source PNGs toward a shared glyph brightness standard."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from icon_brightness_lib import (
    SET_CONFIG,
    TARGET_GLYPH_INK,
    TARGET_LUM,
    list_source_pngs,
    normalize_png,
)
from PIL import Image


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dirs",
        nargs="*",
        default=list(SET_CONFIG.keys()),
        help="Icon set folder names",
    )
    parser.add_argument("--target-lum", type=float, default=TARGET_LUM)
    parser.add_argument("--target-glyph-ink", type=float, default=TARGET_GLYPH_INK)
    args = parser.parse_args()

    count = 0
    for set_name in args.dirs:
        icon_dir = SET_CONFIG[set_name]["dir"]
        if not icon_dir.is_dir():
            print(f"skip missing {icon_dir}")
            continue

        print(f"=== normalize {set_name} ===")
        for png in list_source_pngs(icon_dir):
            rgba, before, after = normalize_png(
                png,
                set_name,
                target_lum=args.target_lum,
                target_ink=args.target_glyph_ink,
            )
            out = png.with_name(png.stem + "_normalized.png")
            Image.fromarray(rgba).save(out)
            count += 1
            print(
                f"  {png.name}: fg {before.foreground_pct:.1f}%→{after.foreground_pct:.1f}% "
                f"lum {before.mean_lum:.1f}→{after.mean_lum:.1f} → {out.name}"
            )
        print()

    print(f"✓ Normalized {count} PNG(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
