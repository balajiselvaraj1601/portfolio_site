# Content Editing

How to change what the site says without touching components.

## Golden rule

**All copy lives in `content/*.json`.** Components render data; they do not embed text.
If you need a new field, update `src/schemas.ts` first, then the JSON, then the component.

## Workflow

1. Edit the relevant `content/*.json` file.
2. Run `npm run build` — Zod validation runs automatically.
3. Fix any schema errors (the build output shows the exact field path).
4. Preview with `npm run preview` and spot-check the section.

## File reference

| File | Sections affected | Typical edits |
|------|-------------------|---------------|
| `site.json` | Global meta, nav, SEO, résumé link | Title, tagline, nav labels, hide a section |
| `profile.json` | Hero, About, Contact | Summary lines, email, LinkedIn, Kaggle |
| `strategic-impact.json` | Strategic Impact | Bullet items |
| `experience.json` | Experience timeline | Roles, projects, bullets, tier |
| `projects.json` | Project cards | Summaries, highlights, tags (derived view) |
| `generative-ai.json` | Generative AI | Bullet items |
| `skills.json` | Skills | Categories and skill chips |
| `mentorship.json` | Mentorship | Bullet items |
| `education.json` | Education | Degree records |
| `awards.json` | Awards | Label + detail rows |
| `publications.json` | Publications | Title + URL links |
| `conferences.json` | Conferences | Title + URL links |
| `kaggle.json` | Kaggle | Rank line + competition links |

Provenance and résumé mapping: [Content map](./content-map.md) · [content/README.md](../content/README.md).

## Common tasks

### Change the headline or tagline

Edit `content/site.json`:

```json
{
  "title": "Technical AI Leader",
  "tagline": "Your one-line positioning statement."
}
```

Also update `profile.json` → `title` if the hero should match.

### Reorder or hide a section

Edit `content/site.json` → `nav` array (order) and `sections[id].visible` (show/hide).

Do **not** reorder sections in `src/pages/index.astro` — it reads `visibleNav` from `site.json`.

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

Edit `content/experience.json` → find the role → project → `bullets` array:

```json
{
  "text": "Your bullet text.",
  "tier": "primary"
}
```

Use `"tier": "secondary"` for supporting bullets (rendered with muted styling).

### Add a project card

Edit `content/projects.json` → `projects` array. Required fields:

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

Keep summaries consistent with `experience.json` — `projects.json` is a derived card view.

### Update contact links

Edit `content/profile.json` → `contact` array. Allowed public types: `email`, `linkedin`,
`kaggle`, `location`.

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

## Schema rules

Schemas live in `src/schemas.ts`. Key constraints:

| Schema | Notable rules |
|--------|---------------|
| `siteSchema` | `nav[].id` must match `sections` keys; `resume.path` is a site-root path |
| `profileSchema` | `summary` is string array; `contact[].href` nullable for location |
| `experienceSchema` | `tier` must be `"primary"` or `"secondary"`; `period.end` nullable |
| `projectsSchema` | `id` must be unique slug; `highlights` and `tags` are string arrays |
| `linkListSchema` | Publications/conferences: `url` must be valid URL |
| `kaggleSchema` | `profile` URL required; `items[].url` must be valid |

Adding a new field:

1. Extend the Zod schema in `src/schemas.ts`
2. Add the field to the JSON file
3. Update the section component to render it
4. Run `npm run build`

## Re-deriving from the résumé

When the upstream résumé changes (`resume_builder/.../resume_healthcare.json`):

1. Re-derive affected `content/*.json` files (do not edit resume and portfolio independently).
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
