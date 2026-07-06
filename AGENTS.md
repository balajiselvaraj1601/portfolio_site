# AGENTS.md — Portfolio Site

## What This Repo Is

A production-focused **Astro 4** portfolio for **Balaji Selvaraj** (Technical AI Leader),
deployed to GitHub Pages as a user site at <https://balajiselvaraj1601.github.io>.
Every piece of public copy renders from a Zod-validated JSON content layer — components
read data, they do not hardcode copy.

```text
content/**/*.json
  → src/schemas/        (Zod schemas; types via z.infer)
  → src/lib/content.ts    (loads + validates each file, derives nav/views)
  → src/components/SectionRenderer.astro  (section id → component)
  → src/pages/*.astro      (routes)
```

## Working Rules

- Keep changes surgical and aligned with the existing Astro/component style.
- Change public copy in `content/`, never in components.
- Update `src/schemas/` first when adding or changing a JSON field — types are
  derived from the schema (`z.infer`), so the schema is the single source of truth.
- Keep route/section order in `content/site.json`; route files stay generic.
- Run `npm run build` before handoff after any code or content change. The build
  fails fast on schema violations and broken section/view wiring.
- Batch work: see `docs/task-runner.md`; create a per-batch `TASKS.md` queue and invoke the `task-runner` skill (`.cursor/skills/task-runner/SKILL.md`). No `TASKS.md` at the root means no batch is active.
- Multi-view design consistency: invoke the page-consistency-team skill (`.claude/skills/page-consistency-team/SKILL.md`) or `/page-team` in Claude Code; see `docs/page-team.md`.
- **Local dev ports:** see [Local servers and ports](#local-servers-and-ports).

## Page structure

The site is a **single-page home** (`/`) that renders every section once. Header nav
activates **views** (About, Experience, Research, Recognition, Vision,
Contact) via scroll targets and scroll-spy — there is no per-route page for content.

Legacy paths (`/experience`, `/research`, `/recognition`, `/vision`,
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

- **`site-chrome.ts`** — entry point (`initSiteChrome()`): mobile nav,
  scrolled-header state, reveal animations; calls `initSectionViews()` on `/`.
  (The theme toggle was removed by the dark-only theme, ec01162.)
- **`section-views.ts`** — nav scroll + scroll-spy: scrolls to a view's first section on hash
  change and keeps nav state in sync. All sections remain visible.
- **`save-page.ts`** — `savePage()`, downloads the page as self-contained HTML.

Section contracts: `docs/specification.md` and `docs/page-briefs/`.

### Route map

```text
/              About (home)     → all sections; default view shows About subset
/#experience   Experience view  → experience
/#research     Research view    → publications, conferences, speakers
/#recognition  Recognition view → awards, kaggle, education
/#vision       Vision view      → vision-programs, vision-impact
/#contact      Contact view     → contact
/experience … /contact         → ViewRedirect stubs → /#{anchor}
```

| View            | Page id       | Nav label   | `viewSections`                      |
| --------------- | ------------- | ----------- | ----------------------------------- |
| `/` (default)   | `home`        | About       | hero, thirukural, leadership        |
| `/#experience`  | `experience`  | Experience  | experience                          |
| `/#research`    | `research`    | Research    | publications, conferences, speakers |
| `/#recognition` | `recognition` | Recognition | awards, kaggle, education           |
| `/#vision`      | `vision`      | Vision      | vision-programs, vision-impact      |
| `/#contact`     | `contact`     | Contact     | contact                             |

**Full home DOM order** (13 sections): hero → thirukural → leadership →
experience →
publications → conferences → speakers → awards → kaggle → education →
vision-programs → vision-impact → contact.

**Résumé PDF:** `public/assets/resume/balaji-selvaraj-resume.pdf` ships as a static asset
(direct-linkable) but is **not** wired in header nav or `content/site.json`.

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

| Task                        | Command                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Install pinned dependencies | `npm ci`                                                                                              |
| Dev server (4321)           | `npm run dev`                                                                                         |
| Stop all Astro 43xx servers | `npm run dev:stop`                                                                                    |
| Restart dev (4321)          | `npm run dev:restart`                                                                                 |
| Production build            | `npm run build`                                                                                       |
| Preview build (4331)        | `npm run preview`                                                                                     |
| Rebuild + preview (4331)    | `npm run preview:restart`                                                                             |
| Verify dev + preview        | `ss` + `curl` (see [docs/troubleshooting.md §Verify servers](docs/troubleshooting.md#verify-servers)) |
| Dev smoke (Playwright)      | `npm run smoke:localhost`                                                                             |
| Full verify (release gate)  | `npm run verify`                                                                                      |
| Bump version                | `npm run release:bump -- --bump patch`                                                                |
| Cut release                 | `/release` or `.claude/commands/release.md`                                                           |

CI builds on Node 20 (`package.json` engines: `>=18`).

## Releases

Version SSOT: `package.json` → `version` (synced to `package-lock.json` by `scripts/bump-version.mjs`).
This package is `"private": true` — releases are git tags and [GitHub Releases](CHANGELOG.md), not npm publish.

- **First-time / manual cut:** run `npm run verify`, tag `vX.Y.Z`, push `main` + tag; `.github/workflows/release.yml` verifies and creates the GitHub Release.
- **Future bumps:** workflow dispatch on `release.yml` (patch/minor/major) or follow `.claude/commands/release.md`.
- Deploy to GitHub Pages stays on push to `main` on the user-site repo; tags do not replace that trigger.

## Local servers and ports

| Mode                    | Port | URL                    | npm script        |
| ----------------------- | ---- | ---------------------- | ----------------- |
| Dev (HMR)               | 4321 | http://localhost:4321/ | `npm run dev`     |
| Preview (built `dist/`) | 4331 | http://localhost:4331/ | `npm run preview` |

Port **values** SSOT: [`scripts/ports.mjs`](scripts/ports.mjs) (imported by
`astro.config.mjs` with `strictPort: true`). Workflows, stop/restart semantics,
anti-patterns, and verify commands:
[docs/troubleshooting.md §Local servers and ports](docs/troubleshooting.md#local-servers-and-ports).

## Agents

The repo runs a coordinated multi-agent system for design consistency, full-site review, and token standardization. All agents live in `.claude/agents/`.

### Orchestrators (Sonnet, direct edit capability)

| Agent                           | Purpose                                                                                                                                           | Trigger                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `site-review-fix`               | Full-site audit → fix → verify → commit pipeline. Interactive, user-approved commits.                                                             | `/site-review` or `"site review"`             |
| `site-review-auto`              | **NEW.** Autonomous headless variant of site-review-fix. Unconditional commit, mandatory audit doc, no user prompts. Designed for scheduled runs. | `"scheduled review"` or via `/schedule` skill |
| `site-consistency-orchestrator` | Coordinates 6 page-rep agents + design-guardian for cross-view design conflict resolution.                                                        | `/page-team` or `"page team"`                 |

### Specialists (Sonnet, specialized edit scope)

| Agent                 | Purpose                                                                                                                                           | Scope                                                                  | Trigger                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| `design-standardizer` | **NEW.** Token enforcement — sweeps components for hardcoded design values and replaces with tokens, adding missing tokens to `global.css :root`. | `src/components/`, `src/styles/global.css :root`                       | `"token sweep"`, or spawned by site-review-auto Phase 2 |
| `design-guardian`     | Binding design authority. Resolves cross-view token/primitive conflicts. Sole editor of `global.css` (below `:root`), `ui/`, `cards/`.            | `src/styles/global.css`, `src/components/ui/`, `src/components/cards/` | Orchestrator Phase 3, or `"design guardian"`            |

### Page Representatives (Haiku, view-scoped edit)

| Agent              | View           | Sections                            | Trigger                               |
| ------------------ | -------------- | ----------------------------------- | ------------------------------------- |
| `page-about`       | `home` (About) | hero, thirukural, leadership        | Orchestrator, or `"about view"`       |
| `page-experience`  | `#experience`  | experience                          | Orchestrator, or `"experience view"`  |
| `page-research`    | `#research`    | publications, conferences, speakers | Orchestrator, or `"research view"`    |
| `page-recognition` | `#recognition` | awards, kaggle, education           | Orchestrator, or `"recognition view"` |
| `page-vision`      | `#vision`      | vision-programs, vision-impact      | Orchestrator, or `"vision view"`      |
| `page-contact`     | `#contact`     | contact                             | Orchestrator, or `"contact view"`     |

### Skills (Reusable, invoked by agents)

| Skill                            | Used by                                                 | Reference                                                |
| -------------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| `site-review-fix`                | site-review-fix agent                                   | `.claude/skills/site-review-fix/SKILL.md`                |
| `page-consistency-team`          | site-consistency-orchestrator, site-review-auto         | `.claude/skills/page-consistency-team/SKILL.md`          |
| `portfolio-icon-audit`           | Manual invocation                                       | `.claude/skills/portfolio-icon-audit/SKILL.md`           |
| `portfolio-icon-patterns`        | Manual invocation; design-guardian, page agents         | `.claude/skills/portfolio-icon-patterns/SKILL.md`        |
| `portfolio-icon-standardization` | Manual invocation; design-guardian, page agents         | `.claude/skills/portfolio-icon-standardization/SKILL.md` |
| `svg-logo-crop`                  | Manual invocation                                       | `.claude/skills/svg-logo-crop/SKILL.md`                  |
| `icon-square-center`             | Manual invocation (raster prep)                         | `.claude/skills/icon-square-center/SKILL.md`             |
| `portfolio-card-shells`          | Manual invocation; design-guardian                      | `.claude/skills/portfolio-card-shells/SKILL.md`          |
| `portfolio-content-authoring`    | Manual invocation                                       | `.claude/skills/portfolio-content-authoring/SKILL.md`    |
| `portfolio-visual-verify`        | Manual invocation                                       | `.claude/skills/portfolio-visual-verify/SKILL.md`        |
| `portfolio-seo-meta`             | Manual invocation                                       | `.claude/skills/portfolio-seo-meta/SKILL.md`             |
| `portfolio-a11y-contrast`        | Manual invocation; hands token edits to design-guardian | `.claude/skills/portfolio-a11y-contrast/SKILL.md`        |

## Icon / Logo Asset Pipeline

Icons in this site come from two sources. Know which to use before touching any icon:

| Source                       | Format           | Render method                                 | When                                                     |
| ---------------------------- | ---------------- | --------------------------------------------- | -------------------------------------------------------- |
| `src/lib/icon-paths.json`    | SVG path data    | `<Icon name="…">` → CSS mask (`currentColor`) | UI icons: trophy, calendar, save, sun, moon…             |
| `public/assets/logos/<set>/` | PNG / SVG / WebP | `<img>` via `logoSrc(slug)`                   | Brand / decorative images that must keep their own color |

### `logoSrc(slug)` — how it works

Defined in `src/lib/content.ts`. At build time it scans `public/assets/logos/` across every subfolder listed in `LOGO_SUBDIRS`, building a `Map<filename, urlPath>`. At call time it tries `${slug}.png`, `.svg`, `.webp`, `.avif` in that order and returns the first match.

```ts
const LOGO_SUBDIRS = ['org', 'marks', ''] as const;
```

`org/` holds real brand logos (keep their own color); `marks/` holds the
generated mark set (`logo_kaggle_*`, `logo_hub_*`, `logo_vision_*`,
`logo_education_*`, `logo_general_*`, …); the `''` entry is the root fallback.
First match wins in that order.

**To add a new image:**

1. Drop the file into `public/assets/logos/marks/` (generated marks) or
   `public/assets/logos/org/` (brand logos) — no code change needed.
2. Call `logoSrc('<slug>')` — slug = filename without extension.
3. Only add a new subfolder to `LOGO_SUBDIRS` in `src/lib/content.ts` if you
   genuinely need a new scanned directory.

### Naming convention

Images sourced from `icon_collections/` follow `icon_<set>_<name>.png`. The `<set>` prefix determines the destination subfolder: `icon_education_*` → `public/assets/logos/education/`, `icon_general_*` → `general/`, `icon_trophy_awards` → `awards/`, etc.

### Image-or-fallback pattern

When replacing a `<Icon>` with a PNG, always keep the SVG fallback so the page degrades gracefully if the asset is missing:

```astro
const imgSrc = logoSrc('icon_<set>_<name>'
{
  imgSrc ? (
    <img src={imgSrc} alt="" class="my-img" aria-hidden="true" />
  ) : (
    <Icon name="<icon-name>" size={22} />
  )
}
```

CSS size the `<img>` to match the Icon pixel size — `size={22}` = `1.375rem`, `size={20}` = `1.25rem`, `size="sm"` = `1rem`.

### CSS mask vs `<img>`

- `<Icon>` renders as an SVG with CSS `mask-image`. It strips color — only `currentColor` shows. **Never use `<Icon>` for a full-color PNG.**
- `logoSrc` images must render as `<img style="object-fit: contain">`. They are not masked.
- `logoHasOwnRing(slug)` in `src/lib/logo-display.ts` returns `true` only when slug starts with `logo_` (pipeline SVG marks). Icon-set PNGs (`icon_*`) return `false`.

### Theme-toggle show/hide classes

**Removed.** The header theme toggle was deleted by the dark-only theme migration (ec01162); `.theme-toggle__sun` / `.theme-toggle__moon` and their CSS no longer exist. Header action buttons are `save-btn` and `nav-toggle` only. If a component swaps an `<Icon>` for an `<img>`, any CSS keyed on the icon's class must still land on the rendered element — pass the class explicitly on the `<img>`.

### `save-btn` aria-busy rule

When the save button is loading, CSS sets `opacity: 0` on its child icon. After replacing `<Icon>` with `<img>`, the selector must cover both:

```css
.save-btn[aria-busy='true'] :is(svg, img) {
  opacity: 0;
}
```

### Extending `RecogTile` with an image

`RecogTile.astro` accepts an optional `imgSrc?: string` prop. When provided it renders `<img>` instead of `<Icon name={icon}>`. The `icon` prop is still required (used as fallback). Pass both:

```astro
<RecogTile icon="trophy" imgSrc={trophyImgSrc} count={n} label="Silver" />
```

## Documentation

| Area                                    | Read                                                                 |
| --------------------------------------- | -------------------------------------------------------------------- |
| Agent system (NEW)                      | This AGENTS.md section above                                         |
| Agents — design standardizer (NEW)      | `.claude/agents/design-standardizer.md`                              |
| Agents — site-review-auto (NEW)         | `.claude/agents/site-review-auto.md`                                 |
| Agents — design contracts               | `.claude/references/design-consistency-contract.md`                  |
| Agents — page-agent playbook            | `.claude/references/page-agent-playbook.md`                          |
| Agents — authoring standard             | `.claude/references/page-agent-standard.md`                          |
| Content authoring (schema-first JSON)   | `.claude/skills/portfolio-content-authoring/SKILL.md`                |
| Visual verify (screenshot / reveal)     | `.claude/skills/portfolio-visual-verify/SKILL.md`                    |
| SEO / metadata sync (URL, OG, JSON-LD)  | `.claude/skills/portfolio-seo-meta/SKILL.md`                         |
| Accessibility / contrast (WCAG AA)      | `.claude/skills/portfolio-a11y-contrast/SKILL.md`                    |
| Icon / logo audit (Claude skill)        | `.claude/skills/portfolio-icon-audit/SKILL.md`                       |
| Icon size / chrome / color SSOT (skill) | `.claude/skills/portfolio-icon-standardization/SKILL.md`             |
| Logo SVG border crop (visible ink)      | `.claude/skills/svg-logo-crop/SKILL.md`                              |
| UI icon sourcing (Lucide / Iconify)     | `../.claude/skills/ui-icon-acquisition/SKILL.md`                     |
| Logo evaluation / favicon scoring       | `../.claude/skills/brand-logo-evaluation/SKILL.md`                   |
| Logo SVG authoring                      | `../image_gen/.claude/skills/logo-emblem-author/SKILL.md`            |
| Setup and commands                      | `docs/getting-started.md`                                            |
| Local server ports (workflows/symptoms) | `docs/troubleshooting.md#local-servers-and-ports`                    |
| Long-running agent batches              | `docs/task-runner.md`                                                |
| Multi-view design consistency           | `docs/page-team.md`, `.claude/skills/page-consistency-team/SKILL.md` |
| Architecture and data flow              | `docs/architecture.md`                                               |
| Languages, tooling, programmatic skills | `docs/environment-languages-skills.md`                               |
| Content editing                         | `docs/content-editing.md`, `content/README.md`                       |
| Section contracts                       | `docs/specification.md`                                              |
| Per-route section intent                | `docs/page-briefs/` (incl. `vision.md`, `contact.md`)                |
| SEO and metadata                        | `docs/seo.md`                                                        |
| Assets                                  | `docs/assets.md`                                                     |
| Accessibility                           | `docs/accessibility.md`                                              |
| Deployment                              | `docs/deployment.md`, `docs/go-live-checklist.md`                    |
| Build issues                            | `docs/troubleshooting.md`                                            |
