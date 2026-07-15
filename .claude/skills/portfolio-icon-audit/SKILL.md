---
name: portfolio-icon-audit
description: >-
  Audit and resolve icons, logos, and images for the Astro portfolio site.
  Inventories all content JSON, heuristics, and public assets; maps each entity
  to an existing IconName, logo SVG, or site brand file; delegates missing assets
  to Cursor via the delegation skill and image_gen pipeline. Trigger on "audit
  icons", "find logos", "missing icons", "icon inventory", "logo audit",
  portfolio visual assets, or before adding new content sections.
---

# Portfolio icon audit Skill

Orchestrate a full audit of visual assets across the portfolio site. **Claude inventories and resolves; Cursor generates missing assets.**

## Prerequisites

- **Repo:** `/home/engineer/workspace/portfolio_site` (AgentMemory slug: `portfolio_site`)
- **Read on demand:** `AGENTS.md`, `docs/design-direction.md`, `docs/assets.md`
- **Reference files (load when executing):**
  - [references/content-inventory.md](references/content-inventory.md) - entity - field - component map
  - [references/resolution-rules.md](references/resolution-rules.md) - matching logic, slugs, trademark policy
  - [references/cursor-delegation.md](references/cursor-delegation.md) - Cursor handoff templates

## Two asset systems - never conflate

| Asset class            | Source of truth                              | Output location                                                 |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| **Semantic UI icon**   | `src/lib/icons.ts` + `Icon.astro`            | Inline SVG via `<Icon name="..." />`                              |
| **Org / program logo** | `VisionMark` `{ kind: "logo", asset: slug }` | `public/assets/logos/{slug}.svg`                                |
| **Site brand**         | `docs/assets.md`                             | `public/favicon.*`, `public/assets/icons/`, `public/assets/og/` |
| **Content image**      | `portrait`, competitions frontmatter         | `public/assets/images/`                                         |

Logo rendering pattern (already wired):

```astro
<img src={`/assets/logos/${asset}.svg`} alt={alt} loading="lazy" />
```

Components: `ThemeCard.astro` (org/program cards), `VisionHub.astro` (hub center/nodes).

---

## Workflow

Copy this checklist and track progress:

```
Audit Progress:
- [ ] Phase A - Inventory
- [ ] Phase B - Classify
- [ ] Phase C - Resolve
- [ ] Phase C.5 - Evaluate (site_brand / org_logo)
- [ ] Phase D - Report
- [ ] Phase E - Delegate missing (Cursor)
- [ ] Phase F - Verify (after Cursor returns)
```

### Phase A - Inventory

Walk every source in [references/content-inventory.md](references/content-inventory.md). For each entity needing a visual, add a row:

| entity_id | content_file | field | current_value | asset_class | render_component | status |

**Scan these sources:**

1. **JSON with icon fields** - `profile.json` (contact), `experience.json` (projects), `vision-board.json`, `collaborations.json`
2. **Heuristic-only** - `experience.json` nested projects via `XpProjectCard.astro` / `projectIcon()`
3. **Logo refs** - `vision-board.json` `VisionMark`; `collaborations.json` `items[].logo`
4. **Site brand** - `site.json`, `BaseHead.astro`, `site.webmanifest`
5. **Content images** - `profile.portrait`, `content/drafts/competitions/*.md`
6. **Orphans** - Header Unicode vs idle `Icon.astro` keys

Also list files on disk:

```bash
ls public/assets/logos/*.svg 2>/dev/null
ls public/assets/logos/tech/*.svg 2>/dev/null
ls public/assets/icons/
ls public/assets/og/
ls public/assets/images/
```

Cross-check `iconNameSchema` keys in `src/lib/icons.ts` against `Icon.astro` paths.

### Phase B - Classify

Assign each row `asset_class`:

- `semantic` - inline IconName
- `org_logo` - organization / program mark
- `site_brand` - favicon, PWA, OG, monogram
- `content_image` - portrait, competition thumbnail, section hero

### Phase C - Resolve

Apply [references/resolution-rules.md](references/resolution-rules.md):

1. **Semantic:** `iconNameSchema.safeParse(value)` - heuristics (`projectIcon`, `aboutCardIcon`, keyword map)
2. **Before inventing a new IconName:** load `workspace/.claude/skills/ui-icon-acquisition/SKILL.md` - Lucide - Iconify - keyword map
3. **Logo:** file exists at `public/assets/logos/{slug}.svg`
4. **Site brand:** file on disk + dimensions per `docs/assets.md`
5. **Content image:** path resolves under `public/`

Mark status:

| Status         | Meaning                                                      |
| -------------- | ------------------------------------------------------------ |
| `resolved`     | Asset exists and matches                                     |
| `fallback`     | Renders but uses generic key (`folder`, `diamond`)           |
| `missing`      | No asset - queue for Cursor                                  |
| `needs_schema` | Content has no field yet (e.g. optional logo on a list item) |

### Phase C.5 - Evaluate (site_brand / org_logo)

For rows with `asset_class` `site_brand` or `org_logo` marked `fallback`, or when
the user requests a brand refresh:

