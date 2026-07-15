# Content file map

Which JSON file feeds which section and component. Derived from
`content/pages/00_site.json - sections[].source`, the loader exports in
`src/lib/content.ts`, the `SECTIONS` map in
`src/components/SectionRenderer.astro`, and the AGENTS.md route map. The listed
files remain the SSOT - this table is a pointer, not a copy.

## Section - source JSON - component

| Section id        | Source JSON (`sections[].source`) | Component (`src/components/sections/`)                     |
| ----------------- | --------------------------------- | ---------------------------------------------------------- |
| `hero`            | `pages/01_about.json`             | `Hero.astro` (in `HeroLanding`)                            |
| `thirukural`      | `pages/01_about.json`             | `ThirukuralQuote.astro`                                    |
| `about`           | `pages/01_about.json`             | `About.astro`                                              |
| `experience`      | `pages/02_experience.json`        | `Experience.astro`                                         |
| `publications`    | `pages/03_research.json`          | `Publications.astro`                                       |
| `conferences`     | `pages/03_research.json`          | `Conferences.astro`                                        |
| `speakers`        | `pages/03_research.json`          | `Speakers.astro`                                           |
| `awards`          | `pages/04_recognition.json`       | `Awards.astro`                                             |
| `kaggle`          | `pages/04_recognition.json`       | `Kaggle.astro`                                             |
| `education`       | `pages/04_recognition.json`       | `Education.astro`                                          |
| `vision-programs` | `pages/05_vision.json`            | `VisionPrograms.astro` (+ `vision/VisionImpactGrid.astro`) |
| `contact`         | `pages/06_contact.json`           | `Contact.astro`                                            |

`pages/01_about.json` also owns the About collaborations strip;
`pages/99_entities.json` is a global registry consumed by
whichever section references an `entity` slug (Experience, Education,
Collaborations, Vision programs). Both are loaded in `src/lib/content.ts`.

## Registry files (not sections)

| File                             | Role                                                                  |
| -------------------------------- | --------------------------------------------------------------------- |
| `content/pages/99_entities.json` | Global `slug - { name, url }` registry. Referenced by `entity` slugs. |
| `content/pages/00_site.json`     | Section registry, nav views, SEO defaults, and theme metadata.        |

## Routing & view wiring (all in `content/pages/00_site.json`)

- **`sections`** - the registry: `sectionId - { title, source, visible, eyebrow? }`.
- **`pages[id=home].sections`** - full DOM order on `/` (each id appears once).
- **`pages[].viewSections`** - the sections grouped under each nav view. Each home
  section must appear in **exactly one** `viewSections` group.
- **`pages[].viewAnchor`** - URL hash for a view; only `home` sets it (`about`).
  Every other page falls back to its `id` (`anchor = viewAnchor ?? id`, see
  `navViews` / `navHref` in `src/lib/content.ts`).

Nav view - sections (from `content/pages/00_site.json - pages`):

| Nav view / hash | Page id       | `viewSections`                            |
| --------------- | ------------- | ----------------------------------------- |
| `/` (About)     | `home`        | `about`, `hero`, `thirukural`             |
| `/#experience`  | `experience`  | `experience`                              |
| `/#research`    | `research`    | `publications`, `conferences`, `speakers` |
| `/#recognition` | `recognition` | `awards`, `kaggle`, `education`           |
| `/#vision`      | `vision`      | `vision-programs`                         |
| `/#contact`     | `contact`     | `contact`                                 |

The authoritative order and grouping live in `content/pages/00_site.json`; if this table
and the JSON ever disagree, the JSON wins - re-read it. Legacy routes
(`/experience` ... `/contact`) are `ViewRedirect` stubs in `src/pages/*.astro`;
do not put content order there.

## Editing wiring

- **Reorder on `/`** - reorder ids in `pages[id=home].sections`.
- **Move a section to another nav view** - move its id between `viewSections`
  arrays (keep it in exactly one).
- **Show/hide** - toggle `sections[id].visible`.
- Then `npm run build`; the assertions in `content.ts` catch unassigned,
  duplicated, or component-less sections.
