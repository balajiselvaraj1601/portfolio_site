# Content Layer

Tech-agnostic, presentation-free content for the portfolio. Every section of the site
derives from a file here - this is the **single source of truth** for site content.

## Provenance

This content is a **curated public snapshot derived from**
`resume_builder/jobs/generalized_ai_tech_lead/resume/resume_healthcare.json`
(schemaVersion 3). The resume JSON remains the upstream source; when the resume changes,
re-derive these files rather than editing both independently.

## Curation rules applied

- **No phone number.** The resume's phone field is omitted everywhere (public-site privacy).
- **No References.** The resume's `references` section is private and is not surfaced.
- **Contact** in `pages/06_contact.json` includes email, LinkedIn, Kaggle, GitHub, and location (no phone).
- **Kaggle:** uses the compact list (`kaggle_compact` in the resume); the duplicate raw
  `kaggle` list with per-competition descriptions is intentionally dropped.

## Files

All production content JSON now lives in `content/pages/`, numbered by visible
nav-view order.

| File                        | Drives                                                         | Source in resume                |
| --------------------------- | -------------------------------------------------------------- | ------------------------------- |
| `pages/00_site.json`        | Site meta, nav, SEO defaults, section wiring, shared UI labels | derived                         |
| `pages/01_about.json`       | Hero, Thirukural, About, collaborations                        | `personal` + derived            |
| `pages/02_experience.json`  | Experience timeline                                            | `sections[id="experience"]`     |
| `pages/03_research.json`    | Publications, conferences, speaking engagements                | research sections + derived     |
| `pages/04_recognition.json` | Awards, Kaggle competitions, education                         | recognition sections            |
| `pages/05_vision.json`      | Vision programs + organizational impact                        | derived                         |
| `pages/06_contact.json`     | Contact page copy and public contact channels                  | `personal.contact[]` (no phone) |
| `pages/99_entities.json`    | Shared entity URL/name registry                                | derived                         |

Project narratives are nested inside `pages/02_experience.json` - `roles[].projects[]`.

## Editing guide

See [docs/content-editing.md](../docs/content-editing.md) for step-by-step instructions,
schema rules, and common tasks (reorder sections, update SEO, add bullets, etc.).
