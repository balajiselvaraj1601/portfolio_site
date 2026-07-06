#!/usr/bin/env python3
"""Shared helpers for Vision icon brightness analysis and normalization."""

from __future__ import annotations

import io
import json
import os
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Literal

import cairosvg
import numpy as np
from PIL import Image, ImageFilter
from svgelements import Matrix, Path as SVGPath

MaskMode = Literal["alpha", "light", "nonwhite"]

TARGET_LUM = 72.0
TARGET_GLYPH_INK = 35.0
INK_TOL = 3.0
LUM_TOL = 8.0
ROI_FRAC = 0.70

WORKSPACE = Path(os.environ.get("ICON_WORKSPACE", str(Path.home() / "workspace")))

# Load icon-sets configuration from JSON
_icon_sets_path = Path(__file__).parent / "icon-sets.json"
_icon_sets_data = json.loads(_icon_sets_path.read_text())

# Build SET_CONFIG with full paths, preserving all configuration per set
SET_CONFIG: dict[str, dict] = {}
for set_name, config in _icon_sets_data["icon_sets"].items():
    SET_CONFIG[set_name] = {
        "dir": WORKSPACE / config["dir"],
        "mask_mode": config["mask_mode"],
        "circle_archetype": config["circle_archetype"],
        "scale_luminance": config["scale_luminance"],
    }
    if config.get("output_alpha"):
        SET_CONFIG[set_name]["output_alpha"] = config["output_alpha"]

FILE_OVERRIDES: dict[str, dict] = {
    "icon_drug_safety.png": {
        "mask_mode": "nonwhite",
        "circle_archetype": False,
        "scale_luminance": True,
        "output_alpha": True,
    },
}


@dataclass
class PngStats:
    file: str
    set_name: str
    foreground_pct: float
    mean_lum: float
    p90_lum: float


@dataclass
class SvgStats:
    file: str
    set_name: str
    ink_full_pct: float
    ink_glyph_pct: float
    measure_mode: str
    circle_archetype: bool


def resolve_file_config(set_name: str, filename: str) -> dict:
    cfg = SET_CONFIG[set_name].copy()
    cfg.update(FILE_OVERRIDES.get(filename, {}))
    cfg["set_name"] = set_name
    return cfg


