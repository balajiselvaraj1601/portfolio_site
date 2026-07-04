#!/usr/bin/env python3
"""square-and-center-icon.py — make a black-background icon square + centered.

Transform (NO RESIZING): detect the non-black content bbox, crop EXACTLY to it
(never inside it -> zero content loss), then paste it CENTERED onto a square black
canvas of side = max(cw,ch) + 2*round(MARGIN*max(cw,ch)). Every content pixel is
copied verbatim (a translation, never a scale/resample).

Usage:
  python3 square-and-center-icon.py --src DIR --out DIR --files a.png b.png ...
                                    [--margin 0.08] [--thr 20]
"""
import argparse, os, sys
from PIL import Image
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icon_common import content_bbox, square_side, paste_offset, THR, MARGIN


def fix_one(src_path, out_path, margin, thr):
    im = Image.open(src_path).convert("RGB")  # black-bg icons; flatten opaque alpha
    arr = np.asarray(im)
    bb = content_bbox(arr, thr)
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--files", nargs="+", required=True)
    ap.add_argument("--margin", type=float, default=MARGIN)
    ap.add_argument("--thr", type=int, default=THR)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    ok = True
    for name in a.files:
        try:
            info = fix_one(os.path.join(a.src, name), os.path.join(a.out, name), a.margin, a.thr)
            print(f"FIXED {name}: content {info['content']} -> {info['out_side']}^2")
        except Exception as e:
            ok = False
            print(f"ERROR {name}: {e}", file=sys.stderr)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
