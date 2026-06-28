# Site Specification

Tech-agnostic specification: information architecture, routing options, component hierarchy,
per-section content contract, and behavior. Pairs with `requirements.md` (the "what") — this
is the "how it's structured".

## 1. Information architecture

Primary structure: **multi-page**, grouping the full section set (see `content/site.json →
sections`) into a few themed routes (keeps the nav short while giving heavy content its own URL).

```
/              About (Home)  → hero, about, featured-projects, impact, vision, leadership,
                               timeline, affiliations, featured-publications, contact-teaser
/experience    Experience    → experience-intro, experience, mentorship, impact, contact-teaser
/projects      Projects      → projects-intro, featured-case-studies, projects, contact-teaser
/research      Research      → publications, conferences, speakers, kaggle
/recognition   Recognition   → awards, education, contact-teaser
/vision        Vision        → vision-board
/contact       Contact       → contact
/404           custom not-found page
```

Nav also includes **Resume** (external PDF link from `site.json.pages` with `"external": true`).

Routes and their section grouping are defined once in `content/site.json → pages` (each page has
an `id`, `path`, `label`, `seo`, and an ordered `sections` array). The renderer
(`SectionRenderer`) iterates each page's `sections` — do not hardcode section order or grouping
in markup. Section ids and the per-section content contract below are independent of how sections
are grouped into pages.

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
│   ├── AboutSection           ← person/profile.json (aboutIntro, aboutCards[])
│   ├── FeaturedProjectsSection← work/projects.json (featured: true)
│   ├── ImpactSection          ← work/strategic-impact.json (journey/programs/leadershipCards)
│   ├── VisionSection          ← person/profile.json.vision (heading, paragraphs[])
│   ├── LeadershipSection      ← person/profile.json.leadershipPhilosophy
│   ├── SkillsSection          ← work/skills.json
│   ├── CareerTimelineSection  ← work/experience.json.roles[] (compact rail)
│   ├── AffiliationsSection    ← person/affiliations.json
│   ├── FeaturedPublications   ← research/publications.json (top items)
│   ├── ContactTeaserSection   ← person/profile.json (CTA to /contact)
│   ├── ExperienceIntroSection ← work/experience.json (title, intro, snapshot[])   (MetricCard)
│   ├── ExperienceSection      ← work/experience.json.roles[]            (Timeline)
│   │   └── RoleCard → ProjectGroup → Bullet (respects tier)
│   ├── ProjectsIntroSection   ← work/projects.json (title, intro, snapshot[])     (MetricCard)
│   ├── FeaturedCaseStudies    ← work/projects.json (featured: true)    (ProjectCaseStudyCard)
│   ├── ProjectsSection        ← work/projects.json.projects[]           (CardGrid)
│   │   └── ProjectCard → (optional) ProjectDetail
│   ├── GenerativeAISection    ← research/generative-ai.json.items[]         (inline text list)
│   ├── SkillsSection          ← work/skills.json.categories[]           (CategoryGroup → Chip)
│   ├── MentorshipSection      ← work/mentorship.json.items[]            (inline text list)
│   ├── EducationSection       ← recognition/education.json.records[]
│   ├── AwardsSection          ← recognition/awards.json.items[]                (AwardPill)
│   ├── PublicationsSection    ← research/publications.json.items[]          (ResearchCard)
│   ├── ConferencesSection     ← research/conferences.json.items[]          (ResearchCard)
│   ├── KaggleSection          ← recognition/kaggle.json (rank + items[])       (inline link list)
│   └── ContactSection         ← person/profile.json.contact[]            (ContactLink)
└── Footer (copyright, social links, back-to-top)
```

Reused primitives (define once, use everywhere): `Section` (heading + anchor + container),
`MetricCard`, `Chip`, `ResearchCard`, `AwardPill`, `ContactLink`,
`ProjectCaseStudyCard`.

## 3. Per-section content contract

| Section | Source file | Shape consumed | Rendering notes |
|---------|-------------|----------------|-----------------|
| Hero | `person/profile.json` | `headline`, `metrics[]`, `ctas[]`, photo | Split layout; metric cards; value-oriented CTAs |
| About | `person/profile.json` | `aboutIntro`, `aboutCards[]` | Intro paragraph + scan cards |
| Featured Projects | `work/projects.json` | `projects[]` where `featured: true` | Top 3 cards; link to `/projects` |
| Strategic Impact | `work/strategic-impact.json` | `metrics[]`, `highlights[]`, optional `journey[]`, `programs[]`, `leadershipCards[]` | Metric grid + highlights; optional journey/programs/cards on `/experience` |
| Vision | `person/profile.json` | `vision.heading`, `vision.paragraphs[]` | Narrative prose block (`variant="alt"`) |
| Leadership | `person/profile.json` | `leadershipPhilosophy.statement` | Pull-quote block |
| Skills | `work/skills.json` | `categories[] -> skills[]` | Grouped skill chips |
| Career Timeline | `work/experience.json` | `roles[]` (org, position, period, mission) | Compact vertical rail |
| Affiliations | `person/affiliations.json` | `items[].name`, optional `items[].logo` | Org list with optional logo SVG in `public/assets/logos/` |
| Featured Publications | `research/publications.json` | `items[]` (top N) | Link cards; CTA to `/research` |
| Contact Teaser | `person/profile.json` | (static lead + CTA) | Button to `/contact` |
| Experience Intro | `work/experience.json` | `title`, `intro`, `snapshot[]` | Section lead-in + metric cards |
| Experience | `work/experience.json` | `roles[] -> projects[] -> bullets[]` | Full timeline; optional `mission` per role |
| Projects Intro | `work/projects.json` | `title`, `intro`, `snapshot[]` | Section lead-in + metric cards |
| Featured Case Studies | `work/projects.json` | `projects[]` where `featured: true` | Flagship case-study cards (full detail) |
| Projects | `work/projects.json` | case-study fields + `highlights[]`, `tags[]` | Problem/solution/architecture/impact blocks |
| Generative AI | `research/generative-ai.json` | `items[].text` | Bullet list |
| Mentorship | `work/mentorship.json` | `items[].text` | Bullet list |
| Education | `recognition/education.json` | `records[]` | Degree, institution, period, gpa, achievement |
| Awards | `recognition/awards.json` | `items[]` (`label`, `detail`) | Label + detail rows |
| Publications | `research/publications.json` | `items[]` (`label`, `title`, `url`) | External links |
| Conferences | `research/conferences.json` | `items[]` (`label`, `title`, `url`) | External links; `[SPEAKER]/[PRESENTER]` tags in label |
| Speakers | `research/speakers.json` | `items[]` (`label`, `title`, `url`) | Speaking engagements (ResearchCard) |
| Vision Board | `work/vision-board.json` | `hubs[]`, `programs[]`, `orgCards[]` | Infographic layout on `/vision` |
| Kaggle | `recognition/kaggle.json` | `rank`, `profile`, `items[]` (`label`, `url`) | Show rank prominently; link each competition (also on `/research`) |
| Contact | `person/profile.json` | `contact[]` (email, linkedin, kaggle, location) | `mailto:` for email; external links `rel="noopener noreferrer"` |

The renderer should map `site.json.sections[id].source` → file, and `…title` → heading text.

## 4. Responsive behavior

- **Breakpoints (suggested):** mobile `< 640px`, tablet `640–1024px`, desktop `> 1024px`.
- **Mobile-first**: single column; Skills chips wrap; Projects grid collapses to 1 column.
- **Tablet:** Projects 2-column; timeline keeps a single rail.
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