def _lum(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return 0.299 * r + 0.587 * g + 0.114 * b


def build_mask(rgba: np.ndarray, mode: MaskMode, *, white_threshold: int = 235) -> np.ndarray:
    r = rgba[..., 0].astype(np.float32)
    g = rgba[..., 1].astype(np.float32)
    b = rgba[..., 2].astype(np.float32)
    a = rgba[..., 3].astype(np.float32)

    if mode == "alpha":
        return a > 128
    if mode == "light":
        return (r > 180) & (g > 180) & (b > 180)
    if mode == "nonwhite":
        return (np.minimum(np.minimum(r, g), b) < white_threshold) & (a > 128)
    raise ValueError(f"unknown mask mode: {mode}")


def measure_png(path: Path, set_name: str) -> PngStats:
    cfg = resolve_file_config(set_name, path.name)
    rgba = np.array(Image.open(path).convert("RGBA"))
    mask = build_mask(rgba, cfg["mask_mode"])
    lum = _lum(rgba[..., :3].astype(np.float32))
    fg_lum = lum[mask] if mask.any() else np.array([0.0])
    return PngStats(
        file=path.name,
        set_name=set_name,
        foreground_pct=100.0 * mask.sum() / mask.size,
        mean_lum=float(fg_lum.mean()) if fg_lum.size else 0.0,
        p90_lum=float(np.percentile(fg_lum, 90)) if fg_lum.size else 0.0,
    )


def _bool_to_image(mask: np.ndarray) -> Image.Image:
    return Image.fromarray((mask.astype(np.uint8) * 255), mode="L")


def _dilate(mask: np.ndarray, size: int = 3) -> np.ndarray:
    return np.array(_bool_to_image(mask).filter(ImageFilter.MaxFilter(size))) > 127


def _erode(mask: np.ndarray, size: int = 3) -> np.ndarray:
    return np.array(_bool_to_image(mask).filter(ImageFilter.MinFilter(size))) > 127


def adjust_mask_coverage(mask: np.ndarray, target_pct: float, *, max_iters: int = 24) -> np.ndarray:
    m = mask.copy()
    for _ in range(max_iters):
        current = 100.0 * m.sum() / m.size
        if abs(current - target_pct) <= 1.0:
            break
        m = _dilate(m) if current < target_pct else _erode(m)
    return m


def scale_foreground_luminance(rgba: np.ndarray, mask: np.ndarray, target_lum: float) -> np.ndarray:
    out = rgba.astype(np.float32).copy()
    if not mask.any():
        return out.astype(np.uint8)
    lum = _lum(out[..., :3])
    fg_lum = lum[mask]
    mean = float(fg_lum.mean())
    if mean < 1.0:
        return out.astype(np.uint8)
    scale = target_lum / mean
    for c in range(3):
        channel = out[..., c]
        channel[mask] = np.clip(channel[mask] * scale, 0, 255)
    return out.astype(np.uint8)


def apply_mask_to_rgba(rgba: np.ndarray, mask: np.ndarray, *, fill_rgb: tuple[int, int, int] | None = None) -> np.ndarray:
    out = rgba.copy()
    if fill_rgb is None and mask.any():
        lum = _lum(out[..., :3].astype(np.float32))
        mean = float(lum[mask].mean()) if mask.any() else 72.0
        v = int(np.clip(mean, 0, 255))
        fill_rgb = (v, v, v)
    if fill_rgb is not None:
        for c, val in enumerate(fill_rgb):
            out[..., c] = np.where(mask, val, out[..., c])
    out[..., 3] = np.where(mask, 255, 0).astype(np.uint8)
    return out


def normalize_png(
    path: Path,
    set_name: str,
    *,
    target_lum: float = TARGET_LUM,
    target_ink: float = TARGET_GLYPH_INK,
) -> tuple[np.ndarray, PngStats, PngStats]:
    cfg = resolve_file_config(set_name, path.name)
    rgba = np.array(Image.open(path).convert("RGBA"))
    mask = build_mask(rgba, cfg["mask_mode"])
    before = measure_png(path, set_name)

    if cfg.get("scale_luminance", False):
        rgba = scale_foreground_luminance(rgba, mask, target_lum)

    mask = adjust_mask_coverage(mask, target_ink)

    if cfg.get("output_alpha") or cfg["mask_mode"] == "alpha":
        fill = None
        if cfg["mask_mode"] == "nonwhite":
            fill = (int(target_lum), int(target_lum), int(target_lum))
        rgba = apply_mask_to_rgba(rgba, mask, fill_rgb=fill)
    else:
        for c in range(3):
            rgba[..., c] = np.where(mask, 255, rgba[..., c])
        rgba[..., 3] = 255

    after_mask = build_mask(rgba, cfg["mask_mode"])
    after = PngStats(
        file=path.name,
        set_name=set_name,
        foreground_pct=100.0 * after_mask.sum() / after_mask.size,
        mean_lum=float(_lum(rgba[..., :3].astype(np.float32))[after_mask].mean())
        if after_mask.any()
        else 0.0,
        p90_lum=before.p90_lum,
    )
    return rgba, before, after


def rasterize_svg(svg_path: Path, size: int = 128) -> np.ndarray:
    text = svg_path.read_text().replace('fill="currentColor"', 'fill="#000000"')
    png = cairosvg.svg2png(bytestring=text.encode(), output_width=size, output_height=size)
    return np.array(Image.open(io.BytesIO(png)).convert("RGBA"))


def ink_coverage(rgba: np.ndarray, *, roi: bool = False) -> float:
    a = rgba[..., 3]
    h, w = a.shape
    if roi:
        m = int((1.0 - ROI_FRAC) / 2 * min(h, w))
        a = a[m : h - m, m : w - m]
    return 100.0 * (a > 10).sum() / a.size


def measure_svg(path: Path, set_name: str) -> SvgStats:
    stem = path.name.replace("-icon-512.svg", "")
    png_name = f"icon_{stem.replace('-', '_')}.png"
    cfg = resolve_file_config(set_name, png_name)
    rgba = rasterize_svg(path)
    full = ink_coverage(rgba, roi=False)
    glyph = ink_coverage(rgba, roi=True)
    circle = cfg.get("circle_archetype", False)
    return SvgStats(
        file=path.name,
        set_name=set_name,
        ink_full_pct=full,
        ink_glyph_pct=glyph,
        measure_mode="roi" if circle else "full",
        circle_archetype=circle,
    )


def effective_ink(stats: SvgStats) -> float:
    return stats.ink_glyph_pct if stats.circle_archetype else stats.ink_full_pct


def scale_svg_ink(svg_path: Path, scale: float) -> None:
    text = svg_path.read_text()
    vb = re.search(r'viewBox="([^"]+)"', text)
    if not vb:
        raise ValueError(f"no viewBox in {svg_path}")
    parts = [float(n) for n in vb.group(1).split()]
    cx = parts[0] + parts[2] / 2
    cy = parts[1] + parts[3] / 2

    d_match = re.search(r'(<path[^>]*\bd=")([^"]+)(")', text, re.DOTALL)
    if not d_match:
        raise ValueError(f"no path in {svg_path}")

    path = SVGPath(d_match.group(2))
    path *= Matrix(f"translate({cx},{cy}) scale({scale}) translate({-cx},{-cy})")
    new_d = path.d()

    new_text = text[: d_match.start(2)] + new_d + text[d_match.end(2) :]
    svg_path.write_text(new_text)


def list_source_pngs(icon_dir: Path) -> list[Path]:
    out: list[Path] = []
    for png in sorted(icon_dir.glob("icon_*.png")):
        name = png.name
        if "_cropped" in name or "_normalized" in name:
            continue
        out.append(png)
    return out


def list_svg_outputs(icon_dir: Path) -> list[Path]:
    return sorted(icon_dir.glob("*-icon-512.svg"))


def set_name_for_dir(icon_dir: Path) -> str:
    for name, cfg in SET_CONFIG.items():
        if cfg["dir"].resolve() == icon_dir.resolve():
            return name
    raise ValueError(f"unknown icon dir: {icon_dir}")


def write_report(path: Path, label: str, png_stats: list[PngStats], svg_stats: list[SvgStats]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "label": label,
        "targets": {"lum": TARGET_LUM, "glyph_ink": TARGET_GLYPH_INK},
        "png": [asdict(s) for s in png_stats],
        "svg": [asdict(s) for s in svg_stats],
    }
    path.write_text(json.dumps(payload, indent=2) + "\n")
