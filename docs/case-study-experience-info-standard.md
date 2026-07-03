# Case Study & Experience — Ideal Information Standard

The canonical reference for **what an item must contain, and in what format**, in the two most
information-dense sections of the site:

- **Experience** — `content/work/experience.json` → `Experience.astro` / `ExperienceIntro.astro`
- **Flagship case studies** — `content/work/projects.json` → `FeaturedCaseStudies.astro` →
  `cards/ProjectCaseStudyCard.astro`

Use it when adding or editing a role or a case study so every item is complete, comparable, and
easy for anyone to analyze at a glance.

> **Source of truth:** the field lists below mirror the Zod schemas in `src/schemas.ts`
> (`experienceSchema`, L316–351; `projectsSchema`, L354–390). If the schema and this doc ever
> disagree, the schema wins — update this doc. Do **not** invent fields here that the schema does
> not define.

## Overview & relationship

`projects.json` carries the note *"Derived view of headline projects from experience.json."* The
three flagship case studies are the **richest re-presentation of the flagship projects** already
described inside `experience.json` roles (currently the three AstraZeneca-Sweden projects). They are
selected by `featured: true` in `FeaturedCaseStudies.astro`.

Consequence — **the two must stay in sync**:

- A flagship case study's facts (org, role, period, quantified impact) must match the same project's
  bullets under its experience role. When you change a role, re-check its derived case study.
- Case studies *expand* experience projects (problem → solution → architecture → impact → lessons);
  they do not introduce new claims. Follow the no-fabrication / canonical-facts rule in
  [content-map.md](./content-map.md).

Two levels of "project" exist — don't confuse them:

| Term | Lives in | Shape | Rendered as |
| --- | --- | --- | --- |
| **Experience project** | `experience.json` → `roles[].projects[]` | name + subtitle + icon + bullets[] | Accordion inside a role card |
| **Flagship case study** | `projects.json` → `projects[]` | full narrative arc (problem…lessons) | Standalone disclosure card |

---

## Experience role — ideal information

Every entry in `experience.json → roles[]`. Fields marked **Req** are required by the schema; the
rest are optional but part of the *ideal* item (see the checklist).

| Field | Type | Req | Purpose | Where rendered |
| --- | --- | :-: | --- | --- |
| `id` | string | ✓ | Stable slug key (e.g. `az-sweden`) | Map key (not visible) |
| `position` | string | ✓ | Job title | `h3.xp-title` |
| `organization` | string | ✓ | Employer, incl. locale (e.g. `AstraZeneca, Sweden`) | `EntityLink` in role head |
| `entity` | slug | — | Links to `entities.json` for logo + URL | `CardMark` logo + link target |
| `location` | string | — | City, Country | Head meta line (after period, `·`) |
| `blurb` | string | — | One-line "what this role was about" | `p.xp-blurb` |
| `tech[]` | string[] | — | Skill/stack chips | `Chip` list |
| `period` | object | ✓ | `{ start, end, endLabel }` | Head meta line, via `periodLabel()` |
| `period.start` | string | ✓ | Start year, e.g. `"2023"` | — |
| `period.end` | string \| null | ✓ | End year, or `null` if current | — |
| `period.endLabel` | string | ✓ | `"Present"` for current, else `""` | — |
| `projects[]` | object[] | ✓ | Notable work in the role | Accordion list |
| `projects[].name` | string | ✓ | Project title | Accordion header |
| `projects[].subtitle` | string | — | Role · sponsorship · scale | Accordion header sub |
| `projects[].icon` | IconName | — | Lucide icon for the project | Accordion glyph |
| `projects[].bullets[]` | object[] | ✓ | Achievements | Accordion body |
| `bullets[].text` | string | ✓ | The achievement sentence | Bullet text |
| `bullets[].tier` | `'primary'` \| `'secondary'` | ✓ | Emphasis / ordering | Styling weight |

**Top-level section fields** (once per file, not per role): `title` ✓, `intro`, `headline`,
`headlineHighlight`, `snapshot[]` (metric `{ value, label }` cards on `ExperienceIntro`).

### Format & style rules

- **`period`** — current role: `end: null`, `endLabel: "Present"`. Past role: real `end` year and
  `endLabel: ""` (the label falls back to `end`). Never both a real `end` and `"Present"`.
- **`organization`** — include the country/site (`AstraZeneca, Sweden` vs `AstraZeneca, India`) so
  roles at the same company are distinguishable. `location` then adds the city.
- **`blurb`** — one sentence, present-tense-of-the-role, ≤ ~140 chars. States scope, not metrics.
- **`tech[]`** — 5–6 concise chips (proper-noun casing: `PyTorch`, `MLOps`). Not a laundry list.
- **`projects[].subtitle`** — the "Role · Sponsorship · $Scale" pattern, e.g.
  `AI Technical Lead · SVP-Sponsored · $3M+`. Reserve for projects where sponsorship/scale is a
  real differentiator (see gap audit for the standing decision).
- **`bullets`** — lead each project with exactly one `primary` bullet carrying a **quantified
  outcome** (Dice +46%, 90% F1, $20M–$50M). Supporting detail is `secondary`.
