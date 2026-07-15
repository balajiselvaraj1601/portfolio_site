# Balaji Selvaraj - Portfolio Site

A personal portfolio for **Balaji Selvaraj** (Technical AI Leader), built from his résumé
content. It is a **static [Astro](https://astro.build) 4 site** that renders entirely from a
structured, Zod-validated content layer (`content/**/*.json`) and deploys to **GitHub Pages**
via GitHub Actions.

- **Live URL:** https://balajiselvaraj1601.github.io (GitHub Pages user site)
- **Stack:** Astro 4.16 · hand-rolled CSS design tokens (light/dark) · `@astrojs/sitemap` · Zod content validation
- **Targets:** Lighthouse 95+, WCAG 2.1 AA, full SEO (meta, OG/Twitter, JSON-LD `Person`, sitemap, robots)

## Layout

```text
portfolio_site/
├── README.md              ← you are here
├── astro.config.mjs       Astro config; SITE_URL (single source of truth) lives here
├── package.json           Astro 4 + @astrojs/sitemap (PINNED 3.6.0) + zod
├── tsconfig.json          TS strict + JSON module resolution
├── src/
│   ├── pages/             index.astro, 404.astro
│   │                       experience, research, recognition, vision, contact redirect stubs
│   ├── layouts/           Layout.astro
│   ├── components/        Header, Footer, BaseHead, shared primitives + sections/
│   ├── lib/content.ts     Loads content/**/*.json and validates against schemas.ts
│   ├── schemas.ts         Zod schemas for every content file (build-time validation)
│   └── styles/global.css  Design tokens, light/dark theme, utilities
├── content/                Single source of truth - site content (curated from résumé)
│   ├── README.md            Provenance + curation rules
│   ├── site.json            Site meta, pages/routes, section visibility, SEO defaults, theme
│   ├── person/              Profile and affiliations
│   ├── work/                experience, vision-board
│   ├── research/            Publications, conferences, speakers
│   └── recognition/         Education, awards, Kaggle
├── public/                Static assets served as-is
│   ├── assets/            favicons, icons/, og/og-image.png, resume/balaji-selvaraj-resume.pdf
│   ├── robots.txt         References the absolute Sitemap URL (keep in sync with SITE_URL)
│   ├── .nojekyll          Stops GitHub Pages running Jekyll over _astro/
│   └── site.webmanifest
├── docs/                  Full documentation - start at docs/README.md
│                          Specs: requirements, specification, architecture, content-editing,
│                          seo, accessibility, deployment, go-live-checklist, troubleshooting
└── .github/workflows/
    └── deploy.yml         npm ci - npm run build - upload dist/ - deploy-pages
```

## Principles

- **Content-driven (SSOT):** the site renders from JSON under `content/`. Don't hardcode copy in
  components - change a JSON file to change the site. Each file is validated at build time
  against `src/schemas/`; an invalid shape fails the build. Content is **derived from the
  résumé** - see `content/README.md` for provenance and re-derivation.
- **Privacy:** no phone number, no References surfaced (curated public set).
- **Static & accessible:** GitHub Pages, Lighthouse 95+, WCAG 2.1 AA.

## Develop & build

```bash
npm ci          # install pinned deps (use this, not `npm install`)
npm run dev      # local dev server with HMR
npm run build    # production build - dist/
npm run preview  # serve the built dist/ locally to verify
```

> **️ Do not `npm update` `@astrojs/sitemap`.** It is pinned to **exactly `3.6.0`**.
> Versions ≥ 3.6.1 read routes from the `astro:routes:resolved` hook, which only exists in
> **Astro 5**. Under Astro 4 that hook never fires and the integration crashes the build at
> `astro:build:done` with `Cannot read properties of undefined (reading 'reduce')`. Keep the
> exact pin, or migrate the whole site to Astro 5.

## Deploy (GitHub Pages user site)

1. Create a repo named **`balajiselvaraj1601.github.io`** and push this folder to `main`.
2. In the repo: **Settings - Pages - Build and deployment - Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` (`npm ci` - `npm run build` -
   upload `dist/` - `deploy-pages`). The site publishes at https://balajiselvaraj1601.github.io.

The absolute site URL is set **once** in `astro.config.mjs` (`SITE_URL`); `Astro.site`,
canonical/OG tags, and the sitemap all derive from it. `public/robots.txt` carries the same
URL and must be updated alongside `SITE_URL` if it ever changes.

## Specs & documentation

Full index: **[docs/README.md](./docs/README.md)**

| Doc                                                                       | Topic                                   |
| ------------------------------------------------------------------------- | --------------------------------------- |
| [getting-started.md](./docs/getting-started.md)                           | Install, dev, build, preview            |
| [go-live-checklist.md](./docs/go-live-checklist.md)                       | Publish to GitHub Pages                 |
| [content-editing.md](./docs/content-editing.md)                           | Change site copy via JSON               |
| [architecture.md](./docs/architecture.md)                                 | Data flow, stack, key files             |
| [environment-languages-skills.md](./docs/environment-languages-skills.md) | Languages, tooling, programmatic skills |
| [requirements.md](./docs/requirements.md)                                 | MoSCoW features                         |
| [specification.md](./docs/specification.md)                               | IA, routes, section contracts           |
| [content-map.md](./docs/content-map.md)                                   | Résumé - portfolio traceability         |
| [design-direction.md](./docs/design-direction.md)                         | Visual tokens and motion                |
| [seo.md](./docs/seo.md)                                                   | Meta, OG, JSON-LD, sitemap              |
| [accessibility.md](./docs/accessibility.md)                               | WCAG 2.1 AA checklist                   |
| [deployment.md](./docs/deployment.md)                                     | CI/CD and artifact checklist            |
| [assets.md](./docs/assets.md)                                             | Résumé PDF, OG image, favicons          |
| [troubleshooting.md](./docs/troubleshooting.md)                           | Common errors and fixes                 |

`content/` and `docs/` are self-contained - no need to re-read the source résumé.
