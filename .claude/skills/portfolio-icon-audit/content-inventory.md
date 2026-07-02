# Content Inventory — Icons, Logos & Images

Entity map for portfolio icon audits. Extend this table on each run when content changes.

**Legend:** `icon_field` = JSON has explicit icon key; `heuristic` = resolved at render time; `hardcoded` = fixed in component; `logo_file` = raster/vector file path.

---

## 1. Semantic icons (IconName registry)

**Registry:** `src/lib/icons.ts` → `iconNameSchema` (43 keys as of last audit)  
**Renderer:** `src/components/Icon.astro`

### profile.json

| entity_id        | field            | required | component           | notes             |
| ---------------- | ---------------- | -------- | ------------------- | ----------------- |
| contact.email    | `contact[].icon` | yes      | `ContactLink.astro` | fallback: `email` |
| contact.linkedin | `contact[].icon` | yes      | `ContactLink.astro` |                   |
| contact.kaggle   | `contact[].icon` | yes      | `ContactLink.astro` |                   |
| contact.location | `contact[].icon` | yes      | `ContactLink.astro` |                   |

### strategic-impact.json

| entity_id               | field                    | component              | fallback  |
| ----------------------- | ------------------------ | ---------------------- | --------- |
| journey.idea            | `journey[].icon`         | `JourneyNode.astro`    | `rocket`  |
| journey.vision          | `journey[].icon`         | `JourneyNode.astro`    |           |
| journey.execution       | `journey[].icon`         | `JourneyNode.astro`    |           |
| program.drug-safety     | `programs[].icon`        | `ImpactCard.astro`     | `target`  |
| program.broad-institute | `programs[].icon`        | `ImpactCard.astro`     |           |
| program.persister       | `programs[].icon`        | `ImpactCard.astro`     |           |
| program.aacr            | `programs[].icon`        | `ImpactCard.astro`     |           |
| leadership.* (7 cards)  | `leadershipCards[].icon` | `LeadershipCard.astro` | `diamond` |

### experience.json — projects

Only projects with explicit `"icon"` in JSON; all others fall back to `folder` via `ProjectAccordion.astro`.

| entity_id                | project name                | icon in JSON | heuristic if missing                       |
| ------------------------ | --------------------------- | ------------ | ------------------------------------------ |
| exp-drug-safety          | Drug Safety AI Platform     | `pill`       | `projectIcon` → `pill`                     |
| exp-tumor-recurrence     | Tumor Recurrence Prediction | `microscope` | `microscope`                               |
| exp-foundation-framework | Foundation Model Framework  | `blocks`     | `blocks`                                   |
| exp-* (remaining ~11)    | various                     | **none**     | `projectIcon(domain, id)` → often `folder` |

### vision-board.json — semantic marks

| entity_id                    | field               | kind   | value                                            | component                |
| ---------------------------- | ------------------- | ------ | ------------------------------------------------ | ------------------------ |
| vb-program.drug-safety.badge | `programs[].badge`  | icon   | `pill`                                           | `ProgramBadgeCard.astro` |
| vb-program.persister.badge   | `programs[].badge`  | icon   | `microscope`                                     |                          |
| vb-org.* (7 cards)           | `orgCards[].icon`   | icon   | various                                          | `OrgImpactCard.astro`    |
| vb-hub.idea.satellites       | `hubs[].satellites` | icon[] | target, lightbulb, chart, book, handshake, globe | `HubCircle.astro`        |
| vb-hub.vision.satellites     | `hubs[].satellites` | icon[] | graph, document, table, pulse, image, blocks     |                          |

---

## 2. Logo files (VisionMark kind: logo)

**Pattern:** `public/assets/logos/{slug}.svg`  
**Schema:** `VisionMark` in `src/schemas.ts`

### vision-board.json — logo marks

| entity_id              | slug              | alt             | file expected                             | component                      |
| ---------------------- | ----------------- | --------------- | ----------------------------------------- | ------------------------------ |
| vb-hub.idea.center     | `kaggle`          | Kaggle          | `assets/source/logos/kaggle.png`          | `cards/HubCircle.astro`        |
| vb-hub.vision.center   | `brain`           | Multimodal AI   | `public/assets/logos/brain.png`           |                                |
| vb-program.broad.badge | `broad-institute` | Broad Institute | `assets/source/logos/broad-institute.png` | `cards/ProgramBadgeCard.astro` |
| vb-program.aacr.badge  | `aacr`            | AACR            | `assets/source/logos/aacr.png`            |                                |

### collaborations.json — optional logo field

| entity_id       | name                   | slug                     | status                              |
| --------------- | ---------------------- | ------------------------ | ----------------------------------- |
| coll-broad      | Broad Institute        | `broad-institute`        | wired in `LeadershipPhilosophy.astro` |
| coll-cshl       | Cold Spring Harbor Lab | `cshl`                   | wired                               |
| coll-iit        | IIT Madras             | `iit-madras`             | wired                               |
| coll-uppsala    | Uppsala University     | `uppsala-university`     | wired                               |
| coll-ai-sweden  | AI Sweden              | `ai-sweden`              | wired                               |

---

## 3. Heuristic-only (no JSON icon field)

### projects.json → projectIcon(domain, id)

