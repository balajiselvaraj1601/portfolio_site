# Validation cascade

`npm run build` runs `src/lib/content.ts`, which loads and validates every
content file at build time and throws on the first failure — so malformed
content never ships. The checks run in this order; know the failure shapes so you
can jump straight to the cause. The messages below are quoted from `content.ts` /
the `load()` helper — treat those files as the SSOT for exact wording.

## 1. Content shape (Zod `safeParse`)

The `load(name, schema, raw)` helper parses each file against its schema in
`src/schemas/`. On failure it throws:

```
Invalid content in <file>:
  • <field.path>: <message>
```

e.g. `Invalid content in profile.json:` / `• contact.2.href: Invalid url`. The
path is the JSON location. **Fix:** correct the field at that path, or — if you
meant to add a new field — extend the schema first (see
`schema-first-recipe.md`).

## 2. Entity slug resolution

After load, `assertEntitySlug()` checks every `entity` slug against the keys of
`content/entities.json`, for Experience roles, Collaborations, Education records,
and Vision programs. A dangling slug throws:

```
<context>: unknown entity slug "<slug>"
```

**Fix:** add `"<slug>": { "name": …, "url": … }` to `content/entities.json`
(the `url` must itself be a valid URL, enforced by `entitiesSchema`), or correct
the slug in the content file.

## 3. Logo asset resolution

`assertLogoAsset()` checks every referenced logo slug against the files scanned
from `public/assets/logos/` (subfolders in `LOGO_SUBDIRS = ['org','marks','']`,
extensions tried in `LOGO_EXTS = ['png','svg','webp','avif']`). Referenced slugs
come from Collaborations `logo`, Vision marks (`kind:'logo'` → `asset`),
publications/conferences/speakers `logo`, and Kaggle `logo`. Missing asset throws:

```
content logo reference: missing logo asset "<slug>" under public/assets/logos/
```

**Fix:** drop the file into `public/assets/logos/org/` (brand logos) or
`.../marks/` (generated marks) with the slug as its filename — no code change —
or remove/correct the `logo`/`asset` reference. (Adding the _image itself_ is the
`portfolio-icon-*` skills' domain; this skill only cares that the slug resolves.)

## 4. Section / view wiring

Still in `content.ts`, after nav derivation, several assertions guard
`content/site.json` wiring. Each throws a distinct message:

| Condition                                                  | Message (from `content.ts`)                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `viewSections` references a section not in `home.sections` | `view "<id>" references section "<s>" not in home.sections`      |
| A home section is in no `viewSections` group               | `home section "<s>" is not assigned to any viewSections`         |
| A section is in two views                                  | `section "<s>" is assigned to both "<a>" and "<b>" viewSections` |
| A home section has no component                            | `home section "<s>" has no component in SectionRenderer`         |
| `home` page missing                                        | `site.json: missing home page`                                   |

`siteSchema.superRefine` also rejects (at step 1) an internal page with no
`viewSections`, or a `viewSections` id absent from the `sections` registry.

**Fix:** reconcile `pages[id=home].sections`, the `pages[].viewSections` groups,
and the `sections` registry so every home section appears in exactly one view and
has a component in both `SectionRenderer.astro` and `section-ids.ts`.

## 5. Icon geometry (adjacent, same build)

Not content, but the same build asserts every `iconNameSchema` option has
geometry in `src/lib/icon-paths.json`:
`icon-paths.json: missing geometry for icon "<name>"`. Owned by the
`portfolio-icon-*` skills — noted here so the error isn't mistaken for a content
bug.

## Diagnosis order

1. Read the thrown line. `Invalid content in …` → shape (step 1). A bare
   `unknown entity slug` / `missing logo asset` / `section …` → steps 2–4.
2. Jump to the named file and path. Do not re-run repeatedly to bisect — the
   message already localizes the fault.
3. Rebuild after the fix; the loader is fail-fast, so one clean build means all
   cascades passed.
