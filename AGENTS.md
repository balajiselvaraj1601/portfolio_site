# AGENTS.md — Portfolio Site

> Canonical, model-agnostic agent guide. CLAUDE.md / GEMINI.md / CURSOR.md are
> thin wrappers that point here. Edit shared knowledge in THIS file only.

## What this repo is

A static **Astro 4** portfolio for **Balaji Selvaraj** (Technical AI Leader), deployed to
**GitHub Pages** as a user site at https://balajiselvaraj1601.github.io. Everything renders from
a Zod-validated JSON content layer — no copy is hardcoded in components.

```
content/*.json  →  src/lib/content.ts (validates vs src/schemas.ts)  →  src/components/sections/*  →  src/pages/index.astro
```

See [`README.md`](./README.md) for the full layout and [`docs/README.md`](./docs/README.md) for
the complete documentation index.

## Behavioral guidelines

- **Surgical changes** — touch only what the task requires; match existing style; no
  opportunistic refactors.
- **Content is SSOT** — to change what the site says, edit `content/*.json`, never the
  components. Each file is validated at build time against `src/schemas.ts`; if you add a
  field, update the schema first or the build fails.
- **Verify before handoff** — `npm run build` must pass; spot-check with `npm run preview`.

## Hard rules (do not break)

1. **`@astrojs/sitemap` is pinned to exactly `3.6.0`.** Do NOT `npm update` it or loosen the
   pin. ≥ 3.6.1 requires Astro 5 (`astro:routes:resolved` hook) and crashes the Astro 4
   build at `astro:build:done`. Keep the pin, or migrate the whole site to Astro 5.
2. **One source of truth for the site URL:** `SITE_URL` in `astro.config.mjs`. `Astro.site`,
   canonical/OG tags, and the sitemap derive from it. `public/robots.txt` carries the same
   absolute URL — update both together if it ever changes.
3. **Privacy:** never surface a phone number or a References section. The public content set
   is curated — see `content/README.md`.
4. **Deploy is automated:** push to `main` → `.github/workflows/deploy.yml`. `dist/` is
   git-ignored and rebuilt in CI; don't commit it. The `deploy` job is gated with
   `if: github.repository == 'balajiselvaraj1601/balajiselvaraj1601.github.io'`, so it only
   publishes from the user-site repo; the `balajiselvaraj1601/portfolio_site` repo is a
   staging mirror where `build` runs but `deploy` is skipped (Pages not enabled there).

## Commands

| Task | Command |
|---|---|
| Install (pinned) | `npm ci` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview built site | `npm run preview` |

## Context loading (progressive disclosure)

1. Read this file first.
2. Load a deeper reference ONLY when the task touches its area:

   | When the task involves… | Read |
   |---|---|
   | Onboarding, local dev, build commands | `docs/getting-started.md` |
   | Publishing to GitHub Pages | `docs/go-live-checklist.md` · `docs/deployment.md` |
   | Editing site copy / JSON | `docs/content-editing.md` · `content/README.md` |
   | Repo layout, data flow, stack | `docs/architecture.md` |
   | Which sections exist, IA, per-section data contract | `docs/specification.md` |
   | Feature scope / acceptance criteria (MoSCoW) | `docs/requirements.md` |
   | What résumé content is included/excluded and why | `docs/content-map.md` |
   | Résumé PDF, OG image, favicons | `docs/assets.md` |
   | Meta, OG/Twitter, JSON-LD, sitemap, robots | `docs/seo.md` |
   | Contrast, focus, semantics, reduced-motion | `docs/accessibility.md` |
   | Visual tokens, type, spacing, motion | `docs/design-direction.md` |
   | Build/deploy errors | `docs/troubleshooting.md` |
