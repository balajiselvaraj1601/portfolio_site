# Site Specification

Tech-agnostic specification: information architecture, routing options, component hierarchy,
per-section content contract, and behavior. Pairs with `requirements.md` (the "what") — this
is the "how it's structured".

## 1. Information architecture

Primary structure: **single-page home** with **nav views**. All sections render once on `/` in
DOM order (`content/site.json → pages[id=home].sections`). Header nav scrolls to a view's first
section using hash URLs (`/#experience`, `/#research`, …). All sections remain visible on scroll.
Legacy paths redirect to the matching hash on `/`.

```
/              About (default)  → viewSections: hero, thirukural, leadership
/#experience   Experience       → experience-intro, experience
/#projects     Projects         → projects-intro, featured-case-studies
/#research     Research         → publications, conferences, speakers
/#recognition  Recognition      → awards, kaggle, education
/#vision       Vision           → vision-board
/#contact      Contact          → contact
/experience … /contact         → redirect stubs (noindex) → /#{viewAnchor}
/404           custom not-found page
```

The resume PDF remains a static asset at `public/assets/resume/balaji-selvaraj-resume.pdf`
(direct-linkable), but has no nav entry and no site-config wiring.

Each section id appears in exactly one `viewSections` group (exclusive nav grouping — no section
is duplicated across nav buttons). Section ids and grouping are defined in `content/site.json → pages`.
The renderer (`SectionRenderer`) iterates the home section list — do not hardcode section order in markup.

**Full home DOM order** (15 section ids): `hero` → `thirukural` → `leadership` →
`experience-intro` → `experience` → `projects-intro` → `featured-case-studies` →
`publications` → `conferences` → `speakers` → `awards` → `kaggle` → `education` →
`vision-board` → `contact`.

> **Shelved (not live):** Generative AI (`generative-ai`) is validated but kept out of
> `home.sections` with `visible: false` — see `content-editing.md` for re-enable steps.
> Strategic Impact (`impact`) and Technical Vision (`technical-vision`) are likewise
> intentionally shelved: their section definitions remain in `site.json → sections` (and
> their components exist), but no page renders them.

## 2. Component hierarchy (logical, framework-neutral)

```
App / Layout
├── Head (SEO meta, OG/Twitter, JSON-LD, favicon, manifest)  ← seo.md
├── ThemeProvider (light/dark, system default, persisted)
├── SiteChromeBoot (bundled initSiteChrome + section-views)
├── Header
│   ├── Brand (name)
│   ├── Nav (from site.json.pages, active-route indicator)
│   └── ThemeToggle
├── Main
│   ├── AboutLanding (wraps hero + thirukural on home)
│   │   ├── HeroSection            ← person/profile.json
│   │   └── ThirukuralSection      ← person/profile.json (heroQuote)
│   ├── LeadershipSection          ← person/profile.json + collaborations.json
│   ├── ExperienceIntroSection     ← work/experience.json (snapshot[])
│   ├── ExperienceSection          ← work/experience.json (roles[])
│   ├── ProjectsIntroSection       ← work/projects.json
│   ├── FeaturedCaseStudies        ← work/projects.json (featured: true)
│   ├── PublicationsSection        ← research/publications.json
│   ├── ConferencesSection         ← research/conferences.json
│   ├── SpeakersSection            ← research/speakers.json
│   ├── AwardsSection              ← recognition/awards.json (CompetitionCard-style recog layout)
│   ├── KaggleSection              ← recognition/kaggle.json (CompetitionCard stack)
│   ├── EducationSection           ← recognition/education.json (EducationCard)
│   ├── VisionBoardSection         ← work/vision-board.json
│   └── ContactSection             ← person/profile.json (contact[])
└── Footer (copyright, social links, back-to-top)
```

Reused primitives (define once, use everywhere): `Section`, `MetricCard`, `Chip`, `ResearchCard`,
`CompetitionCard`, `EducationCard`, `ContactLink`, `ProjectCaseStudyCard`.

## 3. Per-section content contract

