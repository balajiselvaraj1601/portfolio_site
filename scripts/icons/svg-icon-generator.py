#!/usr/bin/env python3
"""
svg-icon-generator.py — production icon pipeline for portfolio site

Converts flat, two-tone icon images (PNG/JPG) into clean, optimized,
currentColor SVG icons with support for:
  - Circular badge variants (glyph as cutout)
  - Multiple output sizes (responsive scaling)
  - Automatic proportional normalization
  - Full path flattening and optimization

Usage:
    python3 scripts/icons/svg-icon-generator.py --source path/to/icon.png --name icon-name [options]
    python3 scripts/icons/svg-icon-generator.py --config config.json

Requires:
    - System: potrace, npm (svgo)
    - Python: pillow, numpy, svgelements
    - Setup: apt install potrace; pip install pillow numpy svgelements; npm install -g svgo

Reference: SVG-ICON-GENERATOR.md (7-phase pipeline with verification)
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from svgelements import Path as SVGPath, Matrix


class IconPipeline:
    """Raster icon → optimized, recolorable SVG with badge support."""

    # Base design canvas (unitless). All square-mode geometry — badge radius,
    # glyph padding, center offset — is expressed relative to this and scaled to
    # each output size. Single source of truth; never inline the literal.
    BASE_CANVAS = 24
    # Padding inset (in BASE_CANVAS units per side) for the padded square glyph —
    # the "breathing room" that keeps a glyph off the exact canvas edge.
    SQUARE_PADDING = 3
    # External binaries the pipeline shells out to (name → install hint).
    REQUIRED_BINARIES = {
        "potrace": "apt install potrace",
        "npx": "npm install -g svgo  (npx ships with Node)",
    }

    DEFAULT_CONFIG = {
        "foreground_is_light": True,
        # foreground_mode overrides foreground_is_light when set. One of:
        #   "light"    — glyph brighter than bg (all channels > light_threshold)
        #   "dark"     — glyph darker than bg (all channels < light_threshold)
        #   "nonwhite" — glyph is any non-white ink on a white field (min channel
        #                < white_threshold). Handles COLORED and gradient glyphs,
        #                which the light/dark tests miss (a red pixel has a high
        #                R channel, so "all channels dark" drops it).
        #   "alpha"    — glyph is the opaque region of a TRANSPARENT-background
        #                source (alpha > alpha_threshold); color-agnostic.
        "foreground_mode": None,
        "light_threshold": 180,
        "white_threshold": 235,
        "alpha_threshold": 128,
        "crop_threshold": 240,
        "constrain_to_circle": True,
        "circle_inset": 0.995,
        "opttolerance": 0.1,
        "alphamax": 1.3,
        "turdsize": 4,
        "auto_crop_whitespace": True,
        "tight": False,
        "save_cropped_path": None,
        "sizes": [24, 512],
        "glyph_fill_fraction": 0.875,
        "badge": {
            "glyph_fraction_of_diameter": 0.65,
            "vertical_center_offset": 0.0125,
        },
    }

    @staticmethod
    def _check_deps():
        """Fail fast with a clear message if a required binary is missing."""
        missing = [
            f"  - {name}: {hint}"
            for name, hint in IconPipeline.REQUIRED_BINARIES.items()
            if shutil.which(name) is None
        ]
        if missing:
            raise RuntimeError(
                "Missing required dependencies:\n"
                + "\n".join(missing)
                + "\nInstall them and re-run."
            )

    _LEGAL_MODES = {"light", "dark", "nonwhite", "alpha"}

    def _validate_config(self):
        """Fail fast at construction on an out-of-range or malformed config,
        instead of deep inside the pipeline (or silently)."""
        c = self.cfg

        mode = c.get("foreground_mode")
        if mode is not None and mode not in self._LEGAL_MODES:
            raise ValueError(
                f"foreground_mode must be one of {sorted(self._LEGAL_MODES)} or null, "
                f"got {mode!r}"
            )

        for key in ("light_threshold", "white_threshold", "alpha_threshold", "crop_threshold"):
            v = c.get(key)
            if v is not None and not (0 <= v <= 255):
                raise ValueError(f"{key} must be in [0, 255], got {v}")

        sizes = c.get("sizes")
        if not isinstance(sizes, (list, tuple)) or not sizes:
            raise ValueError(f"sizes must be a non-empty list, got {sizes!r}")
        if any(not isinstance(s, int) or s <= 0 for s in sizes):
            raise ValueError(f"sizes must be positive integers, got {sizes!r}")

        gff = c.get("glyph_fill_fraction")
        if gff is None or not (0 < gff <= 1):
            raise ValueError(f"glyph_fill_fraction must be in (0, 1], got {gff!r}")

        badge = c.get("badge")
        if badge is not None:
            if not isinstance(badge, dict):
                raise ValueError("badge must be a dict or null")
            missing = {"glyph_fraction_of_diameter", "vertical_center_offset"} - set(badge)
            if missing:
                raise ValueError(f"badge config missing keys: {sorted(missing)}")

    def __init__(self, source_image, output_dir, icon_name, config_overrides=None):
        self.source_image = Path(source_image)
        self.output_dir = Path(output_dir)
        self.icon_name = icon_name
        self.workdir = self.output_dir / "_work"

        self.cfg = self.DEFAULT_CONFIG.copy()
        if config_overrides:
            self.cfg.update(config_overrides)
        self._validate_config()

        if not self.source_image.exists():
            raise FileNotFoundError(f"Source image not found: {self.source_image}")

        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.workdir.mkdir(parents=True, exist_ok=True)

    def _content_mask(self, rgba, mode):
        """Boolean 'real content' mask used to auto-crop the empty border:
        opaque pixels for a transparent source (`alpha` mode), non-white pixels
        otherwise. `crop_threshold` stays distinct from `light_threshold` —
        margin-white is not the same concept as glyph-brightness."""
        if mode == "alpha":
            return rgba[..., 3] > self.cfg["alpha_threshold"]
        ct = self.cfg["crop_threshold"]
        r, g, b = rgba[..., 0], rgba[..., 1], rgba[..., 2]
        return ~((r >= ct) & (g >= ct) & (b >= ct))

    def _foreground_mode(self):
        """Resolve the foreground-detection mode. An explicit `foreground_mode`
        config wins; otherwise fall back to the legacy `foreground_is_light`
        bool (True→light, False→dark) so existing configs keep working."""
        mode = self.cfg.get("foreground_mode")
        if mode:
            return mode
        return "light" if self.cfg.get("foreground_is_light", True) else "dark"

    def measure_and_mask(self):
        """Phase 1+2: Inspect source and build clean binary glyph mask."""
        im = Image.open(self.source_image)
        rgba = np.array(im.convert("RGBA"))
        mode = self._foreground_mode()

        if self.cfg.get("auto_crop_whitespace", True):
            content = self._content_mask(rgba, mode)
            rows = np.where(content.any(axis=1))[0]
            cols = np.where(content.any(axis=0))[0]
            if len(rows) and len(cols):
                oh, ow = rgba.shape[:2]
                rgba = rgba[rows[0] : rows[-1] + 1, cols[0] : cols[-1] + 1]
                nh, nw = rgba.shape[:2]
                if (nh, nw) != (oh, ow):
                    print(f"  Auto-crop: {ow}×{oh} → {nw}×{nh}")

        save_cropped = self.cfg.get("save_cropped_path")
        if save_cropped:
            # Preserve transparency only if the source actually uses it, so
            # opaque RGB(A) sources keep their original RGB cropped output.
            out = Image.fromarray(rgba)
            if not (rgba[..., 3] < 255).any():
                out = out.convert("RGB")
            out.save(save_cropped)
            print(f"  Cropped image saved: {save_cropped}")

        h, w = rgba.shape[:2]
        print(f"  Source: {w}×{h} px")

        r = rgba[..., 0].astype(int)
        g = rgba[..., 1].astype(int)
        b = rgba[..., 2].astype(int)
        alpha = rgba[..., 3]

        t = self.cfg["light_threshold"]
        if mode == "light":
            is_fg = (r > t) & (g > t) & (b > t)
        elif mode == "dark":
            is_fg = (r < t) & (g < t) & (b < t)
        elif mode == "nonwhite":
            # Any pixel meaningfully off-white is ink — works for colored/gradient
            # glyphs where a per-channel dark test fails on saturated hues. Exclude
            # transparent pixels: PIL renders them [0,0,0], which would otherwise
            # read as dark ink on a transparent-background source.
            is_fg = (np.minimum(np.minimum(r, g), b) < self.cfg["white_threshold"]) & (
                alpha > self.cfg["alpha_threshold"]
            )
        elif mode == "alpha":
            # Transparent-background source: the glyph is exactly the opaque
            # region, independent of its colors.
            if not (alpha < 255).any():
                raise ValueError(
                    "--alpha-glyph needs a transparent-background source, but this "
                    "image is fully opaque (alpha=255 everywhere). Use --colored-glyph "
                    "(colored ink on white), --dark-glyph, or the default light mode."
                )
            is_fg = alpha > self.cfg["alpha_threshold"]
        else:
            raise ValueError(f"Unknown foreground_mode: {mode!r}")
        print(f"  Foreground mode: {mode}")

        inside = np.ones((h, w), dtype=bool)
        circle = None

        if self.cfg["constrain_to_circle"]:
            bg_mask = ~is_fg
            ys, xs = np.where(bg_mask)
            if len(xs) > 0:
                cy = (ys.min() + ys.max()) / 2
                cx = (xs.min() + xs.max()) / 2
                radius = (
                    min(xs.max() - xs.min(), ys.max() - ys.min())
                    / 2
                    * self.cfg["circle_inset"]
                )
                Y, X = np.mgrid[0:h, 0:w]
                inside = (X - cx) ** 2 + (Y - cy) ** 2 < radius**2
                circle = (cx, cy, radius)
                print(
                    f"  Circle: center=({cx:.1f},{cy:.1f}) radius={radius:.1f}"
                )

        glyph_mask = is_fg & inside
        ys, xs = np.where(glyph_mask)
        if len(xs) == 0:
            raise ValueError("No glyph pixels found — check threshold and mask settings")

        print(f"  Glyph bbox: x[{xs.min()}-{xs.max()}] y[{ys.min()}-{ys.max()}]")
        if circle:
            cx, cy, radius = circle
            w_pct = 100 * (xs.max() - xs.min()) / (2 * radius)
            h_pct = 100 * (ys.max() - ys.min()) / (2 * radius)
            print(f"  Glyph as % of container: w={w_pct:.1f}% h={h_pct:.1f}%")

        binary = np.where(glyph_mask, 0, 255).astype(np.uint8)
        self._binary = binary
        return binary

    def trace_to_svg(self):
        """Phase 3: potrace the mask into a raw SVG."""
        pbm_path = self.workdir / "_mask.pbm"
        Image.fromarray(self._binary).convert("1").save(pbm_path)
        print(f"  Mask saved: {pbm_path}")

        raw_svg = self.workdir / "_raw.svg"
        cmd = [
            "potrace",
            "-s",
            "-O",
            str(self.cfg["opttolerance"]),
            "-a",
            str(self.cfg["alphamax"]),
            "-t",
            str(self.cfg["turdsize"]),
            str(pbm_path),
            "-o",
            str(raw_svg),
        ]
        print(f"  Running: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
        print(f"  Traced: {raw_svg}")
        return raw_svg

    def extract_flat_path(self, raw_svg_path):
        """Phase 4: Parse potrace output, bake transform into absolute coords.

        potrace emits one <path> element per disconnected region group, so a
        multi-part glyph (e.g. a globe + separate location pins) yields several
        <path> tags. Combine them ALL — grabbing only the first silently drops
        every other shape.
        """
        svg_text = Path(raw_svg_path).read_text()
        transform_m = re.search(r'<g transform="([^"]+)"', svg_text)
        d_list = re.findall(r'<path[^>]*\bd="([^"]+)"', svg_text)

        if not d_list:
            raise RuntimeError("No <path> found in potrace output")

        print(f"  Combined {len(d_list)} potrace path(s)")
        p = SVGPath(" ".join(d_list))
        if transform_m:
            nums = re.findall(r"-?[\d.]+", transform_m.group(1))
            if len(nums) != 4:
                raise RuntimeError(
                    "Unexpected potrace transform "
                    f'"{transform_m.group(1)}" — expected 4 numbers '
                    f"(translate + scale), got {len(nums)}: {nums}"
                )
            tx, ty, sx, sy = map(float, nums)
            m = Matrix()
            m.post_scale(sx, sy)
            m.post_translate(tx, ty)
            p *= m
        p.reify()
        return p.d()

    def _scale_to(self, path_d_source, longest):
        """Fresh-parse a path, scale so its longest side == `longest`, and shift
        its bbox min to the origin. Returns (path, scaled_w, scaled_h).

        Shared core of both normalize variants. The fresh `SVGPath(d)` per call
        is the mutation-safety discipline — never route a transformed Path back
        through here.
        """
        p = SVGPath(path_d_source)  # Fresh parse — never reuse a transformed Path
        xmin, ymin, xmax, ymax = p.bbox()
        bw, bh = xmax - xmin, ymax - ymin
        # Scale by the larger dimension so wide/tall glyphs never overflow (clip).
        scale = longest / max(bw, bh)
        m = Matrix()
        m.post_translate(-xmin, -ymin)
        m.post_scale(scale, scale)
        p *= m
        p.reify()
        return p, bw * scale, bh * scale

    def normalize(self, path_d_source, target_longest, canvas, center=None):
        """Scale so the glyph's longest side == `target_longest`, then center its
        bbox on `center` (default: canvas midpoint)."""
        p, sw, sh = self._scale_to(path_d_source, target_longest)
        tx, ty = center if center else (canvas / 2, canvas / 2)
        p *= Matrix.translate(tx - sw / 2, ty - sh / 2)
        p.reify()
        return p.d(), p.bbox()

    def normalize_tight(self, path_d_source, longest):
        """Scale glyph so its longest side == `longest`, bbox flush to the origin.

        Returns (d, w, h) for a viewBox that wraps the glyph exactly — no padding
        on any side (glyph flush to all four edges of a non-square canvas).
        """
        p, sw, sh = self._scale_to(path_d_source, longest)
        return p.d(), round(sw), round(sh)

    def circle_path_d(self, cx, cy, r):
        """Full circle as two-arc path data."""
        return f"M{cx+r},{cy}A{r},{r} 0 1 0 {cx-r},{cy}A{r},{r} 0 1 0 {cx+r},{cy}Z"

    def _svg(self, d, w, h, extra_d=None):
        """Assemble a currentColor SVG. Square mode passes w==h; tight mode passes
        the non-square glyph box; badge passes the circle via `extra_d`."""
        combined = d if not extra_d else f"{extra_d} {d}"
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}" fill="currentColor">\n'
            f'<path fill-rule="evenodd" clip-rule="evenodd" d="{combined}"/>\n</svg>'
        )

    def _verify(self, path_d, w, h, mode):
        """Re-measure the produced glyph path and assert it matches intent.

        tight  → bbox flush to (0,0,w,h) on all four edges.
        square → glyph bbox centered on (w/2, h/2).
        Prints the measured delta; raises only on gross deviation (a real
        regression), tolerant of sub-pixel scaling/rounding noise.
        """
        xmin, ymin, xmax, ymax = SVGPath(path_d).bbox()
        if mode == "tight":
            tol = max(1.0, max(w, h) * 0.01)
            deltas = (abs(xmin), abs(ymin), abs(xmax - w), abs(ymax - h))
            print(
                f"  ✓ verified: bbox [{xmin:.1f},{ymin:.1f},{xmax:.1f},{ymax:.1f}] "
                f"flush to {w}×{h} (max Δ={max(deltas):.2f}px, tol {tol:.1f})"
            )
            if max(deltas) > tol:
                raise RuntimeError(
                    f"tight bbox not flush to {w}×{h}: got "
                    f"[{xmin:.1f},{ymin:.1f},{xmax:.1f},{ymax:.1f}]"
                )
        else:
            cx, cy = (xmin + xmax) / 2, (ymin + ymax) / 2
            off = ((cx - w / 2) ** 2 + (cy - h / 2) ** 2) ** 0.5
            tol = max(1.0, w * 0.02)
            print(f"  ✓ verified: center offset {off:.2f}px (tol {tol:.1f})")
            if off > tol:
                raise RuntimeError(f"glyph off-center by {off:.2f}px (tol {tol:.1f})")

    def optimize_svg(self, svg_path, out_path, precision=2):
        """Phase 6: svgo optimization."""
        cmd = [
            "npx",
            "svgo",
            "-i",
            str(svg_path),
            "-o",
            str(out_path),
            "--pretty",
            f"--precision={precision}",
        ]
        subprocess.run(cmd, check=True, capture_output=True)

    def run(self):
        """Execute the full pipeline."""
        self._check_deps()

        print("\n=== Phase 1-2: Measuring & Masking ===")
        self.measure_and_mask()

        print("\n=== Phase 3: Tracing ===")
        raw_svg = self.trace_to_svg()

        print("\n=== Phase 4: Flattening Transform ===")
        flat_d = self.extract_flat_path(raw_svg)
        print(f"  Flattened path extracted (reusable source for all sizes)")

        print("\n=== Phase 5-6: Normalizing & Optimizing ===")
        outputs = []

        # Tight mode: borderless, non-square viewBox wrapping the glyph exactly.
        # No badge variant, no fill-fraction padding.
        if self.cfg.get("tight"):
            for size in self.cfg["sizes"]:
                glyph_d, w, h = self.normalize_tight(flat_d, size)
                self._verify(glyph_d, w, h, "tight")
                icon_svg = self._svg(glyph_d, w, h)
                raw_path = self.workdir / f"tight_{size}.svg"
                raw_path.write_text(icon_svg)

                out_path = self.output_dir / f"{self.icon_name}-icon-{size}.svg"
                self.optimize_svg(raw_path, out_path)
                print(f"  ✓ {out_path.name}  (viewBox 0 0 {w} {h})")
                outputs.append(str(out_path))

            print("\n=== Phase 7: Verification ===")
            print(f"  Generated {len(outputs)} SVG files:")
            for out in outputs:
                print(f"    {out}")
            return outputs

        for size in self.cfg["sizes"]:
            scale_factor = size / self.BASE_CANVAS

            # Standalone glyph — padded square, glyph centered.
            target_longest = (
                self.cfg["glyph_fill_fraction"]
                * (self.BASE_CANVAS - self.SQUARE_PADDING)
                * scale_factor
            )
            glyph_d, _ = self.normalize(flat_d, target_longest, size)
            self._verify(glyph_d, size, size, "square")
            icon_svg = self._svg(glyph_d, size, size)
            raw_path = self.workdir / f"icon_{size}.svg"
            raw_path.write_text(icon_svg)

            out_path = self.output_dir / f"{self.icon_name}-icon-{size}.svg"
            self.optimize_svg(raw_path, out_path)
            print(f"  ✓ {out_path.name}")
            outputs.append(str(out_path))

            # Badge variant
            if self.cfg["badge"]:
                b = self.cfg["badge"]
                r = (self.BASE_CANVAS / 2) * scale_factor
                cx = cy = (self.BASE_CANVAS / 2) * scale_factor
                circle_d = self.circle_path_d(cx, cy, r)

                target_longest = b["glyph_fraction_of_diameter"] * (2 * r)
                center = (
                    cx,
                    cy + b["vertical_center_offset"] * self.BASE_CANVAS * scale_factor,
                )
                glyph_d, _ = self.normalize(flat_d, target_longest, size, center=center)

                badge_svg = self._svg(glyph_d, size, size, extra_d=circle_d)
                raw_path = self.workdir / f"badge_{size}.svg"
                raw_path.write_text(badge_svg)

                out_path = self.output_dir / f"{self.icon_name}-badge-{size}.svg"
                self.optimize_svg(raw_path, out_path)
                print(f"  ✓ {out_path.name}")
                outputs.append(str(out_path))

        print("\n=== Phase 7: Verification ===")
        print(f"  Generated {len(outputs)} SVG files:")
        for out in outputs:
            print(f"    {out}")

        return outputs


def main():
    parser = argparse.ArgumentParser(
        description="Generate optimized currentColor SVG icons from raster images"
    )
    parser.add_argument(
        "--source", required=True, help="Source image path (PNG/JPG)"
    )
    parser.add_argument(
        "--name", required=True, help="Icon name (for output filenames)"
    )
    parser.add_argument(
        "--output",
        default="src/assets/icons",
        help="Output directory (default: src/assets/icons)",
    )
    parser.add_argument(
        "--config", help="JSON config file for advanced tuning"
    )
    parser.add_argument(
        "--light-threshold",
        type=int,
        help="Brightness threshold for foreground detection (0-255)",
    )
    parser.add_argument(
        "--sizes",
        help="Comma-separated output sizes (default: 24,512)",
    )
    parser.add_argument(
        "--no-badge",
        action="store_true",
        help="Skip badge variant generation",
    )
    parser.add_argument(
        "--dark-glyph",
        action="store_true",
        help="Source glyph is darker than its background (default: lighter)",
    )
    parser.add_argument(
        "--colored-glyph",
        action="store_true",
        help="Glyph is colored/gradient ink on a white field (non-white mask) — "
        "use when a dark/light threshold misses saturated hues",
    )
    parser.add_argument(
        "--white-threshold",
        type=int,
        help="Off-white cutoff for --colored-glyph (0-255, default 235)",
    )
    parser.add_argument(
        "--alpha-glyph",
        action="store_true",
        help="Transparent-background source — mask the opaque region via the "
        "alpha channel (color-agnostic)",
    )
    parser.add_argument(
        "--alpha-threshold",
        type=int,
        help="Opacity cutoff for --alpha-glyph (0-255, default 128)",
    )
    parser.add_argument(
        "--no-circle",
        action="store_true",
        help="Source has no circular container to mask out",
    )
    parser.add_argument(
        "--turdsize",
        type=int,
        help="Suppress noise specks smaller than N pixels (default: 4)",
    )
    parser.add_argument(
        "--no-auto-crop",
        action="store_true",
        help="Disable automatic whitespace cropping",
    )
    parser.add_argument(
        "--tight",
        action="store_true",
        help="Borderless output: non-square viewBox wrapping the glyph exactly "
        "(no badge, no fill-fraction padding)",
    )
    parser.add_argument(
        "--save-cropped",
        help="Also write the white-border-cropped source image to this path",
    )

    args = parser.parse_args()

    config_overrides = {}
    if args.config:
        try:
            config_overrides = json.loads(Path(args.config).read_text())
        except (json.JSONDecodeError, OSError) as e:
            print(f"✗ Error loading config from {args.config}: {e}", file=sys.stderr)
            return 1
    if args.light_threshold is not None:
        config_overrides["light_threshold"] = args.light_threshold
    if args.sizes:
        config_overrides["sizes"] = [int(s.strip()) for s in args.sizes.split(",")]
    if args.no_badge:
        config_overrides["badge"] = None
    if args.dark_glyph:
        config_overrides["foreground_is_light"] = False
    if args.colored_glyph:
        config_overrides["foreground_mode"] = "nonwhite"
    if args.white_threshold is not None:
        config_overrides["white_threshold"] = args.white_threshold
    if args.alpha_glyph:
        config_overrides["foreground_mode"] = "alpha"
    if args.alpha_threshold is not None:
        config_overrides["alpha_threshold"] = args.alpha_threshold
    if args.no_circle:
        config_overrides["constrain_to_circle"] = False
    if args.turdsize is not None:
        config_overrides["turdsize"] = args.turdsize
    if args.no_auto_crop:
        config_overrides["auto_crop_whitespace"] = False
    if args.tight:
        config_overrides["tight"] = True
    if args.save_cropped:
        config_overrides["save_cropped_path"] = args.save_cropped

    try:
        pipeline = IconPipeline(
            args.source, args.output, args.name, config_overrides
        )
        outputs = pipeline.run()
        print(f"\n✓ Successfully generated {len(outputs)} SVG files")
        return 0
    except FileNotFoundError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"✗ Pipeline failed: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
