# Cursor delegation templates

When Phase C marks a row `missing`, Claude **must not generate assets**. Read `~/.claude/skills/delegation/SKILL.md`, then emit a package below.

**Invoke Cursor:**

```bash
/home/engineer/workspace/codespace/src/cli_agents/cursor_dispatch.sh \
  -w /home/engineer/workspace/portfolio_site \
  -p "<paste package>"
```

For SVG authoring steps, Cursor may use `-w /home/engineer/workspace/image_gen` in a separate invocation, then copy outputs into portfolio_site.

---

## Base package (all asset classes)

```
DELEGATE_TO: Cursor Agent
WORKSPACE: /home/engineer/workspace/portfolio_site

TASK
Generate and install one {asset_class} asset for the portfolio site.

CONTEXT
- Entity: {entity_id}
- Content file: {content_file}
- Field: {field}
- Slug: {kebab-case-slug}
- Alt text: {accessible label}
- Brand tokens: accent #6C2FBF, bg #0D0B1E, text #E8E0F5 (docs/design-direction.md)
- Style reference: {list existing similar assets, e.g. public/assets/logos/kaggle.svg}

CONSTRAINTS
- Asset files only unless TASK explicitly includes schema or content JSON updates.
- Follow image_gen/.claude/skills/logo-emblem-author/SKILL.md for logo/badge SVG authoring.
- Follow workspace/.claude/skills/ui-icon-acquisition/SKILL.md for semantic IconName paths.
- Run `npm run build` in portfolio_site before handoff.
- Do not commit unless user asks.

OUTPUT FORMAT
Return JSON:
{
  "slug": "...",
  "asset_class": "...",
  "files_created": ["relative/paths"],
  "content_updates": [],
  "build": "pass|fail",
  "preview_notes": "..."
}

VALID IF:   file at expected path; build passes; alt text for logos/images
INVALID IF: invented schema fields; wrong dimensions; raster-only when SVG required for logos; hotlinked external URLs
```

---

## org_logo

```
DELEGATE_TO: Cursor Agent
WORKSPACE: /home/engineer/workspace/image_gen  (author) - portfolio_site (install)

TASK
Create org/program logo SVG and install at public/assets/logos/{slug}.svg.

CONTEXT
- Organization: {name}
- Slug: {slug}
- Alt: {alt}
- Reference logos: public/assets/logos/broad-institute.svg, kaggle.svg
- Canvas: 400×400, safe zone 360×360 (image-types.md §8)
- Max 3 colors; bold geometry; readable at 32px

CONSTRAINTS
- Monochrome-first; theme via CSS vars (logo-emblem-author/references/theme-svg.md).
- Monochrome or duotone using portfolio accent #6C2FBF on dark #0D0B1E OR neutral white/gray mark.
- If official SVG available (press kit / Simple Icons), use it only when license permits local hosting.
- Otherwise: abstract monogram (initials + shape), not a counterfeit trademark.
- Run brand-logo-evaluation reject checklist before handoff.
- Do NOT edit affiliations.json or schemas unless explicitly requested.

OUTPUT FORMAT
{
  "slug": "{slug}",
  "files_created": ["public/assets/logos/{slug}.svg"],
  "build": "pass",
  "preview_notes": "Used in HubCircle / ProgramBadgeCard when vision-board references this slug"
}

WORKFLOW
1. cd /home/engineer/workspace/image_gen
2. Read logo-emblem-author/SKILL.md + references/monochrome-template.md
3. Write outputs/{slug}.svg (monochrome-first)
4. Copy to /home/engineer/workspace/portfolio_site/public/assets/logos/{slug}.svg
5. cd portfolio_site && npm run build
```

---

## tech_logo

```
DELEGATE_TO: Cursor Agent
WORKSPACE: /home/engineer/workspace/image_gen - portfolio_site

TASK
Create tech brand mark SVG and install at public/assets/logos/tech/{slug}.svg.

CONTEXT
- Technology: {label}
- Slug: {slug}
- Alt: {label} logo
- Simple Icons slug hint: {e.g. pytorch, amazonaws, docker}
- Directory may need creation: public/assets/logos/tech/

CONSTRAINTS
- Prefer Simple Icons SVG (MIT) when available; normalize to site palette.
- If unavailable: stylized abstract mark suggesting the technology (not fake trademark).
- 400×400 canvas; stroke-based or simple fill; works on dark bg #0D0B1E.
- Do NOT wire TechIconRow.astro unless explicitly requested.

OUTPUT FORMAT
{
  "slug": "{slug}",
  "files_created": ["public/assets/logos/tech/{slug}.svg"],
  "build": "pass"
}
```

---

## semantic (new IconName)

Use when no existing registry key fits and keyword map exhausted.

