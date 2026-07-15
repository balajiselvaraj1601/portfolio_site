# Schema-first recipe

The exact order for changing content. Skipping step 1 when a field is involved
either drops the data (Zod strips unknown keys) or fails the build.

## A. Change copy only (no new field)

1. Edit the JSON value under `content/` (see the file map in
   `content-file-map.md`).
2. Run `npm run build` - Zod validates automatically.
3. `npm run preview` and spot-check the section.

No schema change: the field already exists in `src/schemas/`.

## B. Add or rename a field on an existing item

Order matters - the schema owns the shape and all types derive from it via
`z.infer`, so it changes **first**.

1. **Schema first.** Extend the relevant Zod object in `src/schemas/`
   (e.g. add `foo: z.string().optional()`). Prefer `.optional()` unless every
   existing record already has the value, or the build rejects the current JSON.
   Do **not** write a parallel `interface`/`type` - the exported type is already
   `z.infer<typeof ...Schema>`.
2. **JSON next.** Add the field to the JSON file(s) it applies to.
3. **Component last.** Update the section component under
   `src/components/sections/` to render the new field. The prop type flows from
   the derived type automatically.
4. **Validate.** `npm run build`. On a shape error the loader prints the exact
   path (e.g. `• roles.2.foo: Required`); fix at that path and rebuild.

## C. Add a whole new content item (award, role, publication, talk, competition...)

1. Confirm the item's schema in `src/schemas/` (each list is an
   `z.array(...)` - `awardsSchema.items`, `experienceSchema.roles`,
   `linkListSchema.items`, `speakersSchema.items`, `kaggleSchema.items`, etc.).
   Note required vs optional fields and any enums (e.g. `awardLevelSchema`,
   `kaggleMedalSchema`, `xpLevelSchema`) - enum members are owned by the schema,
   read them there.
2. Append the new object to the JSON array with every required field. Match an
   existing sibling entry as a template for field coverage.
3. If the item references an organization via `entity`, ensure that slug exists
   in `content/pages/99_entities.json` (add `{ name, url }` first if not). If it carries a
   `logo` / logo-mark `asset`, ensure the asset file exists under
   `public/assets/logos/` - the loader throws otherwise (see
   `validation-cascade.md`).
4. `npm run build`, then `npm run preview` to spot-check.

## D. Add a new _section_ (rare - new component + wiring)

1. Build/choose the component and register its id in the `SECTIONS` map in
   `src/components/SectionRenderer.astro` and the `SECTION_COMPONENT_IDS` list in
   `src/lib/section-ids.ts` (these two must agree - `content.ts` asserts every
   home section has a component).
2. Add the section to `content/pages/00_site.json - sections` (`title`, `source`,
   `visible`).
3. Insert the id into `pages[id=home].sections` at the right DOM position **and**
   into exactly one `pages[].viewSections` group.
4. `npm run build` - the wiring assertions in `content.ts` fail fast if the id is
   unassigned, duplicated across views, or missing a component.

## Rules to keep in mind

- **One definition.** A value that already lives in `entities.json`, a schema
  enum, or `:root` tokens is imported/referenced, never re-typed into content.
- **Route files stay generic.** Never reorder sections in `src/pages/*.astro`;
  order lives in `content/pages/00_site.json`.
- **Privacy.** No phone, no References - see `privacy-and-curation.md`.