| Section               | Source file                                         | Shape consumed                                                            | Rendering notes                                                |
| --------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Hero                  | `person/profile.json`                               | `headline`, `metrics[]`, `ctas[]`, photo                                  | Split layout; metric cards; value-oriented CTAs                |
| Thirukural            | `person/profile.json`                               | `heroQuote`                                                               | Couplet + portrait band; wrapped in AboutLanding with hero     |
| Leadership            | `person/profile.json`, `person/collaborations.json` | `aboutIntro`, `aboutCards[]`, `leadershipPhilosophy`, collaboration logos | Bio → scan cards → philosophy quote → theme cards → logo strip |
| Experience Intro      | `work/experience.json`                              | `title`, `intro`, `snapshot[]`                                            | Section lead-in + metric cards                                 |
| Experience            | `work/experience.json`                              | `roles[] -> projects[] -> bullets[]`                                      | Interactive tabbed timeline + role panels                      |
| Projects Intro        | `work/projects.json`                                | `title`, `intro`, `snapshot[]`                                            | Section lead-in + metric cards                                 |
| Featured Case Studies | `work/projects.json`                                | `projects[]` where `featured: true`                                       | Flagship case-study cards                                      |
| Projects              | `work/projects.json`                                | case-study fields + `highlights[]`, `tags[]`                              | Problem/solution/architecture/impact blocks                    |
| Publications          | `research/publications.json`                        | `items[]`                                                                 | Stacked ResearchLinkGrid                                       |
| Conferences           | `research/conferences.json`                         | `items[]`                                                                 | Stacked ResearchLinkGrid                                       |
| Speakers              | `research/speakers.json`                            | `items[]`                                                                 | SpeakingCard stack                                             |
| Awards                | `recognition/awards.json`                           | `items[]` (level, title, nominator, reason, …)                            | Search + level filter chips; recog card grid                   |
| Kaggle                | `recognition/kaggle.json`                           | `rank`, `profile`, `items[]`                                              | Global rank hero; medal filters; CompetitionCard grid          |
| Education             | `recognition/education.json`                        | `intro`, `records[]`                                                      | Split credential panel — degree hero, 2×2 stat grid, achievement highlight |
| Technical Vision      | `person/profile.json`                               | `vision.heading`, `vision.paragraphs[]`                                   | Multimodal AI narrative                                        |
| Vision Board          | `work/vision-board.json`                            | `hubs[]`, `programs[]`, `orgCards[]`                                      | Infographic layout                                             |
| Strategic Impact      | `work/strategic-impact.json`                        | `metrics[]`, `highlights[]`, optional rich blocks                         | Vision view closing section (`impact` id)                      |
| Contact               | `person/profile.json`                               | `contact[]`, `contactPage`, `contactQuote`                                | Full connect layout                                            |

The renderer maps `site.json.sections[id].source` → file, and `…title` → heading text.

## 4. Responsive behavior

- **Breakpoints (suggested):** mobile `< 640px`, tablet `640–1024px`, desktop `> 1024px`.
- **Mobile-first**: single column; project grids collapse to 1 column on narrow viewports.
- **Tablet:** Projects 2-column; Experience tabbed rail keeps a single column.
- **Desktop:** Projects 2–3 column; comfortable max content width (~70–80ch for text).
- Header collapses to a hamburger menu below the tablet breakpoint.
- No fixed heights that clip content; respect dynamic viewport units on mobile.

## 5. Navigation behavior

- Sticky header; condense/elevate on scroll (subtle).
- Active-route indicator in the header; dot navigation highlights the active section within the current view.
- Anchor clicks smooth-scroll with offset for the sticky header; honor `prefers-reduced-motion`.
- Mobile menu: focus-trapped while open, `Esc` closes, returns focus to the toggle.
- "Back to top" affordance in the footer.

## 6. States to design

- Empty/hidden section: if a `site.json.sections[id].visible` is `false`, skip it entirely.
- External link affordance (icon) on Publications/Conferences/Kaggle/Contact.
- Hover/focus/active for all interactive elements (see `accessibility.md`).
- 404: friendly message + link home + nav.

## Related docs

- [Architecture](./architecture.md) — how sections map to components
- [Content editing](./content-editing.md) — changing JSON per section
- [Requirements](./requirements.md) — feature scope
- [Design direction](./design-direction.md) — visual treatment per component type