Used by `FeaturedProjects.astro` and `ProjectAccordion.astro` on `/projects`.

| domain                            | default icon           | id keyword overrides              |
| --------------------------------- | ---------------------- | --------------------------------- |
| Biopharma R&D                     | `pill`                 | drug-safety → pill                |
| Translational Oncology            | `microscope`           | tumor, oncology → microscope      |
| Clinical / Oncology Imaging       | `scan`                 | imaging, segmentation → scan      |
| Digital / Computational Pathology | `microscope` / `graph` | pathology, gnn → microscope/graph |
| Enterprise Vision                 | `vision`               |                                   |     |
| Academic Research                 | `graduation`           |                                   |     |
| (unknown domain)                  | `folder`               |                                   |

### Hardcoded in components

| component                   | icons used                      | source                                        |
| --------------------------- | ------------------------------- | --------------------------------------------- |
| `ResearchDomainMap.astro`   | scan, microscope, pill, brain   | hardcoded array                               |
| `PipelineStrip.astro`       | target, layers, blocks, chart   | hardcoded steps                               |
| `Hero.astro`                | download                        | CTA button                                    |
| `Education.astro`           | graduation                      | section header                                |
| `Contact.astro`             | graduation                      | education block                               |
| `Conferences.astro`         | presentation (via ResearchCard) | prop default                                  |
| `Publications.astro`        | document (via ResearchCard)     | prop default                                  |
| `FeaturedCaseStudies.astro` | via PipelineStrip               |                                               |
| `VisionBoard.astro`         | chevron-right                   | decorative                                    |
| `BoardHeader.astro`         | chevron-right                   | decorative                                    |
| `Header.astro`              | Unicode ☀/☾/☰/✕                | **not** Icon.astro (sun/moon/menu/close idle) |
| `Kaggle.astro`              | emoji 🏆                        | **not** Icon.astro                            |

### link lists with logo field (LabeledLink.logo)

| file                | component                                          | logo slugs in use |
| ------------------- | -------------------------------------------------- | ----------------- |
| `publications.json` | `Publications.astro`, `FeaturedPublications.astro` | `jitc`, `biorxiv` |
| `conferences.json`  | `Conferences.astro`                                | `aacr`            |
| `speakers.json`     | `Speakers.astro`                                   | `gaia`, `aacr`    |

### Link lists (fallback icon when no logo)

| file          | component      | default icon        |
| ------------- | -------------- | ------------------- |
| `kaggle.json` | `Kaggle.astro` | emoji, not semantic |

---

## 4. Site brand assets

| entity_id   | path                                       | spec                      | referenced by               |
| ----------- | ------------------------------------------ | ------------------------- | --------------------------- |
| favicon-svg | `public/favicon.svg`                       | vector                    | `BaseHead.astro`, manifest  |
| favicon-ico | `public/favicon.ico`                       | legacy                    | `BaseHead.astro`            |
| favicon-32  | `public/assets/favicon-32.png`             | 32×32                     | optional                    |
| pwa-192     | `public/assets/icons/icon-192.png`         | 192×192                   | `site.webmanifest`          |
| pwa-512     | `public/assets/icons/icon-512.png`         | 512×512                   | manifest                    |
| apple-touch | `public/assets/icons/apple-touch-icon.png` | 180×180                   | `BaseHead.astro`            |
| og-image    | `public/assets/og/og-image.png`            | 1200×630, <1MB            | `site.json` → `seo.ogImage` |
| monogram    | CSS via `Monogram.astro`                   | initials from `site.name` | `Header.astro`              |

**Note:** `favicon.svg` uses `#2563eb`; design tokens specify accent `#6C2FBF` — flag for regeneration.

---

## 5. Content images

| entity_id | path field                  | current path                                | component    |
| --------- | --------------------------- | ------------------------------------------- | ------------ |
| portrait  | `profile.portrait.src`      | `/assets/images/balaji.png`                 | `Hero.astro` |
| photo     | `profile.photo`             | `/assets/images/balaji.png`                 | legacy alias |
| resume    | `public/assets/resume/balaji-selvaraj-resume.pdf` | asset-only (not in nav) | not an image |

### content/drafts/competitions/*.md (unwired / not in build)

16 competition markdown files. Typical frontmatter: `id`, `name`, `organizer`, `year`.  
No thumbnail field yet — propose `thumbnail: /assets/images/competitions/{slug}.png` when integrated.

| file pattern                       | proposed slug example           |
| ---------------------------------- | ------------------------------- |
| `comp-08-google-asl-signs.md`      | `comp-08-google-asl-signs`      |
| `comp-17-smart-india-hackathon.md` | `comp-17-smart-india-hackathon` |

Organizer logos (Kaggle, Google, AWS) may reuse `tech_logo` / `org_logo` slugs where applicable.

---

## 6. Orphan / dead code

| item                                                                    | issue                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| Icon keys `sun`, `moon`, `menu`, `close`, `arrow-up`, `external`, `dna` | in registry; Header uses Unicode instead                     |
| `Impact.jpg` (repo root)                                                | untracked; not wired — flag if user intends as content image |

---

## Audit row template

When running Phase A, emit one row per entity:

```markdown
| entity_id | content_file | field | current_value | asset_class | render_component | status |
```

Extend this file when new sections, schema fields, or asset directories are added.