```
DELEGATE_TO: Cursor Agent
WORKSPACE: /home/engineer/workspace/portfolio_site

TASK
Add semantic icon key "{new_key}" to the Icon.astro registry and assign it to {entity_id}.

CONTEXT
- New key: {new_key}
- Entity: {entity_id} in {content_file}
- Field: {field}
- Style: 24×24 viewBox, stroke width ~1.5-2, fill="none" on strokes, match existing Icon.astro paths
- Reference icons: pill, microscope, blocks in src/components/Icon.astro
- Acquisition: workspace/.claude/skills/ui-icon-acquisition/SKILL.md (Lucide - Iconify)

CONSTRAINTS
- Add key to iconNameSchema in src/lib/icons.ts (alphabetical-ish order in enum).
- Add path string to paths record in Icon.astro.
- Update content JSON icon field if entity had missing/invalid value.
- Run npm run build (Zod validates icon keys).

OUTPUT FORMAT
{
  "slug": "{new_key}",
  "files_created": [],
  "files_modified": ["src/lib/icons.ts", "src/components/Icon.astro", "{content_file}"],
  "build": "pass"
}

VALID IF:   icon renders in build; key in iconNameSchema; path in Icon.astro
INVALID IF: key added to JSON but not registry; broken SVG path
```

---

## site_brand

```
DELEGATE_TO: Cursor Agent
WORKSPACE: /home/engineer/workspace/image_gen - portfolio_site

TASK
Regenerate site brand asset(s): {list: favicon | pwa-192 | pwa-512 | apple-touch | og-image}.

CONTEXT
- Monogram: "BS" for Balaji Selvaraj
- Accent: #6C2FBF (not legacy #2563eb in current favicon.svg)
- Background: #0D0B1E
- OG: 1200×630 text-led poster - name, title, accent background
- PWA: 192, 512, 180 (apple-touch) from master SVG

CONSTRAINTS
- Follow docs/assets.md dimensions and paths exactly.
- Author master SVG in image_gen/outputs/portfolio-brand-v1.svg via logo-emblem-author/SKILL.md
- Run brand-logo-evaluation theme checklist; monochrome-first.
- Render PNGs with: uv run python scripts/render.py outputs/portfolio-brand-v1.svg --width {N} --output {name}.png
- Export variant kit per brand-logo-evaluation/references/variant-kit.md
- Update public/favicon.svg, public/assets/icons/*, public/assets/og/og-image.png
- Regenerate favicon.ico from 32/64 PNG if possible
- Run npm run build && npm run preview

OUTPUT FORMAT
{
  "slug": "portfolio-brand",
  "files_created": ["public/favicon.svg", "public/assets/icons/icon-192.png", "..."],
  "build": "pass",
  "preview_notes": "Verify OG at /assets/og/og-image.png"
}
```

---

## content_image

```
DELEGATE_TO: Cursor Agent
WORKSPACE: /home/engineer/workspace/image_gen - portfolio_site

TASK
Create content image for {entity_id} at public/assets/images/{path}.

CONTEXT
- Entity: {entity_id}
- Subject: {description}
- Dimensions: {e.g. 480×480 portrait | 400×225 competition thumb}
- Max file size: < 500 KB for portrait; < 200 KB for thumbnails

CONSTRAINTS
- Do not replace balaji.png unless user explicitly requests.
- For competition thumbnails: abstract/domain illustration, not copyrighted competition artwork.
- Render via image_gen render.py; optimize if over size budget.
- If content markdown needs thumbnail frontmatter, list in content_updates.

OUTPUT FORMAT
{
  "slug": "{slug}",
  "files_created": ["public/assets/images/..."],
  "content_updates": [{"file": "content/drafts/competitions/....md", "field": "thumbnail", "value": "/assets/images/..."}],
  "build": "pass"
}
```

---

## Batch delegation (multiple missing assets)

When 3+ assets share a class, batch into one package:

```
DELEGATE_TO: Cursor Agent
WORKSPACE: /home/engineer/workspace/image_gen - portfolio_site

TASK
Generate and install {N} tech_logo SVGs for the portfolio tech stack.

CONTEXT
Slugs and labels:
- pytorch - PyTorch
- aws - AWS
- docker - Docker
- langchain - LangChain
- foundation-models - Foundation Models
- rag - RAG

(shared CONTEXT/CONSTRAINTS from tech_logo template)

OUTPUT FORMAT
{
  "assets": [
    {"slug": "pytorch", "files_created": ["public/assets/logos/tech/pytorch.svg"], "status": "ok"},
    ...
  ],
  "build": "pass"
}

VALID IF:   all slugs have files; build passes
INVALID IF: partial completion without listing failures
```

---

## After Cursor returns - Claude checklist

1. Parse JSON output against VALID/INVALID criteria from delegation skill
2. If `build: fail` - re-delegate with tighter constraints or fix instructions
3. Run Phase F: `npm run build` independently to confirm
4. Re-run audit inventory; update report
5. Flag `needs_schema` items for separate implementation PR

---

## Optional: refine pass

If generated mark quality is weak:

```bash
ln -sf /home/engineer/workspace/image_gen/.claude/skills/refine-image \
       /home/engineer/workspace/portfolio_site/.claude/skills/refine-image
```

Delegate to Cursor with `/refine-image {slug}` workflow on the SVG in `image_gen/outputs/`.
