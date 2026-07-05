# Content Layer

Tech-agnostic, presentation-free content for the portfolio. Every section of the site
derives from a file here — this is the **single source of truth** for site content.

## Provenance

This content is a **curated public snapshot derived from**
`resume_builder/jobs/generalized_ai_tech_lead/resume/resume_healthcare.json`
(schemaVersion 3). The resume JSON remains the upstream source; when the resume changes,
re-derive these files rather than editing both independently.

## Curation rules applied

- **No phone number.** The resume's phone field is omitted everywhere (public-site privacy).
- **No References.** The resume's `references` section is private and is not surfaced.
- **Contact** in `person/profile.json` includes email, LinkedIn, Kaggle, GitHub, and location (no phone).
- **Kaggle:** uses the compact list (`kaggle_compact` in the resume); the duplicate raw
  `kaggle` list with per-competition descriptions is intentionally dropped.

## Files

| File                         | Drives                              | Source in resume                    |
| ---------------------------- | ----------------------------------- | ----------------------------------- |
| `site.json`                  | Site meta, nav, SEO defaults, theme | derived                             |
| `person/profile.json`        | Hero, About, Contact                | `personal` (no phone)               |
| `person/collaborations.json` | Collaborations strip                | derived                             |
| `work/vision-board.json`     | Vision (programs + org impact)      | derived                             |
| `work/experience.json`       | Experience timeline                 | `sections[id="experience"]`         |
| `research/publications.json` | Publications                        | `sections[id="publications"]`       |
| `research/conferences.json`  | Conferences                         | `sections[id="conferences"]`        |
| `research/speakers.json`     | Speaking Engagements                | derived                             |
| `recognition/education.json` | Education                           | `sections[id="education"]`          |
| `recognition/awards.json`    | Awards & Recognition                | `sections[id="awards"]`             |
| `recognition/kaggle.json`    | Kaggle Competitions                 | `sections[id="kaggle_compact"]`     |
| `entities.json`              | Entity URL/name registry            | derived                             |

Project narratives are nested inside `work/experience.json` → `roles[].projects[]`.

## Editing guide

See [docs/content-editing.md](../docs/content-editing.md) for step-by-step instructions,
schema rules, and common tasks (reorder sections, update SEO, add bullets, etc.).
