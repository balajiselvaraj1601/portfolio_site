# Static Assets

Guide to files in `public/` that ship unchanged to the site root.

## Directory layout

```
public/
├── .nojekyll                          Required for GitHub Pages (_astro/ bypass)
├── favicon.svg                        Primary vector favicon
├── favicon.ico                        Legacy favicon (referenced in BaseHead)
├── site.webmanifest                   PWA manifest
├── robots.txt                         Crawler rules + sitemap URL
└── assets/
    ├── favicon-32.png                 Optional 32×32 PNG
    ├── icons/
    │   ├── icon-192.png               Manifest icon 192×192
    │   ├── icon-512.png               Manifest icon 512×512
    │   └── apple-touch-icon.png       iOS home screen 180×180
    ├── og/
    │   └── og-image.png               Social preview (OpenGraph / Twitter)
    ├── resume/
    │   └── balaji-selvaraj-resume.pdf Public résumé download
    └── images/                        Optional headshot / section images
```

## Required assets

| Asset | Path | Referenced by |
|-------|------|---------------|
| Résumé PDF | `public/assets/resume/balaji-selvaraj-resume.pdf` | `content/site.json` → `resume.path` |
| OG image | `public/assets/og/og-image.png` | `content/site.json` → `seo.ogImage` |
| Favicon SVG | `public/favicon.svg` | `BaseHead.astro`, manifest |
| Favicon ICO | `public/favicon.ico` | `BaseHead.astro` |
| PNG icons | `public/assets/icons/*.png` | `site.webmanifest`, `BaseHead.astro` |
| `.nojekyll` | `public/.nojekyll` | GitHub Pages (empty file is fine) |

After replacing any asset, run `npm run build && npm run preview` and verify the URL loads
(e.g. http://localhost:4321/assets/resume/balaji-selvaraj-resume.pdf).

## Résumé PDF

**Current path:** `/assets/resume/balaji-selvaraj-resume.pdf`

To update:

1. Export a new PDF from the résumé builder (no phone number on the public version).
2. Replace `public/assets/resume/balaji-selvaraj-resume.pdf`.
3. If the filename changes, update `content/site.json`:

```json
{
  "resume": {
    "label": "Download résumé (PDF)",
    "path": "/assets/resume/your-new-filename.pdf"
  }
}
```

The header résumé button and contact section both use `site.resume.path`.

## OG / social preview image

**Current path:** `/assets/og/og-image.png`

| Spec | Target |
|------|--------|
| Dimensions | 1200 × 630 px (Twitter/LinkedIn large card) |
| Format | PNG or JPG |
| Max size | < 1 MB |
| Content | Name, title, accent background — text-led, minimal |

Referenced as absolute URL in OG/Twitter tags via `Astro.site` + `site.seo.ogImage`.

Test after deploy:

- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) (or share preview in X)

## Favicon set

Brand mark: blue rounded square with **BS** initials (`public/favicon.svg`).

When updating the brand:

1. Edit `public/favicon.svg`
2. Regenerate derived formats (ICO, PNG sizes) to match
3. Update `public/site.webmanifest` if icon paths change

Manifest icons:

```json
{
  "icons": [
    { "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml" },
    { "src": "/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## Optional images

`public/assets/images/` is reserved for a professional headshot or section imagery.
Currently empty (`.gitkeep` only). To add a headshot:

1. Place the file in `public/assets/images/` (e.g. `headshot.webp`)
2. Reference it from the relevant section component
3. Always include descriptive `alt` text

Keep files optimized — prefer WebP, reasonable dimensions, lazy-load below the fold.

## robots.txt

Static file at `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://balajiselvaraj1601.github.io/sitemap-index.xml
```

**Must stay in sync** with `SITE_URL` in `astro.config.mjs`. Update both together if the
domain changes.

## What not to commit

- Generated `dist/` (git-ignored — CI rebuilds)
- Large unoptimized originals — compress before adding to `public/`
- Private documents, references, or phone-containing résumé variants

## Related docs

- [SEO](./seo.md) — how assets appear in meta tags
- [Deployment](./deployment.md) — artifact checklist
- [Content editing](./content-editing.md) — JSON paths for résumé and OG references
