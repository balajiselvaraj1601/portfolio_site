#!/usr/bin/env python3
"""Crop an SVG to visible (non-transparent) ink bounds.

Uses Playwright + Chromium to render at native viewBox size and scan alpha pixels.
Preserves all path data; only changes viewBox and optional width/height on the root.

Usage:
  python3 crop-visible-ink.py INPUT.svg OUTPUT.svg
  python3 crop-visible-ink.py INPUT.svg --verify-only
  python3 crop-visible-ink.py INPUT.svg OUTPUT.svg --in-place

Requires: playwright (install in image_gen venv: uv pip install playwright && playwright install chromium)
"""

from __future__ import annotations

import argparse
import base64
import math
import re
import sys
from pathlib import Path


def parse_viewbox(svg: str) -> tuple[float, float, float, float]:
    m = re.search(r'viewBox="([^"]+)"', svg)
    if not m:
        raise ValueError("SVG has no viewBox attribute")
    parts = [float(x) for x in m.group(1).split()]
    if len(parts) != 4:
        raise ValueError(f"Invalid viewBox: {m.group(1)!r}")
    return parts[0], parts[1], parts[2], parts[3]


def visible_ink_bbox(svg_text: str, render_w: float, render_h: float) -> dict[str, float]:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit(
            "playwright is required. Use: /home/engineer/workspace/image_gen/.venv/bin/python3"
        ) from exc

    b64 = base64.b64encode(svg_text.encode()).decode()
    html = f"""<!DOCTYPE html><html><body style="margin:0">
<img id="l" src="data:image/svg+xml;base64,{b64}"
     width="{render_w}" height="{render_h}" style="display:block">
</body></html>"""

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(
            viewport={"width": math.ceil(render_w), "height": math.ceil(render_h)}
        )
        page.set_content(html)
        raw = page.evaluate(
            """async () => {
            const img = document.getElementById('l');
            await img.decode();
            const c = document.createElement('canvas');
            c.width = Math.round(img.getBoundingClientRect().width);
            c.height = Math.round(img.getBoundingClientRect().height);
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0, c.width, c.height);
            const d = ctx.getImageData(0, 0, c.width, c.height).data;
            let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
            for (let y = 0; y < c.height; y++) {
                for (let x = 0; x < c.width; x++) {
                    if (d[(y * c.width + x) * 4 + 3] > 0) {
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            return { minX, minY, maxX, maxY, w: c.width, h: c.height };
        }"""
        )
        browser.close()

    sx = render_w / raw["w"]
    sy = render_h / raw["h"]
    return {
        "minX": raw["minX"] * sx,
        "minY": raw["minY"] * sy,
        "maxX": (raw["maxX"] + 1) * sx,
        "maxY": (raw["maxY"] + 1) * sy,
        "renderW": render_w,
        "renderH": render_h,
    }


def extract_inner(svg: str) -> tuple[str, str]:
    """Return (defs block, path/group body) preserving paths."""
    defs_m = re.search(r"<defs>.*?</defs>", svg, re.DOTALL)
    defs = defs_m.group(0) if defs_m else ""
    paths = re.findall(r"<path\b[^>]*/>", svg)
    if not paths:
        raise ValueError("No <path> elements found")
    return defs, "".join(paths)


def build_cropped_svg(svg: str, ink: dict[str, float]) -> str:
    min_x = round(ink["minX"], 2)
    min_y = round(ink["minY"], 2)
    vb_w = round(ink["maxX"] - ink["minX"], 2)
    vb_h = round(ink["maxY"] - ink["minY"], 2)
    defs, body = extract_inner(svg)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{min_x} {min_y} {vb_w} {vb_h}" '
        f'width="{vb_w}" height="{vb_h}">'
        f"{defs}<g>{body}</g></svg>"
    )


def verify_margins(svg_text: str) -> dict[str, float]:
    ox, oy, rw, rh = parse_viewbox(svg_text)
    ink = visible_ink_bbox(svg_text, rw, rh)
    # Render size = viewBox width/height, so ink coords are 0-based in viewBox space
    return {
        "top": ink["minY"],
        "left": ink["minX"],
        "bottom": rh - ink["maxY"],
        "right": rw - ink["maxX"],
        "viewBox": (ox, oy, rw, rh),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Crop SVG to visible ink bounds")
    parser.add_argument("input", type=Path, help="Source SVG")
    parser.add_argument("output", type=Path, nargs="?", help="Output SVG path")
    parser.add_argument("--verify-only", action="store_true", help="Print margins; do not write")
    parser.add_argument("--in-place", action="store_true", help="Overwrite input file")
    args = parser.parse_args()

    src = args.input.read_text()
    ox, oy, rw, rh = parse_viewbox(src)
    ink = visible_ink_bbox(src, rw, rh)

    if args.verify_only:
        margins = verify_margins(args.input.read_text())
        ox, oy, rw, rh = margins["viewBox"]
        print(f"viewBox: {ox} {oy} {rw} {rh}")
        print(
            f"margins (px): top={margins['top']:.1f} "
            f"bottom={margins['bottom']:.1f} "
            f"left={margins['left']:.1f} "
            f"right={margins['right']:.1f}"
        )
        return 0

    if args.in_place:
        out_path = args.input
    else:
        if not args.output:
            print("error: OUTPUT path required unless --verify-only or --in-place", file=sys.stderr)
            return 1
        out_path = args.output

    cropped = build_cropped_svg(src, ink)
    out_path.write_text(cropped)

    margins = verify_margins(cropped)
    print(f"wrote {out_path}")
    print(f"viewBox: {margins['viewBox']}")
    print(
        f"margins (px): top={margins['top']:.1f} bottom={margins['bottom']:.1f} "
        f"left={margins['left']:.1f} right={margins['right']:.1f}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
