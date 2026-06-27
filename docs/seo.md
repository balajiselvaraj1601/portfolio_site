# SEO Plan

SEO contract for the portfolio site. Defaults live in `content/site.json → seo`; the renderer
injects them via `src/components/BaseHead.astro`.

**Live site URL:** https://balajiselvaraj1601.github.io (configured in `astro.config.mjs` → `SITE_URL`).

## Implementation

| Item | Status | Where |
|------|--------|-------|
| `<title>` + description | ✅ | `content/site.json` → `BaseHead.astro` |
| Canonical URL | ✅ | Derived from `Astro.site` + page path |
| OpenGraph tags | ✅ | `BaseHead.astro` |
| Twitter card | ✅ | `summary_large_image` |
| JSON-LD `Person` | ✅ | Built from `profile.json` + `site.seo.keywords` |
| Sitemap | ✅ | `@astrojs/sitemap` → `dist/sitemap-index.xml` |
| robots.txt | ✅ | `public/robots.txt` |
| OG image | ✅ | `/assets/og/og-image.png` (1200×630) |
| `lang="en"` | ✅ | `Layout.astro` |

## Meta (per page)

- `<title>` — `site.json.seo.title` (e.g. "Balaji Selvaraj — Technical AI Leader").
- `<meta name="description">` — `site.json.seo.description`.
- `<meta name="keywords">` — from `site.json.seo.keywords`.
- `<link rel="canonical" href="https://balajiselvaraj1601.github.io/">`.
- `<html lang="en">`.
- `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- `<meta name="theme-color">` — light/dark via `media` variants.

## OpenGraph + Twitter

Rendered in `BaseHead.astro`:

```html
<meta property="og:type" content="website">
<meta property="og:title" content="Balaji Selvaraj — Technical AI Leader">
<meta property="og:description" content="{{seo.description}}">
<meta property="og:url" content="https://balajiselvaraj1601.github.io/">
<meta property="og:image" content="https://balajiselvaraj1601.github.io/assets/og/og-image.png">
<meta property="og:image:alt" content="Balaji Selvaraj — Technical AI Leader">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Balaji Selvaraj — Technical AI Leader">
<meta name="twitter:description" content="{{seo.description}}">
<meta name="twitter:image" content="https://balajiselvaraj1601.github.io/assets/og/og-image.png">
```

To change copy: edit `content/site.json` → `seo`. To change the image: replace
`public/assets/og/og-image.png` (see [Assets](./assets.md)).

## JSON-LD — `Person`

Populated at build time from `profile.json` and `site.seo.keywords`:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Balaji Selvaraj",
  "jobTitle": "Technical AI Leader",
  "email": "mailto:balaji.selvaraj.ai@outlook.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Gothenburg",
    "addressCountry": "SE"
  },
  "url": "https://balajiselvaraj1601.github.io/",
  "sameAs": [
    "https://www.linkedin.com/in/balaji-selvaraj-a2987572/",
    "https://www.kaggle.com/dhakshiin1601"
  ],
  "knowsAbout": ["Technical AI Leader", "Applied AI", "…"],
  "worksFor": { "@type": "Organization", "name": "AstraZeneca" }
}
```

Keep in sync with `content/profile.json`. If project detail routes are added later, consider
`CreativeWork` JSON-LD per project.

Validate: [Google Rich Results Test](https://search.google.com/test/rich-results).

## Sitemap

Generated automatically by `@astrojs/sitemap` (pinned 3.6.0). Output:

- `dist/sitemap-index.xml`
- `dist/sitemap-0.xml`

Do not hand-maintain sitemap XML. Adding routes (e.g. `/projects/:id`) will auto-include them
once pages exist under `src/pages/`.

## robots.txt

Static file at `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://balajiselvaraj1601.github.io/sitemap-index.xml
```

**Keep in sync** with `SITE_URL` in `astro.config.mjs` if the domain ever changes.

## Changing the site URL

If moving to a custom domain (C4):

1. Update `SITE_URL` in `astro.config.mjs`
2. Update `Sitemap:` line in `public/robots.txt`
3. Add `public/CNAME` with the domain
4. Rebuild and redeploy

## Checklist

- [x] Unique, descriptive `<title>` and description.
- [x] One `<h1>` per page; logical heading order.
- [x] OG/Twitter image at 1200×630, < 1 MB.
- [x] Canonical URL set.
- [x] `sitemap-index.xml` + `robots.txt` at site root.
- [ ] JSON-LD validated post-deploy (Rich Results Test).
- [x] OG image has `og:image:alt`.
- [x] Descriptive link text on publications/conferences (no "click here").

## Related docs

- [Assets](./assets.md) — OG image specs
- [Architecture](./architecture.md) — URL SSOT
- [Content editing](./content-editing.md) — changing SEO fields in JSON
