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

npm ci    # use npm ci, not npm install - respects package-lock.json pins
```

> **Important:** `@astrojs/sitemap` is pinned to exactly `3.6.0`. Do not run
> `npm update @astrojs/sitemap` - versions ≥ 3.6.1 require Astro 5 and will crash
> the build. See [Troubleshooting](./troubleshooting.md#sitemap-build-crash).

## Development workflow

### Start the dev server

```bash
npm run dev
```

If the page won't load (connection refused), restart a clean single instance:

```bash
npm run dev:restart
```

Opens at http://localhost:4321 with hot module replacement. Edit JSON under `content/` or
`src/components/**` and the browser refreshes automatically.

### Production build

```bash
npm run build
```

Output goes to `dist/`. Content validation runs during the build - invalid JSON shape
throws a Zod error with the field path.

### Preview the built site

```bash
npm run preview
```

Serves `dist/` at http://localhost:4331/. Use this to verify assets, links, and theme
behavior exactly as they will appear on GitHub Pages. Dev (HMR) and preview can run
simultaneously - dev stays on 4321, preview on 4331.

## What to edit

| Goal                               | Edit                                                | Do not edit                   |
| ---------------------------------- | --------------------------------------------------- | ----------------------------- |
| Change site copy                   | JSON under `content/`                               | Section components (for copy) |
| Change route sections / visibility | `content/pages/00_site.json`                        | `src/pages/*.astro` order     |
| Change styling                     | `src/styles/global.css`, component `<style>` blocks | -                             |
| Change SEO defaults                | `content/pages/00_site.json` - `seo`                | Hardcode meta in components   |
| Replace résumé / OG image          | `public/assets/**`                                  | -                             |
| Change live URL                    | `astro.config.mjs` + `public/robots.txt`            | -                             |

See [Content editing](./content-editing.md) and [Assets](./assets.md) for details.

## Project layout (abbreviated)

```text
portfolio_site/
├── content/           Site copy (SSOT) - JSON validated by Zod
├── public/            Static files copied verbatim to dist/
├── src/
│   ├── components/    Reusable UI + sections/
│   ├── layouts/       Layout.astro
│   ├── lib/content.ts Loader + validation
│   ├── pages/         index, experience, projects, research, recognition, vision, contact, 404 (+ redirect stubs - /#anchor)
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

- All configured routes render their `site.json` sections
- Résumé PDF downloads from header
- Light/dark toggle persists on reload
- Mobile menu opens, traps focus, closes on Esc
- No phone number anywhere on the page

## Long-running batches

For multi-step agent work through a persisted checklist, see [Task runner](./task-runner.md).
Start with `./.cursor/scripts/task-runner-start.sh` after creating and filling `TASKS.md`.

## Next steps

- **Change content:** [Content editing](./content-editing.md)
- **Languages & skills:** [Environment languages & skills](./environment-languages-skills.md)
- **Publish the site:** [Go-live checklist](./go-live-checklist.md)
- **Something broke:** [Troubleshooting](./troubleshooting.md)