1. Load `workspace/.claude/skills/brand-logo-evaluation/SKILL.md`
2. Run weighted scoring on existing mark vs recommended direction
3. Run theme compatibility checklist (16 px favicon, light/dark, monochrome)
4. Include evaluation summary in Phase D report - do not auto-regenerate unless user asks

Skip Phase C.5 for `semantic` and `content_image` rows.

### Phase D - Report

Deliver markdown report with:

1. **Summary** - counts by status and asset_class
2. **Resolved** - no action needed
3. **Fallback** - recommended semantic key or logo slug upgrade; Phase C.5 scores if run
4. **Missing** - queued for delegation (list slugs)
5. **Schema gaps** - implementation follow-ups after assets exist
6. **Brand evaluation** - Phase C.5 scoring table (when applicable)

Do not edit content JSON or components unless the user explicitly asks - this skill audits and delegates by default.

### Phase E - Delegate missing assets

**Claude does NOT generate production assets.** For every `missing` row:

1. Read `~/.claude/skills/delegation/SKILL.md`
2. Build a delegation package from [references/cursor-delegation.md](references/cursor-delegation.md)
3. Set `DELEGATE_TO: Cursor Agent` (not Haiku/Sonnet)
4. Hand off via the user's Cursor session **or**:

```bash
/home/engineer/workspace/codespace/src/cli_agents/cursor_dispatch.sh \
  -w /home/engineer/workspace/portfolio_site \
  -p "<delegation package>"
```

For SVG authoring, Cursor works in `image_gen/` following
`image_gen/.claude/skills/logo-emblem-author/SKILL.md` (not generic §8 alone).
For semantic icons, follow `workspace/.claude/skills/ui-icon-acquisition/SKILL.md`.

**Portfolio brand tokens** (from `docs/design-direction.md`):

| Token            | Value     |
| ---------------- | --------- |
| `--accent`       | `#6C2FBF` |
| `--bg`           | `#0D0B1E` |
| `--text`         | `#E8E0F5` |
| `--accent-light` | `#9B5EE8` |

Batch delegations by asset class when possible (e.g. all tech logos in one package).

Optional polish after generation: symlink and use `refine-image` skill:

```bash
ln -sf /home/engineer/workspace/image_gen/.claude/skills/refine-image \
       /home/engineer/workspace/portfolio_site/.claude/skills/refine-image
```

### Phase F - Verify

After Cursor returns:

```bash
cd /home/engineer/workspace/portfolio_site
npm run build
npm run preview   # spot-check broken images
```

**Theme checks** (site_brand / org_logo):

- Favicon recognizable at 16×16 px
- Logo legible on light (`#FAF8FF`) and dark (`#0D0B1E`) backgrounds
- Monochrome black and white variants pass (or CSS `currentColor` / vars)
- OG image meets `docs/assets.md` spec (1200×630, < 1 MB)

Re-run Phases A-C. All rows should be `resolved` or explicitly deferred.

---

## Integration with other skills

| Skill                   | Role                                               |
| ----------------------- | -------------------------------------------------- |
| `ui-icon-acquisition`   | Lucide - Iconify workflow for semantic icons       |
| `brand-logo-evaluation` | Score site_brand / org_logo candidates (Phase C.5) |
| `logo-emblem-author`    | Cursor authors logo SVGs in image_gen              |
| `delegation`            | Package format for every Cursor handoff            |
| `image_gen`             | Router + `render.py` for raster derivatives        |
| `refine-image`          | Optional polish pass on generated marks            |

**Never** use Claude's built-in image generation for production assets - always delegate to Cursor running the `image_gen` pipeline.

---

## Out of scope (flag in report, do not auto-implement)

- Integrate `content/drafts/competitions/` into site routes
- Add new `IconName` keys without updating both `icons.ts` and `Icon.astro`

These are follow-up implementation tasks after assets exist.

---

## Efficiency: batch edits and parallel calls

- **Parallel calls:** run the independent inventory `ls`/grep scans in one message.
- **Batch edits:** when the user asks for edits, combine changes to one file into a single Edit.
- **Read before edit:** read each source once, plan all changes, then apply the fewest edits.

## Quick reference: where to go deeper

| Topic                                   | Reference file                                                     |
| --------------------------------------- | ------------------------------------------------------------------ |
| Entity - field - component map          | [references/content-inventory.md](references/content-inventory.md) |
| Matching logic, slugs, trademark policy | [references/resolution-rules.md](references/resolution-rules.md)   |
| Cursor handoff templates                | [references/cursor-delegation.md](references/cursor-delegation.md) |

## Current baseline (re-verify on each run)

**Existing logos** (`public/assets/logos/`): `aacr`, `astrazeneca`, `biorxiv`, `brain`, `broad-institute`, `eu-research-consortium`, `gaia`, `iit-madras`, `jitc`, `kaggle`, `cshl`, `hcl`, `uppsala-university`, `ai-sweden`

**Known gaps (typical first audit):**

- Experience projects: all named projects now have explicit `icon` in JSON
- Competitions: 16 markdown files without thumbnails (untracked content)

See [references/content-inventory.md](references/content-inventory.md) for the full entity map.
