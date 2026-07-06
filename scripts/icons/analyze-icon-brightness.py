#!/usr/bin/env python3
"""Analyze PNG + SVG brightness metrics for Vision icon pipeline sets."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from icon_brightness_lib import (
    SET_CONFIG,
    TARGET_GLYPH_INK,
    TARGET_LUM,
    effective_ink,
    list_source_pngs,
    list_svg_outputs,
    measure_png,
    measure_svg,
    write_report,
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--label",
        default="pass3",
        help="Report label suffix (before/after)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("docs/audits/vision-icon-brightness-pass3.json"),
    )
    parser.add_argument(
        "--dirs",
        nargs="*",
        default=list(SET_CONFIG.keys()),
        help="Icon set names (default: all)",
    )
    args = parser.parse_args()

    png_stats = []
    svg_stats = []

    print(f"Targets: lum={TARGET_LUM}, glyph_ink={TARGET_GLYPH_INK}%")
    print()

    for set_name in args.dirs:
        icon_dir = SET_CONFIG[set_name]["dir"]
        if not icon_dir.is_dir():
            print(f"skip missing {icon_dir}")
            continue

        print(f"=== {set_name} ===")
        for png in list_source_pngs(icon_dir):
            s = measure_png(png, set_name)
            png_stats.append(s)
            print(
                f"  PNG {s.file:35} fg={s.foreground_pct:5.1f}% "
                f"lum={s.mean_lum:6.1f}"
            )

        for svg in list_svg_outputs(icon_dir):
            s = measure_svg(svg, set_name)
            svg_stats.append(s)
            ink = effective_ink(s)
            print(
                f"  SVG {s.file:35} ink={ink:5.1f}% "
                f"mode={s.measure_mode}"
            )
        print()

    out = args.out
    if args.label and "before" not in out.name and "after" not in out.name:
        out = out.with_name(out.stem + f"-{args.label}" + out.suffix)
    write_report(out, args.label, png_stats, svg_stats)
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
