# AGENTS.md — Portfolio Site

## What This Repo Is

A production-focused **Astro 4** portfolio for **Balaji Selvaraj** (Technical AI Leader),
deployed to GitHub Pages as a user site at <https://balajiselvaraj1601.github.io>.
Every piece of public copy renders from a Zod-validated JSON content layer — components
read data, they do not hardcode copy.

```text
content/**/*.json
  → src/schemas.ts        (Zod schemas; types via z.infer)
  → src/lib/content.ts    (loads + validates each file, derives nav/views)
  → src/components/SectionRenderer.astro  (section id → component)
  → src/pages/*.astro      (routes)
```

## Working Rules

- Keep changes surgical and aligned with the existing Astro/component style.
- Change public copy in `content/`, never in components.
- Update `src/schemas.ts` first when adding or changing a JSON field — types are
  derived from the schema (`z.infer`), so the schema is the single source of truth.
- Keep route/section order in `content/site.json`; route files stay generic.
- Run `npm run build` before handoff after any code or content change. The build
  fails fast on schema violations and broken section/view wiring.
- Batch work: see `TASKS.md`; invoke the `task-runner` skill (`.cursor/skills/task-runner/SKILL.md`).

## Page structure

The site is a **single-page home** (`/`) that renders every section once. Header nav
activates **views** (About, Experience, Projects, Research, Recognition, Vision,
Contact) via scroll targets and scroll-spy — there is no per-route page for content.

Legacy paths (`/experience`, `/projects`, `/research`, `/recognition`, `/vision`,
`/contact`) are one-line stubs in `src/pages/*.astro` that render
`<ViewRedirect anchor="…" />` (`src/components/ViewRedirect.astro`), sending the
browser to `/#{anchor}` on `/`. The anchor is the page **id** (e.g.
`src/pages/experience.astro` → `<ViewRedirect anchor="experience" />`).

Routing and view wiring live in `content/site.json → pages`:

- **`home.sections`** — full DOM order on `/` (each section id appears once).
- **`pages[].viewSections`** — sections grouped under each nav item (scroll target + spy).
- **`pages[].viewAnchor`** — URL hash for the view. Only `home` sets it (`about`);
  for every other page the anchor falls back to the page `id`
  (`anchor = page.viewAnchor ?? page.id`, see `navViews`/`navHref` in
  `src/lib/content.ts`).

Client behavior is wired by three scripts in `src/scripts/`:

- **`site-chrome.ts`** — entry point (`initSiteChrome()`): theme toggle, mobile nav,
  scrolled-header state, reveal animations; calls `initSectionViews()` on `/`.
- **`section-views.ts`** — nav scroll + scroll-spy: scrolls to a view's first section on hash
  change and keeps nav state in sync. All sections remain visible.
- **`save-page.ts`** — `savePage()`, downloads the page as self-contained HTML.

Section contracts: `docs/specification.md` and `docs/page-briefs/`.

### Route map

```text
/              About (home)     → all sections; default view shows About subset
/#experience   Experience view  → experience-intro, experience
/#projects     Projects view    → projects-intro, featured-case-studies, projects
/#research     Research view    → publications, conferences, speakers
/#recognition  Recognition view → awards, kaggle, education
/#vision       Vision view      → technical-vision, vision-board, impact
/#contact      Contact view     → contact
/experience … /contact         → ViewRedirect stubs → /#{anchor}
/assets/...    Resume (PDF)     → external nav link
```

| View            | Page id       | Nav label   | `viewSections`                                  |
| --------------- | ------------- | ----------- | ----------------------------------------------- |
| `/` (default)   | `home`        | About       | hero, thirukural, leadership                    |
| `/#experience`  | `experience`  | Experience  | experience-intro, experience                    |
| `/#projects`    | `projects`    | Projects    | projects-intro, featured-case-studies, projects |
| `/#research`    | `research`    | Research    | publications, conferences, speakers             |
| `/#recognition` | `recognition` | Recognition | awards, kaggle, education                       |
| `/#vision`      | `vision`      | Vision      | technical-vision, vision-board, impact          |
| `/#contact`     | `contact`     | Contact     | contact                                         |

**Full home DOM order** (18 sections): hero → thirukural → leadership →
experience-intro → experience → projects-intro →
featured-case-studies → projects → publications → conferences → speakers →
awards → kaggle → education → technical-vision → vision-board →
impact → contact.

Each section id appears in exactly one `viewSections` group (no duplication across nav
buttons). `content.ts` fails the build if a home section is unassigned or a
`viewSections` entry names an unknown section.

When `navViews={true}`, sections are wrapped with `data-nav-views` for scroll-spy. See
`src/scripts/section-views.ts` and `sectionViewMap` in `src/lib/content.ts`.

## Hard Rules

1. `@astrojs/sitemap` is pinned to exactly `3.6.0`. Do not loosen or upgrade it unless
   migrating the whole site to Astro 5.
2. `SITE_URL` in `astro.config.mjs` is the source of truth for canonical URLs, OG URLs,
   and sitemap generation. Keep `public/robots.txt` in sync if the URL changes. The
   redirect stubs are excluded from the sitemap via `REDIRECT_STUB_PATHS` in
   `astro.config.mjs` — keep that list aligned with the stub pages.
3. Never publish a phone number or a References section.
4. Do not commit `dist/`; CI rebuilds it through `.github/workflows/deploy.yml`.

## Commands

| Task                        | Command           |
| --------------------------- | ----------------- |
| Install pinned dependencies | `npm ci`          |
| Dev server                  | `npm run dev`     |
| Production build            | `npm run build`   |
| Preview build               | `npm run preview` |

CI builds on Node 20 (`package.json` engines: `>=18`).

## Documentation

| Area                                    | Read                                                      |
| --------------------------------------- | --------------------------------------------------------- |
| Icon / logo audit (Claude skill)        | `.claude/skills/portfolio-icon-audit/SKILL.md`            |
| Logo SVG border crop (visible ink)      | `.claude/skills/svg-logo-crop/SKILL.md`                   |
| UI icon sourcing (Lucide / Iconify)     | `../.claude/skills/ui-icon-acquisition/SKILL.md`          |
| Logo evaluation / favicon scoring       | `../.claude/skills/brand-logo-evaluation/SKILL.md`        |
| Logo SVG authoring                      | `../image_gen/.claude/skills/logo-emblem-author/SKILL.md` |
| Setup and commands                      | `docs/getting-started.md`                                 |
| Long-running agent batches              | `docs/task-runner.md`                                     |
| Architecture and data flow              | `docs/architecture.md`                                    |
| Languages, tooling, programmatic skills | `docs/environment-languages-skills.md`                    |
| Content editing                         | `docs/content-editing.md`, `content/README.md`            |
| Section contracts                       | `docs/specification.md`                                   |
| Per-route section intent                | `docs/page-briefs/` (incl. `vision.md`, `contact.md`)     |
| SEO and metadata                        | `docs/seo.md`                                             |
| Assets                                  | `docs/assets.md`                                          |
| Accessibility                           | `docs/accessibility.md`                                   |
| Deployment                              | `docs/deployment.md`, `docs/go-live-checklist.md`         |
| Build issues                            | `docs/troubleshooting.md`                                 |
