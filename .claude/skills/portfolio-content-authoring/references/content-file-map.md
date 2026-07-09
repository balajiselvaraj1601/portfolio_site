# Content file map

Which JSON file feeds which section and component. Derived from
`content/site.json → sections[].source`, the loader exports in
`src/lib/content.ts`, the `SECTIONS` map in
`src/components/SectionRenderer.astro`, and the AGENTS.md route map. The listed
files remain the SSOT — this table is a pointer, not a copy.

## Section → source JSON → component

| Section id        | Source JSON (`sections[].source`) | Component (`src/components/sections/`)                     |
| ----------------- | --------------------------------- | ---------------------------------------------------------- |
| `hero`            | `person/profile.json`             | `Hero.astro` (in `HeroLanding`)                            |
| `thirukural`      | `person/profile.json`             | `ThirukuralQuote.astro`                                    |
| `about`           | `person/profile.json`             | `About.astro`                                              |
| `experience`      | `work/experience.json`            | `Experience.astro`                                         |
| `publications`    | `research/publications.json`      | `Publications.astro`                                       |
| `conferences`     | `research/conferences.json`       | `Conferences.astro`                                        |
| `speakers`        | `research/speakers.json`          | `Speakers.astro`                                           |
| `awards`          | `recognition/awards.json`         | `Awards.astro`                                             |
| `kaggle`          | `recognition/kaggle.json`         | `Kaggle.astro`                                             |
| `education`       | `recognition/education.json`      | `Education.astro`                                          |
| `vision-programs` | `work/vision-board.json`          | `VisionPrograms.astro` (+ `vision/VisionImpactGrid.astro`) |
| `contact`         | `person/profile.json`             | `Contact.astro`                                            |

`Contact.astro` also reads `person/collaborations.json` indirectly via the
About/Collaborations strip; `entities.json` is a global registry consumed by
whichever section references an `entity` slug (Experience, Education,
Collaborations, Vision programs). Both are loaded in `src/lib/content.ts`.

## Registry files (not sections)

| File                                 | Role                                                                  |
| ------------------------------------ | --------------------------------------------------------------------- |
| `content/entities.json`              | Global `slug → { name, url }` registry. Referenced by `entity` slugs. |
| `content/person/collaborations.json` | Collaborations strip; `logo` + optional `entity` slugs.               |

## Routing & view wiring (all in `content/site.json`)

- **`sections`** — the registry: `sectionId → { title, source, visible, eyebrow? }`.
- **`pages[id=home].sections`** — full DOM order on `/` (each id appears once).
- **`pages[].viewSections`** — the sections grouped under each nav view. Each home
  section must appear in **exactly one** `viewSections` group.
- **`pages[].viewAnchor`** — URL hash for a view; only `home` sets it (`about`).
  Every other page falls back to its `id` (`anchor = viewAnchor ?? id`, see
  `navViews` / `navHref` in `src/lib/content.ts`).

Nav view → sections (from `content/site.json → pages`):

| Nav view / hash | Page id       | `viewSections`                            |
| --------------- | ------------- | ----------------------------------------- |
| `/` (About)     | `home`        | `about`, `hero`, `thirukural`             |
| `/#experience`  | `experience`  | `experience`                              |
| `/#research`    | `research`    | `publications`, `conferences`, `speakers` |
| `/#recognition` | `recognition` | `awards`, `kaggle`, `education`           |
| `/#vision`      | `vision`      | `vision-programs`                         |
| `/#contact`     | `contact`     | `contact`                                 |

The authoritative order and grouping live in `content/site.json`; if this table
and the JSON ever disagree, the JSON wins — re-read it. Legacy routes
(`/experience` … `/contact`) are `ViewRedirect` stubs in `src/pages/*.astro`;
do not put content order there.

## Editing wiring

- **Reorder on `/`** — reorder ids in `pages[id=home].sections`.
- **Move a section to another nav view** — move its id between `viewSections`
  arrays (keep it in exactly one).
- **Show/hide** — toggle `sections[id].visible`.
- Then `npm run build`; the assertions in `content.ts` catch unassigned,
  duplicated, or component-less sections.
