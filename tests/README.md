# Icon pipeline tests

Golden-regression harness for `scripts/svg-icon-generator.py`. No pytest — just:

```bash
python3 tests/run-icon-tests.py
```

Exit 0 = all green. It runs three layers:

1. **Golden byte-diff** — regenerates each fixture (one per mask mode) with that
   mode's flags and asserts the optimized SVG is **byte-identical** to the committed
   golden. Locks the light / nonwhite / alpha mask modes + tight framing + auto-crop.
2. **Semantic** — runs `scripts/verify-icon.py` on the goldens (independent
   margin/flush/centered check).
3. **Guard** — asserts the pipeline rejects the mode/source mismatches and bad
   config that used to fail silently: `--alpha-glyph` on an opaque source,
   out-of-range thresholds, illegal `foreground_mode`.

## Fixtures

```
fixtures/
├── light/     icon_*.png + <name>-icon-512.svg   # from icons_box (white glyph on solid circle)
├── nonwhite/  icon_*.png + <name>-icon-512.svg   # from icon_multimodal (colored ink on white)
├── alpha/     icon_*.png + <name>-icon-512.svg   # from icon_kaggle (transparent-bg PNG)
└── edge/      opaque_*.png                        # opaque source for the --alpha-glyph guard
```

Each mode dir holds exactly one source `icon_*.png` and its expected golden SVG.

## Updating goldens

The goldens are tied to the installed **potrace** and **svgo** versions — a
version bump can legitimately change byte output. When that happens the byte-diff
fails *by design*. Adopt the new output deliberately:

```bash
python3 tests/run-icon-tests.py --update-goldens
```

Then **eyeball the rendered result** (e.g. render with resvg/cairosvg) before
committing — `--update-goldens` blindly trusts the current generator, so it must
be a conscious step, not a reflex.
