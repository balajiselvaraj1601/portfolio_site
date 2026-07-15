---
name: portfolio-content-authoring
description: >-
  Schema-first editing of the Zod-validated JSON files under content/ for the
  Astro portfolio - the copy layer, not the design layer. Use for "edit
  content", "add an award/publication/role", "change copy", "update
  experience/awards/kaggle", "add a content field", "content JSON",
  "schema-first", reorder/hide a section, wire a section into a view, link an
  organization, or fix a build-time content validation error. Components render
  data; they never embed copy - so every text change lands in content/ and every
  new field starts in src/schemas/. Do NOT use for visual/token/card design
  (portfolio-card-shells), for icons/marks/glyphs or missing logo assets
  (portfolio-icon-* skills), or for cross-view design conflicts
  (page-consistency-team).
---

# Portfolio content authoring Skill

Binding rules for changing **what the site says** - the Zod-validated JSON under
`content/`. Components read data; they do not hardcode copy. This skill documents
and points at the existing SSOTs; it never restates a schema, token, or config
value that another file owns.

**Repo:** `/home/engineer/workspace/portfolio_site`

## Authorities (SSOT - do not duplicate their values)

| Source                                  | Owns                                                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/schemas/`                          | Content **shape** - every field, enum, and constraint. All types derive via `z.infer` (no parallel interfaces).                                     |
| `src/lib/content.ts`                    | Build-time **validation cascade**: `load()` per file, entity-slug + logo-asset + section/view wiring checks, and `logoSrc` / nav / view derivation. |
| `content/README.md`                     | Provenance (curated snapshot of the résumé), curation rules, file-section map.                                                                      |
| `docs/content-editing.md`               | Step-by-step editing workflow, per-file edit reference, schema-rule table.                                                                          |
| `content/pages/00_site.json`            | Section registry (`sections`) + routing/view wiring (`pages[].sections`, `pages[].viewSections`).                                                   |
| `AGENTS.md` - content flow + Hard Rules | The `content - schemas - content.ts - SectionRenderer - routes` pipeline and the privacy rule.                                                      |

Reference these files by path. Never copy an enum member, field list, or URL out of them into content or docs - read the owner instead.

## Core rule

> **The schema is the source of truth for shape; the JSON is the source of truth
> for copy.** To add or change any field, edit `src/schemas/` **first** (types
> flow from it via `z.infer`), then the JSON, then the component. To change words
> only, edit the JSON alone. Never hardcode copy in a component, and never
> hand-write a type that mirrors a schema.

## The five rules that fail the build if broken

1. **Schema before field.** Types are derived (`z.infer` in `src/schemas/`). A
   JSON field with no schema entry is dropped or rejected by `safeParse`. Extend
   the Zod schema **before** adding or renaming a JSON field. See
   [references/schema-first-recipe.md](references/schema-first-recipe.md).
2. **Entity & logo slugs must resolve.** Every `entity` slug referenced in content
   must exist in `content/pages/99_entities.json`; every `logo` / logo-mark `asset` slug
   must have a file under `public/assets/logos/` (per `LOGO_SUBDIRS` scan). A dangling
   slug throws at build. See [references/validation-cascade.md](references/validation-cascade.md).
3. **Keep section-view wiring in `content/pages/00_site.json`.** `pages[id=home].sections`
   is the full DOM order on `/`; each `pages[].viewSections` groups sections under a
   nav view. Every home section must appear in **exactly one** `viewSections`, and
   route files stay generic - do not reorder in `src/pages/*.astro`. See
   [references/content-file-map.md](references/content-file-map.md).
4. **Privacy (Hard Rule).** Never publish a phone number or a References section.
   Contact channels are limited to the `contactTypeSchema` enum in `src/schemas/person.ts`.
   See [references/privacy-and-curation.md](references/privacy-and-curation.md).
5. **Validate with `npm run build`.** Zod runs automatically and fails fast - it
   reports the exact field path on a shape error and a named error on a broken slug
   or section/view wiring. Fix at the reported path and rebuild.

## Which file do I edit?

Each section renders from one JSON file. The full map (section id - source file -
component) lives in [references/content-file-map.md](references/content-file-map.md);
it is derived from `content/pages/00_site.json - sections[].source`, `src/lib/content.ts`,
and `SectionRenderer.astro`. Quick pointers:

| You want to change...                          | Edit                                 |
| -------------------------------------------- | ------------------------------------ |
| Hero, About, collaborations copy             | `content/pages/01_about.json`        |
| An experience role / project / bullet        | `content/pages/02_experience.json`   |
| A publication / conference / talk link       | `content/pages/03_research.json`     |
| Award, Kaggle, or education content          | `content/pages/04_recognition.json`  |
| Vision programs / org-impact cards           | `content/pages/05_vision.json`       |
| Contact page copy and channels               | `content/pages/06_contact.json`      |
| Nav, SEO, section order, show/hide a section | `content/pages/00_site.json`         |
| An organization link (slug - name/url)       | `content/pages/99_entities.json`     |

## When to load references

| If the task involves...                                              | Load                                                     |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| Adding a new field or a new content item (exact step order)        | `references/schema-first-recipe.md`                      |
| Finding which JSON feeds which section/component, or wiring a view | `references/content-file-map.md`                         |
| Diagnosing a build failure (shape / entity / logo / wiring)        | `references/validation-cascade.md`                       |
| Privacy rules, curation constraints, re-deriving from the résumé   | `references/privacy-and-curation.md`                     |
| A pure copy tweak inside an existing field (default)               | Edit the JSON, run `npm run build` - no reference needed |
