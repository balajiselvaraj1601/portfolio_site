# Site Specification

Tech-agnostic specification: information architecture, routing options, component hierarchy,
per-section content contract, and behavior. Pairs with `requirements.md` (the "what") — this
is the "how it's structured".

## 1. Information architecture

Recommended primary structure: **single-page** with anchored sections (simplest for GitHub
Pages, best for a portfolio's linear narrative), with **two optional sub-routes** for depth.

```
/                      Single-page portfolio (all sections, anchored)
  #hero
  #about
  #impact
  #experience
  #projects
  #generative-ai
  #skills
  #mentorship
  #education
  #awards
  #publications
  #conferences
  #kaggle
  #contact
/projects/:id          (optional) dedicated project detail page — mirrors projects.json[id]
/404                   custom not-found page
```

Section order is defined once in `content/site.json → nav`. The renderer must iterate that
array — do not hardcode section order in markup.

> Routing is a stack decision. If the chosen stack favors multi-page (one route per section),
> keep the **same ids and order** from `site.json`. The content contract below is identical
> either way.

## 2. Component hierarchy (logical, framework-neutral)

```
App / Layout
├── Head (SEO meta, OG/Twitter, JSON-LD, favicon, manifest)  ← seo.md
├── ThemeProvider (light/dark, system default, persisted)
├── Header
│   ├── Brand (name)
│   ├── Nav (from site.json.nav, active-section indicator)
│   ├── ThemeToggle
│   └── ResumeDownloadButton (site.json.resume)
├── Main
│   ├── HeroSection            ← profile.json (name, title, tagline, primary CTAs)
│   ├── AboutSection           ← profile.json.summary[]
│   ├── ImpactSection          ← strategic-impact.json.items[]      (BulletList)
│   ├── ExperienceSection      ← experience.json.roles[]            (Timeline)
│   │   └── RoleCard → ProjectGroup → Bullet (respects tier)
│   ├── ProjectsSection        ← projects.json.projects[]           (CardGrid)
│   │   └── ProjectCard → (optional) ProjectDetail
│   ├── GenerativeAISection    ← generative-ai.json.items[]         (BulletList)
│   ├── SkillsSection          ← skills.json.categories[]           (CategoryGroup → Chip)
│   ├── MentorshipSection      ← mentorship.json.items[]            (BulletList)
│   ├── EducationSection       ← education.json.records[]
│   ├── AwardsSection          ← awards.json.items[]                (LabeledDetailList)
│   ├── PublicationsSection    ← publications.json.items[]          (LinkList)
│   ├── ConferencesSection     ← conferences.json.items[]           (LinkList)
│   ├── KaggleSection          ← kaggle.json (rank + items[])       (LinkList)
│   └── ContactSection         ← profile.json.contact[]
└── Footer (copyright, social links, back-to-top)
```

Reused primitives (define once, use everywhere): `Section` (heading + anchor + container),
`BulletList`, `LinkList`, `LabeledDetailList`, `Chip/Tag`, `Card`, `IconLink`.

## 3. Per-section content contract

| Section | Source file | Shape consumed | Rendering notes |
|---------|-------------|----------------|-----------------|
| Hero | `profile.json` | `name`, `title`, `location`, primary CTAs | Above the fold; CTAs → Projects, Contact, Resume |
| About | `profile.json` | `summary[]` (5 lines) | One paragraph or 5 short lines |
| Strategic Impact | `strategic-impact.json` | `items[].text` | Emphasize $ / metrics; ordered as given |
| Experience | `experience.json` | `roles[] → projects[] → bullets[]` | Timeline; `tier:"secondary"` = de-emphasized |
| Projects | `projects.json` | `projects[]` (`name`, `summary`, `highlights[]`, `tags[]`, `domain`) | Card grid; optional detail view |
| Generative AI | `generative-ai.json` | `items[].text` | Bullet list |
| Skills | `skills.json` | `categories[] → skills[]` | Grouped chips by category |
| Mentorship | `mentorship.json` | `items[].text` | Bullet list |
| Education | `education.json` | `records[]` | Degree, institution, period, gpa, achievement |
| Awards | `awards.json` | `items[]` (`label`, `detail`) | Label + detail rows |
| Publications | `publications.json` | `items[]` (`label`, `title`, `url`) | External links |
| Conferences | `conferences.json` | `items[]` (`label`, `title`, `url`) | External links; `[SPEAKER]/[PRESENTER]` tags in label |
| Kaggle | `kaggle.json` | `rank`, `profile`, `items[]` (`label`, `url`) | Show rank prominently; link each competition |
| Contact | `profile.json` | `contact[]` (email, linkedin, kaggle, location) | `mailto:` for email; external links `rel="noopener noreferrer"` |

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
- Active-section indicator via scroll-spy (single-page) or active route (multi-page).
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
