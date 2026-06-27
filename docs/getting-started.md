# Getting Started

Local development guide for the portfolio site.

## Prerequisites

- **Node.js** ≥ 18 (CI uses Node 20)
- **npm** (ships with Node)
- Git

## Clone and install

```bash
git clone https://github.com/balajiselvaraj1601/balajiselvaraj1601.github.io.git
cd balajiselvaraj1601.github.io   # or portfolio_site staging mirror

npm ci    # use npm ci, not npm install — respects package-lock.json pins
```

> **Important:** `@astrojs/sitemap` is pinned to exactly `3.6.0`. Do not run
> `npm update @astrojs/sitemap` — versions ≥ 3.6.1 require Astro 5 and will crash
> the build. See [Troubleshooting](./troubleshooting.md#sitemap-build-crash).

## Development workflow

### Start the dev server

```bash
npm run dev
```

Opens at http://localhost:4321 with hot module replacement. Edit `content/*.json` or
`src/components/**` and the browser refreshes automatically.

### Production build

```bash
npm run build
```

Output goes to `dist/`. Content validation runs during the build — invalid JSON shape
throws a Zod error with the field path.

### Preview the built site

```bash
npm run preview
```

Serves `dist/` at http://localhost:4321. Use this to verify assets, links, and theme
behavior exactly as they will appear on GitHub Pages.

## What to edit

| Goal | Edit | Do not edit |
|------|------|-------------|
| Change site copy | `content/*.json` | Section components (for copy) |
| Change section order / visibility | `content/site.json` | `src/pages/index.astro` order |
| Change styling | `src/styles/global.css`, component `<style>` blocks | — |
| Change SEO defaults | `content/site.json` → `seo` | Hardcode meta in components |
| Replace résumé / OG image | `public/assets/**` | — |
| Change live URL | `astro.config.mjs` + `public/robots.txt` | — |

See [Content editing](./content-editing.md) and [Assets](./assets.md) for details.

## Project layout (abbreviated)

```
portfolio_site/
├── content/           Site copy (SSOT) — JSON validated by Zod
├── public/            Static files copied verbatim to dist/
├── src/
│   ├── components/    Reusable UI + sections/
│   ├── layouts/       Layout.astro
│   ├── lib/content.ts Loader + validation
│   ├── pages/         index.astro, 404.astro
│   ├── schemas.ts     Zod schemas for content/
│   └── styles/        global.css
├── astro.config.mjs   SITE_URL, base path, integrations
└── docs/              This documentation
```

Full architecture: [Architecture](./architecture.md).

## Verify before committing

```bash
npm run build && npm run preview
```

Spot-check:

- All sections render in nav order
- Résumé PDF downloads from header
- Light/dark toggle persists on reload
- Mobile menu opens, traps focus, closes on Esc
- No phone number anywhere on the page

## Next steps

- **Change content:** [Content editing](./content-editing.md)
- **Publish the site:** [Go-live checklist](./go-live-checklist.md)
- **Something broke:** [Troubleshooting](./troubleshooting.md)
