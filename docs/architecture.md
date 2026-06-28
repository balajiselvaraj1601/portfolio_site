# Architecture

Technical overview of the Astro 4 portfolio site.

## High-level data flow

```
content/**/*.json
    │
    ▼
src/lib/content.ts  ── validates against ──►  src/schemas.ts (Zod)
    │
    ▼
src/components/sections/*.astro  +  shared components
    │
    ▼
src/components/SectionRenderer.astro  +  src/pages/*.astro  (renders site.json.pages)
    │
    ▼
src/layouts/Layout.astro  (chrome: head, header, footer)
    │
    ▼
dist/  (static HTML/CSS/JS + public/ assets)
    │
    ▼
GitHub Pages  (via .github/workflows/deploy.yml)
```

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Astro 4.16 | Static output only; minimal client JS |
| Validation | Zod 3 | Build-time content validation |
| Styling | Hand-rolled CSS | Design tokens in `global.css`; no CSS framework |
| Sitemap | `@astrojs/sitemap` 3.6.0 | **Pinned** — do not upgrade on Astro 4 |
| Hosting | GitHub Pages | User site at domain root |
| CI | GitHub Actions | Build on push; deploy gated to user-site repo |

## Key files

| File | Role |
|------|------|
| `astro.config.mjs` | `SITE_URL`, `base: '/'`, sitemap integration |
| `src/schemas.ts` | Content shape contracts (SSOT for types) |
| `src/lib/content.ts` | Imports JSON, validates, exports typed data |
| `content/site.json` | Page/route definitions (`pages`), section visibility, SEO, résumé path |
| `src/pages/*.astro` | One route per page; each looks up its `pages` entry and renders via `SectionRenderer` |
| `src/components/SectionRenderer.astro` | Section id → component map (SSOT); renders an ordered list of section ids |
| `src/components/BaseHead.astro` | Meta, OG, Twitter, JSON-LD |
| `src/components/ThemeScript.astro` | Inline theme bootstrap (no flash) |
| `src/components/Header.astro` | Route nav (server-side active state), mobile menu, theme toggle, résumé CTA |
| `public/.nojekyll` | Prevents Jekyll from stripping `_astro/` on Pages |

## Content layer

All site copy lives in JSON under `content/`. Components import from `@lib/content` — they never
embed strings for section content.

Validation is **fail-fast**: `load()` in `content.ts` calls `schema.safeParse()` and throws
with a field path on mismatch. This catches drift at `npm run build`, not in production.

TypeScript types are derived via `z.infer<typeof schema>` — no parallel hand-written interfaces.

## Rendering model

### Multi-page layout

The site is a set of routes (`/`, `/experience`, `/projects`, `/research`, `/recognition`, `/vision`, `/contact`), one
per entry in `site.json.pages`. Each page groups several sections; section order within a page
comes from that page's `sections` array, filtered by `sections[id].visible`.

`SectionRenderer.astro` owns the section id → component map (SSOT); each route file looks up its
page and renders its sections:

```typescript
// SectionRenderer.astro
const SECTIONS = { hero: Hero, about: About, /* … */ };
sections.map((id) => <SECTIONS[id] />)

// e.g. src/pages/experience.astro
const page = pages.find((p) => p.id === 'experience')!;
<SectionRenderer sections={page.sections} />
```

Adding a section requires: JSON file under the relevant `content/` domain folder, Zod schema, section component, entry in the
`SectionRenderer` `SECTIONS` map, a `sections[id]` entry in `site.json`, and listing the id in
the relevant page's `sections` array. Adding a whole page requires a new `pages` entry plus a
matching route file under `src/pages/`.

### Client JavaScript

JS is limited to progressive enhancement in `Header.astro`:

- Theme toggle + `localStorage` persistence
- Mobile menu (focus trap, Esc to close)
- Active route state in the header and section dot navigation where configured
- Entrance reveal animations (skipped when `prefers-reduced-motion`)

Core content is fully readable without JavaScript.

## Static assets

Files in `public/` copy verbatim to `dist/` root. Referenced paths (e.g. `/assets/og/og-image.png`)
must match files on disk. See [Assets](./assets.md).

## Build output

```
dist/
├── index.html
├── 404.html
├── _astro/           Hashed CSS/JS bundles
├── assets/           From public/assets/
├── favicon.svg
├── favicon.ico
├── robots.txt
├── site.webmanifest
├── sitemap-index.xml
├── sitemap-0.xml
└── .nojekyll
```

`dist/` is git-ignored. CI rebuilds on every deploy.

## URL configuration

Single source of truth: `SITE_URL` in `astro.config.mjs`.

Derived from it:

- `Astro.site` → canonical URLs, OG image absolute URLs
- `@astrojs/sitemap` → sitemap entries
- Must stay in sync manually: `public/robots.txt` → `Sitemap:` line

For a GitHub Pages **user site**, `base` is `'/'`. A project repo would need `base: '/repo-name/'`.

## CI/CD

`.github/workflows/deploy.yml`:

1. **build** job — runs on every push to `main` in any repo
2. **deploy** job — runs only when `github.repository == 'balajiselvaraj1601/balajiselvaraj1601.github.io'`

The staging mirror `balajiselvaraj1601/portfolio_site` validates builds without publishing.

Details: [Deployment](./deployment.md).

## Extension points

| Feature | How to add |
|---------|------------|
| New section | JSON + schema + component + site.json nav entry |
| Project detail pages | New route `src/pages/projects/[id].astro` + link from Projects cards |
| Custom domain | `public/CNAME` + DNS + update `SITE_URL` |
| Contact form | Third-party endpoint (Formspree/Web3Forms) — see requirements C1 |
| Analytics | Plausible/GoatCounter script in Layout — see requirements C3 |

## Related docs

- [Specification](./specification.md) — section contracts and IA
- [Content editing](./content-editing.md) — how to change JSON safely
- [Requirements](./requirements.md) — feature scope
