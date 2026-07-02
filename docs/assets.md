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

| Asset       | Path                                              | Referenced by                        |
| ----------- | ------------------------------------------------- | ------------------------------------ |
| Résumé PDF  | `public/assets/resume/balaji-selvaraj-resume.pdf` | **Asset only** — not in nav/header   |
| OG image    | `public/assets/og/og-image.png`                   | `content/site.json` -> `seo.ogImage` |
| Favicon SVG | `public/favicon.svg`                              | `BaseHead.astro`, manifest           |
| Favicon ICO | `public/favicon.ico`                              | `BaseHead.astro`                     |
| PNG icons   | `public/assets/icons/*.png`                       | `site.webmanifest`, `BaseHead.astro` |
| `.nojekyll` | `public/.nojekyll`                                | GitHub Pages (empty file is fine)    |

After replacing any asset, run `npm run build && npm run preview` and verify the URL loads
(e.g. http://localhost:4321/assets/resume/balaji-selvaraj-resume.pdf).

## Résumé PDF

**Current path:** `/assets/resume/balaji-selvaraj-resume.pdf`

The PDF is a **static asset only** — it ships from `public/assets/resume/` and is
direct-linkable (e.g. for email signatures or LinkedIn), but it is **not** linked from
header nav, contact CTAs, or `content/site.json`. To wire it into the site UI later,
add a `resume` block to `site.json` and update the header/contact components.

To update the file:

1. Export a new PDF from the résumé builder (no phone number on the public version).
2. Replace `public/assets/resume/balaji-selvaraj-resume.pdf` (or add a new filename and
   update any external links that point at the old path).
3. Verify the URL loads after build: `npm run preview` →
   `http://localhost:4321/assets/resume/balaji-selvaraj-resume.pdf`.

## OG / social preview image

**Current path:** `/assets/og/og-image.png`

| Spec       | Target                                             |
| ---------- | -------------------------------------------------- |
| Dimensions | 1200 × 630 px (Twitter/LinkedIn large card)        |
| Format     | PNG or JPG                                         |
| Max size   | < 1 MB                                             |
| Content    | Name, title, accent background — text-led, minimal |

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
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Optional images

`public/assets/images/` holds optimized headshots and section imagery served by the site
(e.g. `balaji.png`, referenced from `content/person/profile.json` -> `photo`).

To add or replace a headshot:

1. Compress the source image outside the repo or in a temporary working folder.
2. Place only the published copy in `public/assets/images/`.
3. Set `content/person/profile.json` -> `photo` to the public path (e.g. `/assets/images/balaji.png`).
4. Always include descriptive `alt` text in the content/component.

Keep published files optimized — prefer WebP, reasonable dimensions, lazy-load below the fold.

## Logo palette (unwired SVGs)

`public/assets/logos/` also contains a set of pipeline-generated glyph SVGs
(`logo_achievement_award`, `logo_analytics_dashboard`, `logo_business_presentation`,
`logo_financial_growth`, `logo_global_location`, `logo_target_goal_box`,
`logo_team_growth`) that are intentionally referenced nowhere yet. They were produced by
the SVG icon toolchain (`scripts/batch-icon-generate.sh` + `scripts/svg-icon-generator.py`)
and are kept as a ready-to-wire palette for upcoming sections. Wiring happens via the
`asset` fields in the content JSON — no component changes needed. Their inventory status
is tracked as `unwired-future` in [`docs/audits/logo-manifest.csv`](./audits/logo-manifest.csv).

### Hero portrait

The home-page hero (`src/components/sections/Hero.astro`) renders a square portrait via
`<Portrait>`. The current production asset is a single optimized PNG:

| File                              | Format | Size    | Used as        |
| --------------------------------- | ------ | ------- | -------------- |
| `public/assets/images/balaji.png` | PNG    | 480×480 | Portrait image |

References from content: `content/person/profile.json` -> `portrait.src`, `portrait.alt`,
`portrait.width`, and `portrait.height`.

Example regeneration command, run from a local source image outside the repo:

```bash
node -e "
const sharp = require('sharp');
const src = '/path/to/profile-original.jpg';
(async () => {
  const m = await sharp(src).metadata();
  const side = Math.min(m.width, m.height);
  const left = Math.floor((m.width - side) / 2);
  const top  = Math.floor((m.height - side) / 2);
  await sharp(src)
    .extract({ left, top, width: side, height: side })
    .resize(480, 480)
    .png({ compressionLevel: 9 })
    .toFile('public/assets/images/balaji.png');
})();"
```

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
- Large unoptimized originals in `public/` or the repo root
- Private documents, references, or phone-containing résumé variants

## Related docs

- [SEO](./seo.md) — how assets appear in meta tags
- [Deployment](./deployment.md) — artifact checklist
- [Content editing](./content-editing.md) — JSON paths for résumé and OG references
