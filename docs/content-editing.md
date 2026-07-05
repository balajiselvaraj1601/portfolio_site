# Content Editing

How to change what the site says without touching components.

## Golden rule

**All copy lives in JSON under `content/`.** Components render data; they do not embed text.
If you need a new field, update `src/schemas.ts` first, then the JSON, then the component.

## Workflow

1. Edit the relevant JSON file under `content/`.
2. Run `npm run build` — Zod validation runs automatically.
3. Fix any schema errors (the build output shows the exact field path).
4. Preview with `npm run preview` and spot-check the section.

If the change affects page structure, section order, or the overall narrative, update
`content/site.json` first and keep the route files generic.

## File reference

| File                         | Sections affected                     | Typical edits                                                                                                                |
| ---------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `site.json`                  | Global meta, nav, pages, SEO          | Title, tagline, nav labels, page sections, hide a section                                                                    |
| `person/profile.json`        | Hero, Leadership, Contact             | Headline, metrics, CTAs, `leadershipPhilosophy.*`, `contactIntro`, `contactPage`, contact channels                           |
| `person/collaborations.json` | Collaborations strip on About         | Organization names; optional `logo` slug → `public/assets/logos/{slug}.png`; optional `entity` slug → URL in `entities.json` |
| `entities.json`              | Entity links (global registry)        | Slug → `{ name, url }` for organizations referenced across sections                                                          |
| `work/vision-board.json`     | Vision view (`/#vision`)              | Infographic hubs, program cards, org impact cards                                                                            |
| `work/experience.json`       | Experience                            | Roles, optional `mission`, `intro`, `headline`, nested `projects[]`, bullets, tier                                           |
| `research/publications.json` | Publications                          | Title + URL links                                                                                                            |
| `research/conferences.json`  | Conferences                           | Title + URL links                                                                                                            |
| `research/speakers.json`     | Speaking engagements                  | Title + URL links                                                                                                            |
| `recognition/education.json` | Education                             | Degree records (`intro`, `records[]` with `id`, `field`, `achievementDetail`, `summary`)                                     |
| `recognition/awards.json`    | Awards                                | Label + detail rows                                                                                                          |
| `recognition/kaggle.json`    | Kaggle (Recognition view)             | Global rank + 9 competition case-study cards (rank-ordered)                                                                  |

Provenance and résumé mapping: [Content map](./content-map.md) · [content/README.md](../content/README.md).

Ideal field set + format rules for Experience roles:
[Case study & experience info standard](./case-study-experience-info-standard.md).

## Common tasks

### Change the headline or tagline

Edit `content/site.json`:

```json
{
  "title": "Technical AI Leader",
  "tagline": "Your one-line positioning statement."
}
```

Also update `person/profile.json` → `title` if the hero should match.

### Reorder, move, or hide a section

Edit `content/site.json`:

- **Reorder on `/`** — change the order of ids in `pages[id=home].sections` (full DOM order).
- **Change which nav view shows a section** — edit that page's `viewSections` array (each section
  id should appear in exactly one view).
- **Show/hide** — toggle `sections[id].visible`.

Do **not** reorder sections in `src/pages/index.astro` — it reads the home section list from
`site.json` via `SectionRenderer`.

### Update SEO meta

Edit `content/site.json` → `seo`:

```json
{
  "seo": {
    "title": "Balaji Selvaraj — Technical AI Leader",
    "description": "…",
    "keywords": ["…"],
    "ogImage": "/assets/og/og-image.png",
    "twitterCard": "summary_large_image"
  }
}
```

OG image path is relative to site root. Implementation: [SEO](./seo.md).

### Add an experience bullet

Edit `content/work/experience.json` → find the role → project → `bullets` array:

```json
{
  "text": "Your bullet text.",
  "tier": "primary"
}
```

Use `"tier": "secondary"` for supporting bullets (rendered with muted styling).

Project narratives live inside each role's `projects[]` array in `work/experience.json` — see
[Case study & experience info standard](./case-study-experience-info-standard.md).

### Update contact links

Edit `content/person/profile.json` → `contact` array. Allowed public types: `email`, `linkedin`,
`github`, `kaggle`, `location`.

```json
{
  "type": "email",
  "label": "balaji.selvaraj.ai@outlook.com",
  "value": "balaji.selvaraj.ai@outlook.com",
  "href": "mailto:balaji.selvaraj.ai@outlook.com",
  "icon": "email"
}
```

**Never add a phone number** — public-site privacy rule.

### Link an organization

1. Add or verify the slug in `content/entities.json`:

```json
{
  "broad-institute": {
    "name": "Broad Institute",
    "url": "https://www.broadinstitute.org"
  }
}
```

2. Reference the slug from content JSON via optional `entity` (collaborations may omit it when `logo` matches the registry slug):

```json
{ "organization": "HCL Technology, India", "entity": "hcl" }
```

3. Run `npm run build` — URLs are validated once in `entities.json`; components render links via `EntityLink`.

## Schema rules

Schemas live in `src/schemas.ts`. Key constraints:

| Schema                 | Notable rules                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `siteSchema`           | internal `pages[]` entries require `seo` and `sections`; external entries require `external: true`                       |
| `profileSchema`        | hero/leadership/contact fields; `contactIntro`, `contactPage`; `contact[].href` nullable for location |
| `collaborationsSchema` | `items[].name` required; optional `items[].logo` and `items[].entity` slugs                           |
| `entitiesSchema`       | Record of slug → `{ name, url }`; all `url` values must be valid                                      |
| `experienceSchema`     | `tier` must be `"primary"` or `"secondary"`; `period.end` nullable; optional `roles[].entity`           |
| `visionBoardSchema`    | hubs, programs, orgCards with accent tokens and optional logo marks                                    |
| `linkListSchema`       | Publications/conferences: `url` must be valid URL                                                                        |
| `kaggleSchema`         | `profile` URL required; `items[]` validated via `kaggleCompetitionSchema`                                                |

Adding a new field:

1. Extend the Zod schema in `src/schemas.ts`
2. Add the field to the JSON file
3. Update the section component to render it
4. Run `npm run build`

## Re-deriving from the résumé

When the upstream résumé changes (`resume_builder/.../resume_healthcare.json`):

1. Re-derive affected JSON files under `content/` (do not edit resume and portfolio independently).
2. Follow the mapping in [Content map](./content-map.md).
3. Re-run privacy greps — no phone, no references:

```bash
grep -ri phone content/
grep -ri reference content/
```

Both should return nothing.

## Validation errors

Example build failure:

```
Invalid content in profile.json:
  • contact.2.href: Invalid url
```

Fix the JSON field at that path and rebuild. See [Troubleshooting](./troubleshooting.md).

## Related docs

- [Assets](./assets.md) — résumé PDF (asset-only), images (not JSON)
- [Specification](./specification.md) — per-section rendering contracts
- [Architecture](./architecture.md) — how content flows to components
