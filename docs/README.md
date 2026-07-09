# Documentation Index

Complete reference for the **Balaji Selvaraj** portfolio site — an Astro 4 static site
deployed to GitHub Pages at https://balajiselvaraj1601.github.io.

## Start here

| Doc                                         | Audience       | Purpose                                    |
| ------------------------------------------- | -------------- | ------------------------------------------ |
| [Getting started](./getting-started.md)     | Developers     | Install, run, build, preview               |
| [Go-live checklist](./go-live-checklist.md) | Owner / DevOps | Publish to GitHub Pages step-by-step       |
| [Content editing](./content-editing.md)     | Content owner  | Change site copy via JSON under `content/` |
| [Assets](./assets.md)                       | Content owner  | Résumé PDF, OG image, favicons, images     |

## Architecture & specs

| Doc                                                                             | Purpose                                              |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [Architecture](./architecture.md)                                               | Repo layout, data flow, build pipeline, key files    |
| [Environment languages & skills](./environment-languages-skills.md)             | Languages, tooling, and skills for programmatic work |
| [Requirements](./requirements.md)                                               | MoSCoW feature list and acceptance criteria          |
| [Specification](./specification.md)                                             | IA, routes, component hierarchy, section contracts   |
| [Content map](./content-map.md)                                                 | Résumé → portfolio traceability                      |
| [Design direction](./design-direction.md)                                       | Visual tokens, typography, motion principles         |
| [Typography](./typography.md)                                                   | Font mapping: three typefaces, element → font spec   |
| [Box color history](./box-color-history.md)                                     | Color system decision history and token cascade      |
| [About page content](./about-page-content.md)                                   | Resume-sourced About section content candidates      |
| [Case study experience info standard](./case-study-experience-info-standard.md) | Ideal format for Experience role and project entries |

## Icons & assets

| Doc                                                       | Purpose                                                |
| --------------------------------------------------------- | ------------------------------------------------------ |
| [Icon blend strategy](./icon-blend-strategy.md)           | Vector delivery, rendered sizes, color blending        |
| [Icon collections install](./icon-collections-install.md) | Square-center PNG → SVG marks refresh pipeline         |
| [Icon size inventory](./icon-size-inventory.md)           | Every icon rendered on-site with effective pixel sizes |

## Quality & platform

| Doc                                     | Purpose                                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [SEO](./seo.md)                         | Meta tags, OG/Twitter, JSON-LD, sitemap, robots                                                                                                                                                                     |
| [Accessibility](./accessibility.md)     | WCAG 2.1 AA checklist                                                                                                                                                                                               |
| [Deployment](./deployment.md)           | GitHub Pages target, CI/CD, artifact checklist                                                                                                                                                                      |
| [Troubleshooting](./troubleshooting.md) | Common build, deploy, and content errors                                                                                                                                                                            |
| Audits                                  | [simplification-refactor-2026-07-03.md](./audits/simplification-refactor-2026-07-03.md), [logo-manifest.csv](./audits/logo-manifest.csv), [full-site-review-2026-07-05.md](./audits/full-site-review-2026-07-05.md) | Changelog and logo inventory |
| [Page team](./page-team.md)             | Multi-agent design consistency workflow                                                                                                                                                                             |
| [Task runner](./task-runner.md)         | Long-running multi-step agent batches                                                                                                                                                                               |

## Agent system

| Doc                                               | Purpose                                               |
| ------------------------------------------------- | ----------------------------------------------------- |
| [Agent system summary](./AGENT-SYSTEM-SUMMARY.md) | Full agent ecosystem assessment and specialist agents |

## Page briefs

Per-view content intent and section weights — used by page agents during audits.

| Doc                                         | View                                |
| ------------------------------------------- | ----------------------------------- |
| [About / Home](./page-briefs/home.md)       | Hero, Thirukural, About             |
| [Experience](./page-briefs/experience.md)   | Career timeline                     |
| [Research](./page-briefs/research.md)       | Publications, Conferences, Speakers |
| [Recognition](./page-briefs/recognition.md) | Awards, Kaggle, Education           |
| [Vision](./page-briefs/vision.md)           | Vision Programs, Vision Impact      |
| [Contact](./page-briefs/contact.md)         | Contact CTA                         |

## Related files outside `docs/`

| File                                         | Purpose                                     |
| -------------------------------------------- | ------------------------------------------- |
| [../README.md](../README.md)                 | Project overview and quick commands         |
| [../AGENTS.md](../AGENTS.md)                 | Agent/AI coding guidelines                  |
| [../content/README.md](../content/README.md) | Content layer provenance and curation rules |

## Documentation map

```mermaid
flowchart TD
  GS[getting-started.md] --> ARCH[architecture.md]
  GS --> ELS[environment-languages-skills.md]
  GS --> CE[content-editing.md]
  CE --> CM[content-map.md]
  CE --> SPEC[specification.md]
  ARCH --> DEP[deployment.md]
  DEP --> GL[go-live-checklist.md]
  GL --> TS[troubleshooting.md]
  SPEC --> REQ[requirements.md]
  SPEC --> DD[design-direction.md]
  SPEC --> A11Y[accessibility.md]
  SPEC --> SEO[seo.md]
  CE --> ASSETS[assets.md]
  SPEC --> TYPO[typography.md]
  ASSETS --> IBS[icon-blend-strategy.md]
  ARCH --> PTEAM[page-team.md]
```

## Quick commands

```bash
npm ci              # install pinned dependencies
npm run dev         # local dev server (HMR)
npm run build       # production build → dist/
npm run preview     # serve dist/ locally
```
