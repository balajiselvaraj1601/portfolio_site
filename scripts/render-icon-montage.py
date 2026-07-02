#!/usr/bin/env python3
"""Render a montage of all Vision pipeline icons for visual brightness QA."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import cairosvg
import io
from PIL import Image, ImageDraw, ImageFont

from icon_brightness_lib import SET_CONFIG, list_svg_outputs

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGO_DIR = PROJECT_ROOT / "public/assets/logos"
OUT_DIR = PROJECT_ROOT / "docs/reference/screenshots"

# slug → (label, bg color, size)
CONTEXTS = {
    "hub": ("Hub 22px", (124, 58, 237), 22),
    "org": ("Org 48px", (30, 30, 40), 48),
    "badge": ("Badge 72px", (20, 20, 28), 72),
}


def render_logo(svg_path: Path, size: int, bg: tuple[int, int, int]) -> Image.Image:
    text = svg_path.read_text().replace('fill="currentColor"', 'fill="#ffffff"')
    png = cairosvg.svg2png(bytestring=text.encode(), output_width=size, output_height=size)
    icon = Image.open(io.BytesIO(png)).convert("RGBA")
    cell = Image.new("RGBA", (size + 16, size + 16), bg + (255,))
    cell.paste(icon, (8, 8), icon)
    return cell


def slug_for_svg(svg_name: str) -> str:
    stem = svg_name.replace("-icon-512.svg", "")
    return f"logo_{stem.replace('-', '_')}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--label", default="before", choices=["before", "after"])
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args()

    logos: list[tuple[str, Path]] = []
    for set_name, cfg in SET_CONFIG.items():
        icon_dir = cfg["dir"]
        if not icon_dir.is_dir():
            continue
        for svg in list_svg_outputs(icon_dir):
            slug = slug_for_svg(svg.name)
            installed = LOGO_DIR / f"{slug}.svg"
            logos.append((slug, installed if installed.exists() else svg))

    logos.sort(key=lambda x: x[0])
    if not logos:
        print("No logos found")
        return 1

    cell_w, cell_h = 100, 120
    cols = 6
    rows = (len(logos) + cols - 1) // cols
    montage = Image.new("RGB", (cols * cell_w, rows * cell_h + 30), (18, 18, 24))
    draw = ImageDraw.Draw(montage)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 9)
    except OSError:
        font = ImageFont.load_default()

    draw.text((8, 8), f"Vision icons montage ({args.label})", fill=(220, 220, 230), font=font)

    for i, (slug, svg_path) in enumerate(logos):
        col = i % cols
        row = i // cols
        x = col * cell_w + 8
        y = row * cell_h + 36
        cell = render_logo(svg_path, 48, (124, 58, 237))
        montage.paste(cell.convert("RGB"), (x, y))
        draw.text((x, y + 58), slug.replace("logo_", "")[:14], fill=(180, 180, 190), font=font)

    out = args.out or OUT_DIR / f"vision-icons-montage-{args.label}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    montage.save(out)
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
