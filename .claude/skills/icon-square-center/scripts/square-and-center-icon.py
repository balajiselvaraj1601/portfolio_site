#!/usr/bin/env python3
"""square-and-center-icon.py — make a black-background icon square + centered.

Transform (NO RESIZING): detect inclusive crop bbox (main ink + dim tail), crop
EXACTLY to it (never inside it -> zero content loss), then paste CENTERED onto a
square black canvas of side = max(cw,ch) + 2*pad. Every content pixel is copied
verbatim (a translation, never a scale/resample).

Usage:
  python3 square-and-center-icon.py --src DIR --out DIR --files a.png b.png ...
  python3 square-and-center-icon.py --src DIR --out DIR --all
                                    [--margin 0.08]
"""
import argparse
import os
import sys
from PIL import Image
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icon_common import (
    crop_bbox,
    square_side,
    paste_offset,
    list_png_files,
    FullBleedSourceError,
    MARGIN,
)


def fix_one(src_path, out_path, margin):
    im = Image.open(src_path).convert("RGB")  # black-bg icons; flatten opaque alpha
    arr = np.asarray(im)
    bb = crop_bbox(arr)
    if bb is None:
        raise ValueError(f"no foreground detected in {src_path}")
    x0, y0, x1, y1 = bb
    cw, ch = x1 - x0, y1 - y0
    content = im.crop((x0, y0, x1, y1))            # exact content, no scaling
    side = square_side(cw, ch, margin)
    ox, oy = paste_offset(side, cw, ch)
    canvas = Image.new("RGB", (side, side), (0, 0, 0))
    canvas.paste(content, (ox, oy))                # centered, verbatim pixels
    canvas.save(out_path)
    return {"file": os.path.basename(src_path), "content": [cw, ch], "out_side": side, "paste": [ox, oy]}


def resolve_files(src_dir, files, use_all):
    if use_all:
        if files:
            raise SystemExit("error: use --files or --all, not both")
        names = list_png_files(src_dir)
        if not names:
            raise SystemExit(f"error: no PNG files in {src_dir}")
        return names
    if not files:
        raise SystemExit("error: specify --files NAME ... or --all")
    return files


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--files", nargs="*", default=[])
    ap.add_argument("--all", action="store_true", help="Process every *.png in --src")
    ap.add_argument("--margin", type=float, default=MARGIN)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    names = resolve_files(a.src, a.files, a.all)
    ok = True
    for name in names:
        try:
            info = fix_one(
                os.path.join(a.src, name),
                os.path.join(a.out, name),
                a.margin,
            )
            print(f"FIXED {name}: content {info['content']} -> {info['out_side']}^2")
        except FullBleedSourceError as e:
            ok = False
            print(f"ERROR {name}: {e}", file=sys.stderr)
        except Exception as e:
            ok = False
            print(f"ERROR {name}: {e}", file=sys.stderr)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
