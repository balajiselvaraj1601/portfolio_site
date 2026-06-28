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

| File | Sections affected | Typical edits |
|------|-------------------|---------------|
| `site.json` | Global meta, nav, pages, SEO, résumé link | Title, tagline, nav labels, page sections, hide a section |
| `person/profile.json` | Hero, merged About/Leadership, Technical Vision, Contact | Headline, metrics, CTAs, about cards, leadership philosophy, vision, contact interests, `contactPage` copy |
| `person/affiliations.json` | Affiliations strip | Organization names; optional `logo` slug → `public/assets/logos/{slug}.svg`; optional `entity` slug → URL in `entities.json` |
| `entities.json` | Entity links (global registry) | Slug → `{ name, url }` for organizations referenced across sections |
| `work/strategic-impact.json` | Strategic Impact | `metrics[]`, `highlights[]`; optional `journey[]`, `programs[]`, `leadershipCards[]` for rich layout |
| `work/vision-board.json` | Vision view (`/#vision`) | Infographic hubs, program cards, org impact cards |
| `work/experience.json` | Experience intro, tabbed role detail | Roles, optional `mission`, `snapshot[]`, bullets, tier |
| `work/projects.json` | Project cards, Featured projects, Projects intro | Summaries, case-study fields, `featured`, `snapshot[]`, tags |
| `work/skills.json` | Skills (About view) | Categories and skill chips |
| `work/mentorship.json` | Mentorship | Bullet items |
| `research/publications.json` | Publications, Featured publications | Title + URL links |
| `research/conferences.json` | Conferences | Title + URL links |
| `research/speakers.json` | Speaking engagements | Title + URL links |
| `recognition/education.json` | Education | Degree records |
| `recognition/awards.json` | Awards | Label + detail rows |
| `recognition/kaggle.json` | Kaggle (Recognition view) | Rank line + competition links |

Provenance and résumé mapping: [Content map](./content-map.md) · [content/README.md](../content/README.md).

### Draft / shelved content

Content under `content/drafts/` is **not wired to the live site**. Currently shelved:

| File | Section | Notes |
|------|---------|-------|
| `drafts/research/generative-ai.json` | Generative AI (Research view) | Bullet items; registry entry in `site.json` with `visible: false` |

**Re-enable Generative AI:**

1. Move `content/drafts/research/generative-ai.json` → `content/research/generative-ai.json`
2. Restore import/export in `src/lib/content.ts` (`generativeAi` + `sectionData['generative-ai']`)
3. Change `GenerativeAI.astro` to import `generativeAi` from `@lib/content` (not the draft path)
4. Re-add `generative-ai` to `home.sections` and research `sections` / `viewSections` in `site.json`
5. Set `sections["generative-ai"].visible` to `true` and update `source` to `research/generative-ai.json`

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

### Add a project card

Edit `content/work/projects.json` → `projects` array. Required fields:

```json
{
  "id": "unique-slug",
  "name": "Project Name",
  "org": "Organization",
  "period": "2023–Present",
  "role": "AI Lead",
  "summary": "One-line summary.",
  "highlights": ["Highlight 1", "Highlight 2"],
  "tags": ["Tag1", "Tag2"],
  "domain": "Domain label"
}
```

Keep summaries consistent with `work/experience.json` — `work/projects.json` is a derived card view.

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

2. Reference the slug from content JSON via optional `entity` (affiliations may omit it when `logo` matches the registry slug):

```json
{ "organization": "HCL Technology, India", "entity": "hcl" }
```

3. Run `npm run build` — URLs are validated once in `entities.json`; components render links via `EntityLink`.

## Schema rules

Schemas live in `src/schemas.ts`. Key constraints:

| Schema | Notable rules |
|--------|---------------|
| `siteSchema` | internal `pages[]` entries require `seo` and `sections`; external entries require `external: true`; `resume.path` is a site-root path |
| `profileSchema` | hero/about/contact fields drive the public profile; optional `vision`, `contactPage`, `techStack`; `contact[].href` nullable for location |
| `impactSchema` | `metrics[]` + `highlights[]` required; optional `journey[]`, `programs[]`, `leadershipCards[]` |
| `affiliationsSchema` | `items[].name` required; optional `items[].logo` and `items[].entity` slugs |
| `entitiesSchema` | Record of slug → `{ name, url }`; all `url` values must be valid |
| `experienceSchema` | `tier` must be `"primary"` or `"secondary"`; `period.end` nullable; optional `roles[].entity` |
| `projectsSchema` | `id` must be unique slug; optional `projects[].entity` |
| `linkListSchema` | Publications/conferences: `url` must be valid URL |
| `kaggleSchema` | `profile` URL required; `items[].url` must be valid |

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

- [Assets](./assets.md) — résumé PDF, images (not JSON)
- [Specification](./specification.md) — per-section rendering contracts
- [Architecture](./architecture.md) — how content flows to components
