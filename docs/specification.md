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
/              About (default)  → viewSections: hero, thirukural, leadership, skills
/#experience   Experience       → experience-intro, experience, mentorship
/#projects     Projects         → projects-intro, featured-case-studies, projects
/#research     Research         → publications, conferences, speakers
/#recognition  Recognition      → awards, kaggle, education
/#vision       Vision           → technical-vision, vision-board, impact
/#contact      Contact          → contact
/experience … /contact         → redirect stubs (noindex) → /#{viewAnchor}
/404           custom not-found page
```

Nav also includes **Resume** (external PDF link from `site.json.pages` with `"external": true`).

Section ids and grouping are defined in `content/site.json → pages` (each content page has an
`id`, `path`, `label`, `seo`, `sections`, `viewSections`, and optional `viewAnchor`). The home
page's `sections` array is the full DOM order; `viewSections` on each page defines which sections
belong to that nav group for scroll targets and scroll-spy. The renderer (`SectionRenderer`)
iterates the home section list — do not hardcode section order in markup.

## 2. Component hierarchy (logical, framework-neutral)

```
App / Layout
├── Head (SEO meta, OG/Twitter, JSON-LD, favicon, manifest)  ← seo.md
├── ThemeProvider (light/dark, system default, persisted)
├── Header
│   ├── Brand (name)
│   ├── Nav (from site.json.pages, active-route indicator)
│   ├── ThemeToggle
│   └── ResumeDownloadButton (site.json.resume)
├── Main
│   ├── HeroSection            ← person/profile.json (headline, metrics[], ctas[])
│   ├── ThirukuralSection      ← person/profile.json (heroQuote)
│   ├── LeadershipSection      ← person/profile.json (aboutIntro, aboutCards[], leadershipPhilosophy) + collaborations.json
│   ├── SkillsSection          ← work/skills.json.categories[]           (CategoryGroup → Chip)
│   ├── AffiliationsSection    ← person/affiliations.json
│   ├── PublicationsSection    ← research/publications.json.items[]      (ResearchLinkGrid)
│   ├── ContactSection         ← person/profile.json.contact[]           (full connect layout)
│   ├── ExperienceIntroSection ← work/experience.json (title, intro, snapshot[])   (MetricCard)
│   ├── ExperienceSection      ← work/experience.json.roles[]            (Timeline)
│   │   └── RoleCard → ProjectGroup → Bullet (respects tier)
│   ├── ProjectsIntroSection   ← work/projects.json (title, intro, snapshot[])     (MetricCard)
│   ├── FeaturedCaseStudies    ← work/projects.json (featured: true)    (ProjectCaseStudyCard)
│   ├── ProjectsSection        ← work/projects.json.projects[]           (CardGrid)
│   │   └── ProjectCard → (optional) ProjectDetail
│   ├── MentorshipSection      ← work/mentorship.json.items[]            (inline text list)
│   ├── EducationSection       ← recognition/education.json.records[]
│   ├── AwardsSection          ← recognition/awards.json.items[]                (AwardPill)
│   ├── PublicationsSection    ← research/publications.json.items[]          (ResearchLinkGrid)
│   ├── ConferencesSection     ← research/conferences.json.items[]          (ResearchLinkGrid)
│   ├── SpeakersSection        ← research/speakers.json.items[]             (ResearchLinkGrid)
│   ├── KaggleSection          ← recognition/kaggle.json (rank + items[])       (inline link list)
│   └── ContactSection         ← person/profile.json.contact[]            (full connect layout)
└── Footer (copyright, social links, back-to-top)
```

Reused primitives (define once, use everywhere): `Section` (heading + anchor + container),
`MetricCard`, `Chip`, `ResearchCard`, `AwardPill`, `ContactLink`,
`ProjectCaseStudyCard`.

## 3. Per-section content contract

| Section | Source file | Shape consumed | Rendering notes |
|---------|-------------|----------------|-----------------|
| Hero | `person/profile.json` | `headline`, `metrics[]`, `ctas[]`, photo | Split layout; metric cards; value-oriented CTAs |
| Thirukural | `person/profile.json` | `heroQuote` | Couplet + portrait band between hero and profile |
| Leadership | `person/profile.json`, `person/collaborations.json` | `aboutIntro`, `aboutCards[]`, `leadershipPhilosophy`, collaboration logos | Bio → scan cards → philosophy quote → theme cards → logo strip |
| Featured Case Studies | `work/projects.json` | `projects[]` where `featured: true` | Flagship case-study cards (full detail); optional CTA to `/projects` on home |
| Strategic Impact | `work/strategic-impact.json` | `metrics[]`, `highlights[]`, optional `journey[]`, `programs[]`, `leadershipCards[]` | Metric grid + highlights; optional journey/programs/cards on `/experience` |
| Vision Board | `work/vision-board.json` | `hubs[]`, `programs[]`, `orgCards[]` | Infographic layout on `/` and `/vision` |
| Technical Vision | `person/profile.json` | `vision.heading`, `vision.paragraphs[]` | Multimodal AI narrative (no collaborations sidebar) |
| Skills | `work/skills.json` | `categories[] -> skills[]` | Grouped skill chips |
| Affiliations | `person/affiliations.json` | `items[].name`, optional `items[].logo` | Org list with optional logo SVG in `public/assets/logos/` |
| Publications | `research/publications.json` | `items[]` (`label`, `title`, `url`, `description`) | Stacked ResearchLinkGrid; optional CTA to `/research` on home |
| Contact | `person/profile.json` | `contact[]`, `contactPage`, `contactQuote` | Full connect layout on all routes that include `contact` |
| Experience Intro | `work/experience.json` | `title`, `intro`, `snapshot[]` | Section lead-in + metric cards |
| Experience | `work/experience.json` | `roles[] -> projects[] -> bullets[]` | Interactive tabbed timeline + role panels; optional `mission` per role |
| Projects Intro | `work/projects.json` | `title`, `intro`, `snapshot[]` | Section lead-in + metric cards |
| Projects | `work/projects.json` | case-study fields + `highlights[]`, `tags[]` | Problem/solution/architecture/impact blocks |
| Mentorship | `work/mentorship.json` | `items[].text` | Bullet list |
| Education | `recognition/education.json` | `records[]` | Degree, institution, period, gpa, achievement |
| Awards | `recognition/awards.json` | `items[]` (`label`, `detail`) | Label + detail rows |
| Conferences | `research/conferences.json` | `items[]` (`label`, `title`, `url`) | Stacked ResearchLinkGrid; `[SPEAKER]/[PRESENTER]` tags in label |
| Speakers | `research/speakers.json` | `items[]` (`label`, `title`, `url`, optional `youtube`, `image`) | Stacked ResearchLinkGrid |
| Kaggle | `recognition/kaggle.json` | `rank`, `profile`, `items[]` (`label`, `url`) | Show rank prominently; link each competition on `/recognition` |

The renderer should map `site.json.sections[id].source` → file, and `…title` → heading text.

## 4. Responsive behavior

- **Breakpoints (suggested):** mobile `< 640px`, tablet `640–1024px`, desktop `> 1024px`.
- **Mobile-first**: single column; Skills chips wrap; Projects grid collapses to 1 column.
- **Tablet:** Projects 2-column; Experience tabbed rail keeps a single column.
- **Desktop:** Projects 2–3 column; comfortable max content width (~70–80ch for text).
- Header collapses to a hamburger menu below the tablet breakpoint.
- No fixed heights that clip content; respect dynamic viewport units on mobile.

## 5. Navigation behavior

- Sticky header; condense/elevate on scroll (subtle).
- Active-route indicator in the header; optional dot navigation highlights the active section.
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
