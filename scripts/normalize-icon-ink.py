#!/usr/bin/env python3
"""Post-trace SVG ink equalizer — scale paths to a shared glyph ink target."""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from icon_brightness_lib import (
    INK_TOL,
    SET_CONFIG,
    TARGET_GLYPH_INK,
    effective_ink,
    list_svg_outputs,
    measure_svg,
    scale_svg_ink,
)


def equalize_svg(svg_path: Path, set_name: str, target: float, *, max_iters: int = 8) -> tuple[float, float]:
    before = effective_ink(measure_svg(svg_path, set_name))
    current = before

    for _ in range(max_iters):
        if abs(current - target) <= INK_TOL:
            break
        if current < 1.0:
            break
        scale = math.sqrt(target / current)
        scale_svg_ink(svg_path, scale)
        current = effective_ink(measure_svg(svg_path, set_name))

    after = current
    return before, after


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dirs",
        nargs="*",
        default=list(SET_CONFIG.keys()),
    )
    parser.add_argument("--target", type=float, default=TARGET_GLYPH_INK)
    args = parser.parse_args()

    for set_name in args.dirs:
        icon_dir = SET_CONFIG[set_name]["dir"]
        if not icon_dir.is_dir():
            print(f"skip missing {icon_dir}")
            continue

        print(f"=== equalize {set_name} → {args.target}% ===")
        for svg in list_svg_outputs(icon_dir):
            before, after = equalize_svg(svg, set_name, args.target)
            mark = "✓" if abs(after - args.target) <= INK_TOL else "~"
            print(f"  {mark} {svg.name}: {before:.1f}% → {after:.1f}%")
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
