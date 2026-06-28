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

## Page structure

Routing is defined once in `content/site.json → pages`. Each route file under
`src/pages/` looks up its page entry and renders via `SectionRenderer.astro`.
Section contracts and component details: `docs/specification.md` and
`docs/page-briefs/`.

### Route map

```text
/              About (home)     → hero, about, featured-case-studies, impact, vision-board,
                                  leadership, skills, timeline, affiliations, publications, contact
/experience    Experience       → experience-intro, experience, mentorship, impact, contact
/projects      Projects         → projects-intro, featured-case-studies, projects, contact
/research      Research         → generative-ai, publications, conferences, speakers, contact
/recognition   Recognition      → awards, kaggle, education, contact
/vision        Vision           → vision-board
/contact       Contact          → contact
/assets/...    Resume (PDF)     → external nav link (not a rendered page)
```

| Route | Page id | Nav label | Sections (in order) |
|---|---|---|---|
| `/` | `home` | About | hero, about, featured-case-studies, impact, vision-board, leadership, skills, timeline, affiliations, publications, contact |
| `/experience` | `experience` | Experience | experience-intro, experience, mentorship, impact, contact |
| `/projects` | `projects` | Projects | projects-intro, featured-case-studies, projects, contact |
| `/research` | `research` | Research | generative-ai, publications, conferences, speakers, contact |
| `/recognition` | `recognition` | Recognition | awards, kaggle, education, contact |
| `/vision` | `vision` | Vision | vision-board |
| `/contact` | `contact` | Contact | contact |
| PDF | `resume` | Resume | external (`pages[].external: true`) |

### Shared-section parity

When a section id appears on home and on a dedicated page, it **must** use the same
section component and the same content — no teaser or legacy preview components.

- **Home-only differences** are allowed only via `SectionRenderer` `pageId` props, not
  separate components.
- **Page-only sections** (e.g. `conferences`, `mentorship`, `projects`) intentionally
  stay off home; home is curated, not a full mirror of every route.

| Section id | Shared between | Component |
|---|---|---|
| `featured-case-studies` | `/`, `/projects` | `FeaturedCaseStudies.astro` |
| `impact` | `/`, `/experience` | `Impact.astro` |
| `vision-board` | `/`, `/vision` | `VisionBoard.astro` |
| `publications` | `/`, `/research` | `Publications.astro` |
| `contact` | `/`, `/experience`, `/projects`, `/research`, `/recognition`, `/contact` | `Contact.astro` |

Home-only sections: `hero`, `about`, `leadership`, `skills`, `timeline`, `affiliations`.

### `SectionRenderer` pageId variants

Behavior not visible in `site.json` — check `src/components/SectionRenderer.astro`
when editing home routing:

| Condition | Prop | Effect |
|---|---|---|
| `featured-case-studies` + `pageId === 'home'` | `showMoreHref="/projects"` | Adds “View all projects →” CTA |
| `publications` + `pageId === 'home'` | `showMoreHref="/research"` | Adds “All research →” CTA |
| `timeline` + `pageId === 'home'` | `compact` | Hides “Full experience →” CTA on static rail |
| `timeline` + `pageId === 'experience'` | `showCta={false}` | **Dead branch** — experience page no longer lists `timeline` |

The interactive career timeline on `/experience` lives inside `Experience.astro`
(tabbed rail + role panels). Home uses standalone `CareerTimeline.astro` as a compact
preview.

## Known structural problems

Documented IA debt — do not reintroduce teaser/preview drift without an explicit decision.

### A. Information architecture tension

1. **Home is a mega-landing, not “About” only** — 11 sections spanning projects, research,
   vision, and contact. Nav label `About` understates scope.
2. **Heavy duplication** — Home embeds full flagship case studies, full publications list,
   full vision-board infographic, full impact block, and full contact. Users who scroll
   home then open `/projects`, `/research`, `/vision`, or `/contact` see repeated content.
3. **`/vision` is a thin route** — Single section identical to home; no `contact` closer
   (unlike experience, projects, research, recognition).
4. **`/contact` is largely redundant** — Same `contact` section appears at the bottom of
   five other pages plus home; header “Get in Touch” still links to `/contact`.

### B. Inconsistent home preview patterns

| Home section | Behavior | Issue |
|---|---|---|
| `featured-case-studies` | Full cards + CTA to `/projects` | Good — CTA leads to additional `projects` not on home |
| `publications` | Full list + CTA to `/research` | Good — CTA leads to generative-ai, conferences, speakers |
| `timeline` | `compact` (no CTA) | No link to `/experience` unlike other home CTAs |
| `impact`, `vision-board`, `contact` | Full sections, no CTA | No “see more on dedicated page” affordance |

### C. Stale / dead code and metadata

| Item | Problem |
|---|---|
| `SectionRenderer` `timeline && pageId === 'experience'` | Dead branch — remove in follow-up |
| `src/components/sections/Vision.astro` | Orphan — not in `SectionRenderer`; `profile.vision` unused |
| `site.json → sections.contact.source` | Lists `recognition/education.json` but `Contact.astro` only reads `profile` |
| `contactPage.resume*` in `profile.json` | Leftover from deleted `ContactTeaser`; unused by `Contact.astro` |

### D. Maintenance hazard

- **Two sources of truth**: `site.json` (which sections) + `SectionRenderer` (home
  variants). Editing routing requires checking both files.
- **Per-route intent** lives in `docs/page-briefs/`; keep in sync when changing
  `site.json → pages`.

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
| UI icon sourcing (Lucide / Iconify) | `../.claude/skills/ui-icon-acquisition/SKILL.md` |
| Logo evaluation / favicon scoring | `../.claude/skills/brand-logo-evaluation/SKILL.md` |
| Logo SVG authoring | `../image_gen/.claude/skills/logo-emblem-author/SKILL.md` |
| Setup and commands | `docs/getting-started.md` |
| Architecture and data flow | `docs/architecture.md` |
| Content editing | `docs/content-editing.md`, `content/README.md` |
| Section contracts | `docs/specification.md` |
| Per-route section intent | `docs/page-briefs/` |
| SEO and metadata | `docs/seo.md` |
| Assets | `docs/assets.md` |
| Accessibility | `docs/accessibility.md` |
| Deployment | `docs/deployment.md`, `docs/go-live-checklist.md` |
| Build issues | `docs/troubleshooting.md` |