- **`icon`** — every project should set one; pick from the Lucide `IconName` set already in use
  (`pill`, `microscope`, `scan`, `graph`, `vision`, `brain`, `target`, `handshake`, …).

### Ideal role template

```jsonc
{
  "id": "org-slug",                         // stable, kebab-case
  "position": "Senior Deep Learning Engineer / AI Associate Principal",
  "organization": "AstraZeneca, Sweden",    // company + site
  "entity": "astrazeneca",                  // must exist in entities.json
  "location": "Gothenburg, Sweden",         // city, country
  "blurb": "Leads production AI across drug-safety, oncology, and clinical-imaging programs.",
  "period": { "start": "2023", "end": null, "endLabel": "Present" },
  "tech": ["Multimodal AI", "Foundation Models", "MLOps", "Single-cell Omics"],
  "projects": [
    {
      "name": "Drug Safety AI Platform",
      "subtitle": "AI Technical Lead · SVP-Sponsored · $3M+",
      "icon": "pill",
      "bullets": [
        { "text": "…predictive toxicology projected to save $20M–$50M annually.", "tier": "primary" },
        { "text": "Productionized ML pipelines with online learning and joint embedding.", "tier": "secondary" }
      ]
    }
  ]
}
```

### Role consistency checklist

- [ ] `id`, `position`, `organization`, `period` present; `entity` resolves in `entities.json`.
- [ ] `location` present (city, country).
- [ ] `blurb` present — one scope sentence.
- [ ] `tech[]` has 5–6 chips.
- [ ] Every project has `name` + `icon`; sponsored/flagship projects have a `subtitle`.
- [ ] Every project's first bullet is `primary` and quantified.
- [ ] `period.endLabel` is `"Present"` **iff** `end` is `null`.

---

## Flagship case study — ideal information

Every entry in `projects.json → projects[]` that has `featured: true`. The card shows a summary +
impact + tags always, and reveals the narrative arc (`problem → solution → architecture → outcome →
lessons`) in a "Read the full case study" disclosure.

| Field | Type | Req | Purpose | Where rendered |
| --- | --- | :-: | --- | --- |
| `id` | string | ✓ | Stable slug key | (not visible) |
| `name` | string | ✓ | Case-study title | `h3.cs-name` |
| `org` | string | ✓ | Org + site | `cs-role` line |
| `entity` | slug | — | Links to `entities.json` | `EntityLink` |
| `period` | string | ✓ | Pre-formatted, e.g. `2023–Present` | `cs-meta` (after `domain`) |
| `role` | string | ✓ | Your role on the work | `cs-role` line |
| `domain` | string | ✓ | Field, e.g. `Biopharma R&D` | `cs-meta` (before `period`) |
| `summary` | string | ✓ | One plain-language sentence | `cs-summary` |
| `businessImpact` | string | — | The headline outcome | `cs-impact` labeled card |
| `problem` | string | — | Why it mattered | Disclosure block |
| `solution` | string | — | What you built | Disclosure block |
| `architecture` | string | — | How it works / scale | Disclosure block |
| `outcome` | string | — | Result / follow-on | Disclosure block |
| `lessons` | string | — | What you learned | Disclosure block |
| `tags[]` | string[] | ✓ | Topic chips (first 3 shown, rest `+N more`) | `cs-tags` |
| `highlights[]` | string[] | ✓ | 3 punchy takeaways | **Data-only — not rendered** ⚠️ |
| `icon` | IconName | — | Visual accent | **Data-only — not rendered** ⚠️ |
| `featured` | boolean | — | `true` → shown in Flagship section | Filter only |

**Top-level section fields**: `title` ✓, `note`, `intro`, `snapshot[]`, `groups[]`.

### Format & style rules

- **`period`** here is a **pre-formatted string** (`"2023–Present"`), unlike the experience
  `period` object. Use an en-dash (`–`), and match the derived experience role's dates.
- **`domain · period`** is the small meta line — keep `domain` a short field label
  (`Translational Oncology`, `Clinical Imaging`), not a sentence.
- **`summary`** — one jargon-light sentence a non-specialist understands; it can name the
  sponsorship/scale ("within a $3M+ SVP-sponsored initiative").
- **Narrative arc** — fill all five for a flagship item, each 1–2 sentences, in this logical order:
  - `problem` — the constraint/gap, no solution yet.
  - `solution` — the system you architected.
  - `architecture` — how it works / how far it scaled.
  - `outcome` — measured result or concrete follow-on (collaboration, deployment, benchmark).
  - `lessons` — the transferable insight.
- **`businessImpact`** — the single most quotable outcome (money, time, or sponsor mandate). It is
  shown *outside* the disclosure, so make it strong and self-contained.
- **`tags[]`** — order by importance: the **first 3 are the only visible ones**; the rest collapse
  into `+N more`. 3–5 tags total.
- **`highlights[]`** — three crisp takeaways (impact / method / proof). Currently data-only — see
  the gap audit for the standing decision on rendering it.

### Ideal case study template

