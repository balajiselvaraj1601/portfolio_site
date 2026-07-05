# Experience — Ideal Information Standard

The canonical reference for **what an experience role and its nested projects must contain, and in
what format**, in the site's most information-dense section:

- **Experience** — `content/work/experience.json` → `Experience.astro`

Use it when adding or editing a role or nested project so every item is complete, comparable, and
easy for anyone to analyze at a glance.

> **Source of truth:** the field lists below mirror `experienceSchema` in `src/schemas.ts`. If the
> schema and this doc ever disagree, the schema wins — update this doc. Do **not** invent fields here
> that the schema does not define.

---

## Experience role — ideal information

Every entry in `experience.json → roles[]`. Fields marked **Req** are required by the schema; the
rest are optional but part of the _ideal_ item (see the checklist).

| Field                  | Type                         | Req | Purpose                                             | Where rendered                      |
| ---------------------- | ---------------------------- | :-: | --------------------------------------------------- | ----------------------------------- |
| `id`                   | string                       |  ✓  | Stable slug key (e.g. `az-sweden`)                  | Map key (not visible)               |
| `position`             | string                       |  ✓  | Job title                                           | `h3.xp-title`                       |
| `organization`         | string                       |  ✓  | Employer, incl. locale (e.g. `AstraZeneca, Sweden`) | `EntityLink` in role head           |
| `entity`               | slug                         |  —  | Links to `entities.json` for logo + URL             | `CardMark` logo + link target       |
| `location`             | string                       |  —  | City, Country                                       | Head meta line (after period, `·`)  |
| `blurb`                | string                       |  —  | One-line "what this role was about"                 | `p.xp-blurb`                        |
| `tech[]`               | string[]                     |  —  | Skill/stack chips                                   | `Chip` list                         |
| `period`               | object                       |  ✓  | `{ start, end, endLabel }`                          | Head meta line, via `periodLabel()` |
| `period.start`         | string                       |  ✓  | Start year, e.g. `"2023"`                           | —                                   |
| `period.end`           | string \| null               |  ✓  | End year, or `null` if current                      | —                                   |
| `period.endLabel`      | string                       |  ✓  | `"Present"` for current, else `""`                  | —                                   |
| `projects[]`           | object[]                     |  ✓  | Notable work in the role                            | Project cards inside role panel     |
| `projects[].name`      | string                       |  ✓  | Project title                                       | Project header                      |
| `projects[].subtitle`  | string                       |  —  | Role · sponsorship · scale                          | Project header sub                  |
| `projects[].icon`      | IconName                     |  —  | Lucide icon for the project                         | Project glyph                       |
| `projects[].bullets[]` | object[]                     |  ✓  | Achievements                                        | Project body                        |
| `bullets[].text`       | string                       |  ✓  | The achievement sentence                            | Bullet text                         |
| `bullets[].tier`       | `'primary'` \| `'secondary'` |  ✓  | Emphasis / ordering                                 | Styling weight                      |

**Top-level section fields** (once per file, not per role): `title` ✓, `intro`, `headline`,
`headlineHighlight`.

### Format & style rules

- **`period`** — current role: `end: null`, `endLabel: "Present"`. Past role: real `end` year and
  `endLabel: ""` (the label falls back to `end`). Never both a real `end` and `"Present"`.
- **`organization`** — include the country/site (`AstraZeneca, Sweden` vs `AstraZeneca, India`) so
  roles at the same company are distinguishable. `location` then adds the city.
- **`blurb`** — one sentence, present-tense-of-the-role, ≤ ~140 chars. States scope, not metrics.
- **`tech[]`** — 5–6 concise chips (proper-noun casing: `PyTorch`, `MLOps`). Not a laundry list.
- **`projects[].subtitle`** — the "Role · Sponsorship · $Scale" pattern, e.g.
  `AI Technical Lead · SVP-Sponsored · $3M+`. Reserve for projects where sponsorship/scale is a
  real differentiator.
- **`bullets`** — lead each project with exactly one `primary` bullet carrying a **quantified
  outcome** (Dice +46%, 90% F1, $20M–$50M). Supporting detail is `secondary`.
- **`icon`** — every project should set one; pick from the Lucide `IconName` set already in use
  (`pill`, `microscope`, `scan`, `graph`, `vision`, `brain`, `target`, `handshake`, …).

### Ideal role template

```jsonc
{
  "id": "org-slug",
  "position": "Senior Deep Learning Engineer / AI Associate Principal",
  "organization": "AstraZeneca, Sweden",
  "entity": "astrazeneca",
  "location": "Gothenburg, Sweden",
  "blurb": "Leads production AI across drug-safety, oncology, and clinical-imaging programs.",
  "period": { "start": "2023", "end": null, "endLabel": "Present" },
  "tech": ["Multimodal AI", "Foundation Models", "MLOps", "Single-cell Omics"],
  "projects": [
    {
      "name": "Drug Safety AI Platform",
      "subtitle": "AI Technical Lead · SVP-Sponsored · $3M+",
      "icon": "pill",
      "bullets": [
        {
          "text": "…predictive toxicology projected to save $20M–$50M annually.",
          "tier": "primary"
        },
        {
          "text": "Productionized ML pipelines with online learning and joint embedding.",
          "tier": "secondary"
        }
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

## Cross-cutting consistency rules

- **`entity` slugs** must exist in `entities.json` (`{ name, url }`). An unknown slug renders no
  logo/link.
- **`icon` values** must be valid Lucide `IconName`s (see `iconNameSchema` in `src/schemas.ts`).
- **Impact-first writing** — lead with the quantified result, then method. Applies to experience
  `primary` bullets.
- **No fabrication** — every line traces to the resume/wiki source; preserve canonical facts
  verbatim (team scale 1→12; "$3M+ = AI Lead *within*"; $20M–$50M is a program-level projection).
  See [content-map.md](./content-map.md).
- **Schema first** — to add a field, update `src/schemas.ts`, then the JSON, then the component
  (the golden rule in [content-editing.md](./content-editing.md)), then this doc.

---

## Related docs

- [Content editing](./content-editing.md) — how to edit the JSON files these items live in
- [Content map](./content-map.md) — résumé → portfolio provenance and canonical-facts rules
- [content/README.md](../content/README.md) — curation rules
- `src/schemas.ts` — the enforced schema (source of truth for every field above)
