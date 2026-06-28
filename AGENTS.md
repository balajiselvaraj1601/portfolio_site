# AGENTS.md — Portfolio Site

## What This Repo Is

A production-focused **Astro 4** portfolio for **Balaji Selvaraj** (Technical AI Leader),
deployed to GitHub Pages as a user site at <https://balajiselvaraj1601.github.io>.
Everything renders from a Zod-validated JSON content layer; components should not hardcode
public copy.

```text
content/**/*.json -> src/lib/content.ts -> src/schemas.ts -> src/components/SectionRenderer.astro -> src/pages/*.astro
```

## Working Rules

- Keep changes surgical and aligned with the existing Astro/component style.
- Change public copy in `content/`, not in components.
- Update `src/schemas.ts` before adding or changing JSON fields.
- Keep route section order in `content/site.json`; route files should stay generic.
- Run `npm run build` before handoff after code or content changes.

## Hard Rules

1. `@astrojs/sitemap` is pinned to exactly `3.6.0`. Do not loosen or upgrade it unless
   migrating the whole site to Astro 5.
2. `SITE_URL` in `astro.config.mjs` is the source of truth for canonical URLs, OG URLs,
   and sitemap generation. Keep `public/robots.txt` in sync if the URL changes.
3. Never publish a phone number or a References section.
4. Do not commit `dist/`; CI rebuilds it through `.github/workflows/deploy.yml`.

## Commands

| Task | Command |
|---|---|
| Install pinned dependencies | `npm ci` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |

## Documentation

| Area | Read |
|---|---|
| Icon / logo audit (Claude skill) | `.claude/skills/portfolio-icon-audit/SKILL.md` |
| Setup and commands | `docs/getting-started.md` |
| Architecture and data flow | `docs/architecture.md` |
| Content editing | `docs/content-editing.md`, `content/README.md` |
| Section contracts | `docs/specification.md` |
| SEO and metadata | `docs/seo.md` |
| Assets | `docs/assets.md` |
| Accessibility | `docs/accessibility.md` |
| Deployment | `docs/deployment.md`, `docs/go-live-checklist.md` |
| Build issues | `docs/troubleshooting.md` |