```jsonc
{
  "id": "drug-safety-ai-platform",
  "name": "Drug Safety AI Platform",
  "org": "AstraZeneca, Sweden",
  "entity": "astrazeneca",                 // must exist in entities.json
  "period": "2023–Present",                // pre-formatted string, en-dash
  "role": "AI Technical Lead",
  "domain": "Biopharma R&D",               // short field label
  "summary": "An AI platform that predicts drug safety at scale by learning from omics, imaging, and molecular data together — within a $3M+ SVP-sponsored initiative.",
  "featured": true,
  "icon": "pill",                          // data-only today
  "problem": "Drug safety assessment relies on costly animal studies and multi-year timelines…",
  "solution": "Architected a model-agnostic multimodal AI platform integrating omics, imaging, and molecular features…",
  "architecture": "Productionized ML pipelines with online learning, confidence estimation, and joint embedding…",
  "businessImpact": "Projected $20M–$50M annual savings by reducing animal studies and compressing safety timelines from five to three years.",
  "outcome": "Initiated a Broad Institute collaboration to co-develop Cell Painting and omics pipelines.",
  "lessons": "Cross-vendor data integration and stakeholder alignment matter as much as model architecture.",
  "highlights": [                          // data-only today; 3 takeaways
    "Projected $20M–$50M annual savings…",
    "Productionized ML pipelines with online learning and joint embedding.",
    "Broad Institute collaboration on Cell Painting and omics pipelines."
  ],
  "tags": ["Multimodal AI", "Drug Safety", "Omics", "MLOps", "Foundation Models"]
}
```

### Case study consistency checklist

- [ ] `id`, `name`, `org`, `role`, `domain`, `period`, `summary` present; `entity` resolves.
- [ ] `period` string matches the derived experience role's dates (en-dash).
- [ ] `summary` is one plain-language sentence.
- [ ] All five arc fields (`problem`, `solution`, `architecture`, `outcome`, `lessons`) present.
- [ ] `businessImpact` present and quotable (money / time / mandate).
- [ ] `tags[]` ordered by importance (first 3 are the shown ones); 3–5 total.
- [ ] `highlights[]` has 3 takeaways; `icon` set — even though both are data-only today.
- [ ] Facts trace back to the matching experience project (no new claims).

---

## Cross-cutting consistency rules

- **`entity` slugs** must exist in `entities.json` (`{ name, url }`). An unknown slug renders no
  logo/link.
- **`icon` values** must be valid Lucide `IconName`s (see `iconNameSchema` in `src/schemas.ts`).
- **Impact-first writing** — lead with the quantified result, then method. Applies to experience
  `primary` bullets, `businessImpact`, and `highlights`.
- **No fabrication** — every line traces to the resume/wiki source; preserve canonical facts
  verbatim (team scale 1→12; "$3M+ = AI Lead *within*"; $20M–$50M is a program-level projection).
  See [content-map.md](./content-map.md).
- **Keep the derived view in sync** — editing an experience role that has a flagship case study
  means re-checking `org`, `role`, `period`, and the quantified impact in `projects.json`.
- **Schema first** — to add a field, update `src/schemas.ts`, then the JSON, then the component
  (the golden rule in [content-editing.md](./content-editing.md)), then this doc.

---

## Current gap audit + recommendations

Snapshot of where today's data drifts from the ideal, with a recommended standing decision. Each is
an **option to record**, not an imposed edit.

| Gap | Where | Current | Recommendation |
| --- | --- | --- | --- |
| `location` missing on some roles | roles `az-l2`, `az-l1` | 4/6 roles have it | **Add `location` to all 6 roles** (city, country) so the head meta line is uniform. |
| `subtitle` sparse on experience projects | 10/14 projects lack it | 4/14 have it | **Decide the rule:** reserve `subtitle` for sponsored/flagship projects (document as intentional), *or* add one to every project. Recommended: keep it *reserved* and note it here so absence reads as deliberate. |
| `icon` never rendered (case studies) | all case studies | in data, unused | Field is passed nowhere from `FeaturedCaseStudies.astro`. **Either** surface it in the `ProjectCaseStudyCard` header (a `CardMark`, matching experience accordions) **or** keep it data-only and leave it marked ⚠️ above. Recommended: surface it — the data already exists and adds a visual anchor. |
| `highlights[]` never rendered (case studies) | all case studies | **required** in schema, unused | A required array that reaches no component. **Either** render it (e.g. a bulleted list inside the disclosure, above/below the arc blocks) **or** downgrade it to `.optional()` in the schema and keep it as author notes. Recommended: render it — three curated takeaways are higher-signal than the long arc for skimmers. |

> These four are **content/rendering decisions, not bugs** — the site builds and validates today.
> Resolving them (and recording the choice here) is what keeps future items consistent.

---

## Related docs

- [Content editing](./content-editing.md) — how to edit the JSON files these items live in
- [Content map](./content-map.md) — résumé → portfolio provenance and canonical-facts rules
- [content/README.md](../content/README.md) — curation rules
- `src/schemas.ts` — the enforced schema (source of truth for every field above)
