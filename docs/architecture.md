# Architecture

Technical overview of the Astro 4 portfolio site.

## High-level data flow

```text
content/**/*.json
    │
    ▼
src/lib/content.ts  ── validates against ──►  src/schemas/ (Zod)
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

| Layer      | Choice                   | Notes                                           |
| ---------- | ------------------------ | ----------------------------------------------- |
| Framework  | Astro 4.16               | Static output only; minimal client JS           |
| Validation | Zod 3                    | Build-time content validation                   |
| Styling    | Hand-rolled CSS          | Design tokens in `global.css`; no CSS framework |
| Sitemap    | `@astrojs/sitemap` 3.6.0 | **Pinned** — do not upgrade on Astro 4          |
| Hosting    | GitHub Pages             | User site at domain root                        |
| CI         | GitHub Actions           | Build on push; deploy gated to user-site repo   |

## Repo layout

```text
portfolio_site/
├── assets/source/logos/     Logo pipeline input (+ _originals/ backups)
├── content/                 Zod-validated JSON (SSOT for public copy)
│   └── drafts/competitions/ Unwired competition markdown (future routes)
├── docs/
│   ├── audits/              file-migration.csv, logo-manifest.csv
│   ├── reference/           Design prototype + scratch screenshots
│   └── page-briefs/         Per-route content specs
├── public/assets/           Published static URLs (do not rename paths)
├── scripts/                 Node/Python maintenance tooling
└── src/
    ├── components/
    │   ├── SectionRenderer.astro
    │   ├── chrome/          Header, Footer, BaseHead, …
    │   ├── ui/              Chip, Icon, Section, …
    │   ├── cards/           CompetitionCard, HubCircle, …
    │   └── sections/        Page section components
    ├── layouts/  lib/  pages/  scripts/  styles/
    └── schemas.ts
```

## Key files

| File                                      | Role                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `astro.config.mjs`                        | `SITE_URL`, `base: '/'`, sitemap integration                                  |
| `src/schemas/`                            | Content shape contracts (SSOT for types)                                      |
| `src/lib/content.ts`                      | Imports JSON, validates, exports typed data                                   |
| `content/site.json`                       | Page/route definitions (`pages`), section visibility, SEO, résumé path        |
| `src/pages/index.astro`                   | Home route — renders all sections via `SectionRenderer` with scroll-spy views |
| `src/pages/{view}.astro` (stubs)          | Legacy paths redirect to `/#anchor` via `ViewRedirect` (no section rendering) |
| `src/components/SectionRenderer.astro`    | Section id → component map (SSOT); renders an ordered list of section ids     |
| `src/components/chrome/BaseHead.astro`    | Meta, OG, Twitter, JSON-LD                                                    |
| `src/components/chrome/ThemeScript.astro` | Inline theme bootstrap (no flash)                                             |
| `src/components/chrome/Header.astro`      | Route nav (server-side active state), mobile menu, theme toggle, résumé CTA   |
| `public/.nojekyll`                        | Prevents Jekyll from stripping `_astro/` on Pages                             |

## Content layer

All site copy lives in JSON under `content/`. Components import from `@lib/content` — they never
embed strings for section content.

Validation is **fail-fast**: `load()` in `content.ts` calls `schema.safeParse()` and throws
with a field path on mismatch. This catches drift at `npm run build`, not in production.

TypeScript types are derived via `z.infer<typeof schema>` — no parallel hand-written interfaces.

## Rendering model

### Single-page scroll with nav anchors

All sections render once on `/` in the order defined by `site.json → pages[id=home].sections`
and are **always visible** — the home page is a continuous scroll through every section, grouped
contiguously in nav-button order. Header nav does not load separate pages and does not hide
anything; clicking a button **scrolls** to that view's first section (hash URLs `/#research`,
`/#experience`, …) and a scroll-spy keeps the active button in sync as you scroll.

Legacy route files under `src/pages/` (`experience.astro`, `research.astro`, …) are thin
redirect stubs to the matching hash on `/`.

```typescript
// index.astro
<SectionRenderer sections={homeSections} navViews={true} />

// section-views.ts (client)
initSectionViews({ views, defaultView }); // nav buttons scroll to a view's first section; spy tracks scroll
```

The `viewSections` arrays still group sections under exactly one nav button (validated at build
time) — they now drive the scroll target and active-state mapping rather than visibility.

Adding a section requires: JSON under `content/`, Zod schema, section component, entry in
`SectionRenderer`, `sections[id]` in `site.json`, listing in `home.sections`, and assignment
to at least one `viewSections` array. `content.ts` validates view wiring at build time.

### Client JavaScript

JS provides progressive enhancement on `/`:

- Nav scroll + scroll-spy (`section-views.ts`) — buttons scroll to a section; active state tracks
  scroll position. Without JS, all sections remain visible and hash anchors still jump natively.
- Theme toggle + `localStorage` persistence
- Mobile menu (focus trap, Esc to close)
- Active nav state in header; dot nav shows seven page-level dots (Hero + six nav views) and highlights the active view via scroll-spy (`sectionToDotNav` in `content.ts`)
- Entrance reveal animations (skipped when `prefers-reduced-motion`)

Core content is fully readable without JavaScript.

## Static assets

Files in `public/` copy verbatim to `dist/` root. Referenced paths (e.g. `/assets/og/og-image.png`)
must match files on disk. See [Assets](./assets.md).

## Build output

```text
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

| Feature              | How to add                                                           |
| -------------------- | -------------------------------------------------------------------- |
| New section          | JSON + schema + component + site.json nav entry                      |
| Project detail pages | New route `src/pages/projects/[id].astro` + link from Projects cards |
| Custom domain        | `public/CNAME` + DNS + update `SITE_URL`                             |
| Contact form         | Third-party endpoint (Formspree/Web3Forms) — see requirements C1     |
| Analytics            | Plausible/GoatCounter script in Layout — see requirements C3         |

## Related docs

- [Specification](./specification.md) — section contracts and IA
- [Content editing](./content-editing.md) — how to change JSON safely
- [Environment languages & skills](./environment-languages-skills.md) — languages, automation, skill tiers
- [Requirements](./requirements.md) — feature scope
