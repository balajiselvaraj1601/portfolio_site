# Resolution rules

Matching logic for the portfolio icon audit. Apply in Phase C after classifying each row.

---

## 1. Slug naming

Convert entity names to filesystem slugs:

| Rule                      | Example                                                    |
| ------------------------- | ---------------------------------------------------------- |
| Lowercase                 | `AstraZeneca` → `astrazeneca`                              |
| Spaces → hyphens          | `Broad Institute` → `broad-institute`                      |
| Strip punctuation         | `EU Research Consortium` → `eu-research-consortium`        |
| Keep disambiguating words | `IIT Madras` → `iit-madras` (not `iit`)                    |
| Tech labels               | `Foundation Models` → `foundation-models`                  |
| Competition files         | `comp-08-google-asl-signs.md` → `comp-08-google-asl-signs` |

**Paths by class:**

| Class             | Path pattern                                   |
| ----------------- | ---------------------------------------------- |
| org_logo          | `public/assets/logos/{slug}.svg`               |
| tech_logo         | `public/assets/logos/tech/{slug}.svg`          |
| content_image     | `public/assets/images/{slug}.png` (or `.webp`) |
| competition thumb | `public/assets/images/competitions/{slug}.png` |

---

## 2. Semantic icon resolution

Order of precedence:

1. **Explicit JSON value** — `iconNameSchema.safeParse(value)` in `src/lib/icons.ts`
2. **Heuristic functions** — `projectIcon(domain, id)`, `aboutCardIcon(title)`
3. **Keyword map** (below) — match against title, name, id, domain text
4. **UI icon acquisition** — load `workspace/.claude/skills/ui-icon-acquisition/SKILL.md`:
   - Search Lucide for semantic match
   - Iconify API fallback (prefer `lucide:` prefix)
   - Normalize to 24×24 stroke path for `Icon.astro`
5. **New IconName** — only if steps 1–4 exhausted; requires `Icon.astro` + `icons.ts` update
6. **Never** leave invalid strings in JSON — build will fail Zod validation

Run `ui-icon-acquisition/references/reject-checklist.md` before adding registry keys.

### Keyword → IconName map

Use before inventing a new key:

| Keywords (case-insensitive)                  | IconName                      |
| -------------------------------------------- | ----------------------------- |
| email, mail                                  | `email`                       |
| linkedin                                     | `linkedin`                    |
| kaggle, competition, trophy, award           | `trophy` or `kaggle`          |
| location, map, geo                           | `location`                    |
| oncology, tumor, pathology, microscope, cell | `microscope`                  |
| drug, safety, pharma, pill, toxicology       | `pill`                        |
| imaging, segmentation, CT, scan, clinical    | `scan`                        |
| graph, GNN, network                          | `graph`                       |
| foundation, framework, platform, blocks      | `blocks`                      |
| vision, enterprise, computer vision          | `vision`                      |
| leadership, team, people                     | `team`                        |
| research, academic, university               | `graduation` or `institution` |
| presentation, conference, talk               | `presentation`                |
| publication, paper, document                 | `document`                    |
| chart, metrics, analytics                    | `chart`                       |
| funding, grant, money                        | `funding`                     |
| target, goal, objective                      | `target`                      |
| global, international, countries             | `globe`                       |
| layers, industry, stack                      | `layers`                      |
| DNA, genomics, omics                         | `dna`                         |
| brain, AI, ML, generative                    | `brain`                       |
| rocket, launch, execution                    | `rocket`                      |
| link, url, external                          | `link` or `external`          |
| download, resume, PDF                        | `download`                    |
| lightbulb, idea                              | `lightbulb`                   |
| book, literature                             | `book`                        |
| handshake, partnership, collaboration        | `handshake`                   |
| table, data                                  | `table`                       |
| pulse, signal, activity                      | `pulse`                       |
| image, photo, picture                        | `image`                       |

### Domain defaults (from icons.ts)

| Domain string                       | IconName     |
| ----------------------------------- | ------------ |
| Biopharma R&D                       | `pill`       |
| Translational Oncology              | `microscope` |
| Clinical Imaging / Oncology Imaging | `scan`       |
| Digital Pathology                   | `microscope` |
| Computational Pathology             | `graph`      |
| Enterprise Vision                   | `vision`     |
| Academic Research                   | `graduation` |

### projectIcon id overrides

| id substring                    | IconName     |
| ------------------------------- | ------------ |
| drug-safety, safety             | `pill`       |
| tumor, oncology, recurrence     | `microscope` |
| foundation, framework           | `blocks`     |
| pathology                       | `microscope` |
| gnn, graph                      | `graph`      |
| vision, enterprise              | `vision`     |
| imaging, segmentation, clinical | `scan`       |

---

## 3. Fallback detection

Flag status `fallback` when:

| Condition                                                             | Typical fallback |
| --------------------------------------------------------------------- | ---------------- |
| Experience project has no `icon` and `projectIcon()` returns `folder` | `folder`         |
| About card title not in `ABOUT_CARD_ICONS`                            | `diamond`        |
| `resolveIcon(undefined, 'folder')` used                               | `folder`         |
| `resolveIcon(undefined, 'diamond')` on about cards                    | `diamond`        |
| `resolveIcon(undefined, 'document')` on research cards                | `document`       |

**Recommendation priority for fallbacks:**

1. Add explicit `icon` to content JSON (preferred — content-driven)
2. Extend heuristic in `icons.ts` if pattern repeats across many items
3. Add new `IconName` only when registry lacks a semantic match

---

## 4. Logo resolution

### org_logo / program logo

1. Check `public/assets/logos/{slug}.svg` exists on disk
2. If referenced in `vision-board.json` but file missing → `missing` (broken `<img>`)
3. If affiliations name only → `needs_schema` until schema supports `logo` field

### Official asset sources (Cursor may use during generation)

| Source                                        | Use when                                      |
| --------------------------------------------- | --------------------------------------------- |
| Existing site logos in `public/assets/logos/` | Style reference (monochrome, simple geometry) |
| [Simple Icons](https://simpleicons.org/)      | Tech brands with MIT-licensed SVGs            |
| Lucide / Iconify (`lucide:` prefix)           | Semantic UI icons via `ui-icon-acquisition`   |
| Official press / brand kits                   | Org logos when license permits local hosting  |
| Generated monogram                            | Official asset unavailable or license unclear |

For org/site brand marks, run `brand-logo-evaluation` scoring before authoring.
Author via `image_gen/.claude/skills/logo-emblem-author/SKILL.md`.

---

## 5. Trademark & licensing policy

**Do:**

- Prefer stylized, monochrome marks consistent with existing site logos
- Use official SVGs when license clearly allows local static hosting
- Generate **abstract monograms** (initials + geometric shape) when official assets unavailable
- Include meaningful `alt` text on every logo `<img>`

**Do not:**

- Reproduce trademarked logos in detail when no licensed asset exists (no counterfeit marks)
- Hotlink external CDN logos in production (`<img src="https://…">`)
- Embed phone numbers or sensitive metadata in alt text
- Use full-color complex logos at sizes below 32px where detail is lost

For tech brands: Simple Icons slug often matches (`pytorch`, `amazonaws` for AWS, `docker`, etc.). Verify slug before copying.

---

## 6. Site brand resolution

Verify against `docs/assets.md`. For `fallback` or refresh candidates, run
`brand-logo-evaluation` (Phase C.5 in portfolio-icon-audit):

| Asset                | Check                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| favicon.svg          | File exists; accent `#6C2FBF` (not legacy `#2563eb`); 16 px legibility |
| favicon.ico          | File exists                                                            |
| icon-192.png         | 192×192                                                                |
| icon-512.png         | 512×512                                                                |
| apple-touch-icon.png | 180×180                                                                |
| og-image.png         | 1200×630, < 1 MB                                                       |
| balaji.png           | Portrait loads; reasonable file size (< 500 KB target)                 |

Theme checks: light (`#FAF8FF`) and dark (`#0D0B1E`) backgrounds; monochrome pass.

Flag `missing` or `fallback` if dimensions wrong, file absent, or evaluation fails stress test.

---

## 7. Content image resolution

1. Strip leading `/` and resolve under `public/`
2. File must exist at build time for static paths
3. Competitions: if markdown has no `thumbnail` field, status = `needs_schema`
4. Propose slug from filename: `comp-NN-{name}.md` → `comp-NN-{name}`

---

## 8. Status decision tree

```
Is asset_class semantic?
  ├─ valid IconName in JSON/heuristic → resolved
  ├─ invalid/missing, heuristic returns folder/diamond → fallback
  └─ no match in registry → missing (delegate new Icon.astro path OR assign existing key)

Is asset_class org_logo | tech_logo?
  ├─ file at expected path → resolved
  ├─ referenced but no file → missing
  └─ entity has no schema field → needs_schema

Is asset_class site_brand | content_image?
  ├─ file exists, spec met → resolved
  └─ else → missing
```

---

## 9. Valid icon registry (verify against icons.ts on each run)

Current keys: `email`, `linkedin`, `kaggle`, `location`, `external`, `download`, `sun`, `moon`, `menu`, `close`, `arrow-up`, `chevron`, `chevron-right`, `trophy`, `brain`, `rocket`, `pill`, `institution`, `microscope`, `presentation`, `chart`, `funding`, `target`, `link`, `team`, `globe`, `blocks`, `document`, `graduation`, `diamond`, `folder`, `layers`, `scan`, `graph`, `dna`, `vision`, `lightbulb`, `book`, `handshake`, `table`, `pulse`, `image`

Every key must have a matching `<path>` entry in `Icon.astro`.
