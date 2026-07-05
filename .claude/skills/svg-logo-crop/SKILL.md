---
name: svg-logo-crop
description: >-
  Crop portfolio logo SVGs to visible ink only — remove empty borders without
  clipping letterforms or emblem arcs. Trigger on "crop logo SVG", "trim SVG
  borders", "remove empty SVG padding", "tight viewBox", "logo_persister",
  "persist-seq.svg", or when an Illustrator export has excess artboard whitespace
  or clips emblem geometry.
---

# SVG logo crop Skill

Crop **org/program logo SVGs** to empty borders only. Preserve all path data, colors,
and CSS classes — change the canvas (`viewBox` / optional `width`/`height`) only.

## Prerequisites

- **Repo:** `/home/engineer/workspace/portfolio_site`
- **Logo output path:** `public/assets/logos/{slug}.svg` (see `docs/assets.md`)
- **Related skills:**
  - Authoring new marks → `../image_gen/.claude/skills/logo-emblem-author/SKILL.md`
  - Logo audit / slug wiring → [portfolio-icon-audit/SKILL.md](../portfolio-icon-audit/SKILL.md)
  - Do **not** use SVGO or path simplification during border-only crops

## Hard rules

1. **Never crop from naive path bounding boxes alone** — relative arc commands (`a`)
   are misread as absolute coordinates and will clip emblems or add phantom padding.
2. **Prefer visible-ink bounds** — rasterize at native `viewBox` size and scan
   non-transparent pixels. Hollow arc geometry extends the mathematical bbox beyond
   painted pixels.
3. **Do not edit path `d` attributes** for border crops — only reframe the canvas.
4. **Keep a source copy** — write cropped output to a sibling file (e.g.
   `{name}_cropped.svg`) unless the user explicitly asks to overwrite.
5. **Verify after crop** — margins on all four sides should be ≤ 1 px at render scale;
   emblem and wordmark must remain fully visible.

---

## Workflow

```
Crop Progress:
- [ ] 1. Identify source SVG and intended output path
- [ ] 2. Measure bounds (visible-ink scan — required for logos with arcs)
- [ ] 3. Write cropped SVG (viewBox only)
- [ ] 4. Verify margins + visual check
- [ ] 5. Install to public/assets/logos/ if destined for the site
```

### Step 1 — Source and output

| Input           | Typical path                               |
| --------------- | ------------------------------------------ |
| Workspace draft | `/home/engineer/workspace/logo_{slug}.svg` |
| Site asset      | `public/assets/logos/{slug}.svg`           |

Default output: sibling `{basename}_cropped.svg` in the same directory as the source.

### Step 2 — Measure bounds

**Method A (required for arc-heavy logos): visible-ink scan**

Use [scripts/crop-visible-ink.py](scripts/crop-visible-ink.py):

```bash
/home/engineer/workspace/image_gen/.venv/bin/python3 \
  .claude/skills/svg-logo-crop/scripts/crop-visible-ink.py \
  /path/to/source.svg \
  /path/to/output_cropped.svg
```

The script:

- Renders the SVG at intrinsic `viewBox` dimensions via Playwright + Chromium
- Scans alpha channel for painted pixels
- Sets `viewBox="{minX} {minY} {width} {height}"` with matching `width`/`height`
- Leaves paths and `<defs><style>` unchanged

**Method B (fallback): relative path walker + arc sampling**

Only when Playwright is unavailable. Walk all path commands with correct relative
semantics; sample elliptical arcs per SVG spec center-parameterization (64 steps).
See [references/bbox-methods.md](references/bbox-methods.md). Still may over-estimate vs visible ink on
hollow arcs — re-check visually.

**Never use Method C:** parsing arc delta values (`-126.1, 62.35`) as absolute `(x,y)`.

### Step 3 — Write cropped SVG

Template (no `transform` needed when using viewBox crop):

```xml
<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="{minX} {minY} {width} {height}"
  width="{width}" height="{height}">
  <defs><!-- unchanged --></defs>
  <g><!-- all paths unchanged --></g>
</svg>
```

Remove Illustrator cruft (`Layer_2`, `data-name`) only if the user asked for cleanup;
border-only crops may leave structure intact.

### Step 4 — Verify

Re-run the crop script with `--verify-only` or scan output:

```bash
/home/engineer/workspace/image_gen/.venv/bin/python3 \
  .claude/skills/svg-logo-crop/scripts/crop-visible-ink.py \
  /path/to/output_cropped.svg --verify-only
```

Pass criteria:

- `top`, `bottom`, `left`, `right` margins ≤ 1 px
- Path count unchanged
- Brand colors still present (grep `#633e8d`, `#67a45f`, etc. as applicable)

For site logos: `npm run build` after replacing `public/assets/logos/{slug}.svg`.

### Step 5 — Install (when ready)

Copy verified crop to `public/assets/logos/{slug}.svg`. Confirm JSON wiring:

- `VisionMark`: `{ "kind": "logo", "asset": "{slug}" }` in content JSON
- `logoUsesBadge()` in `src/lib/logo-display.ts` if plain rendering is needed

---

## Case study: PERSIST-SEQ (`persist-seq`)

Illustrator export `logo_persister_seq.svg` — wordmark + circular Q emblem.

| Approach                 | viewBox                         | Problem                                                             |
| ------------------------ | ------------------------------- | ------------------------------------------------------------------- |
| Original artboard        | `0 0 849.73 288.56`             | ~60 px empty left/right/top; bottom clipped                         |
| Naive path bbox          | `0 0 906.48 284.48` + translate | Misread relative arcs; **~106 px of Q tail clipped**                |
| Path bbox + arc sampling | `0 0 736.96 292.21`             | Full Q geometry kept, but **~96 px empty bottom** (hollow arc bbox) |
| **Visible-ink scan**     | `58.98 55.91 731.77 183.72`     | Zero margins; full emblem + all letterforms                         |

Lesson: emblem paths with large elliptical arcs (`a78.44,78.44,0,1,0,…`) need
visible-ink measurement — mathematical bbox ≠ painted bbox.

---

## When to escalate

| Situation                 | Action                                         |
| ------------------------- | ---------------------------------------------- |
| Redesign / simplify paths | `logo-emblem-author` skill                     |
| New logo from scratch     | `logo-emblem-author` + `brand-logo-evaluation` |
| Missing slug / audit      | `portfolio-icon-audit`                         |
| PNG/favicon derivatives   | `docs/assets.md`; rasterize **after** crop     |

---

## Efficiency: batch edits and parallel calls

- **Batch edits:** when reframing multiple SVGs, combine changes to one file into a single Edit.
- **Read before edit:** measure bounds once, then write the cropped `viewBox` in one pass.
- **Sequential by design:** crop → verify → install has data dependencies; do not parallelize.

## Quick reference: where to go deeper

| Topic                          | Reference file                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| Bbox method details & pitfalls | [references/bbox-methods.md](references/bbox-methods.md)                                     |
| Crop automation                | run [scripts/crop-visible-ink.py](scripts/crop-visible-ink.py) to crop to visible-ink bounds |
| Site logo paths & rendering    | `docs/assets.md`, `src/lib/logo-display.ts`                                                  |
