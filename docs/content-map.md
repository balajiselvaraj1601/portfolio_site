# Content Map — Resume → Portfolio

Traceability from the source resume to the portfolio content layer. Source:
`resume_builder/jobs/generalized_ai_tech_lead/resume/resume_healthcare.json` (schemaVersion 3).

## Mapping

| Resume location                             | Portfolio section         | `content/` file                      | Transformation                                                                                                         |
| ------------------------------------------- | ------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `personal.name`, `personal.summary.lines[]` | Hero, About               | `person/profile.json`                | Title set to "Technical AI Leader" (resume title was blank); 5 summary lines verbatim                                  |
| `personal.contact[]`                        | Contact                   | `person/profile.json`                | **Phone dropped.** Kept: email, LinkedIn, Kaggle, location                                                             |
| `sections[id="funds"]` ("Strategic Impact") | Strategic Impact          | `work/strategic-impact.json`         | 7 items verbatim, order preserved                                                                                      |
| `sections[id="experience"]`                 | Experience                | `work/experience.json`               | 6 roles, all projects + bullets, `tier` preserved                                                                      |
| (derived from experience)                   | Projects                  | `work/projects.json`                 | 8 headline projects flattened into cards with summary/highlights/tags/domain                                           |
| `sections[id="generative_ai"]`              | Generative AI _(shelved)_ | `drafts/research/generative-ai.json` | 3 items verbatim; not on live site                                                                                     |
| `sections[id="tools"]` (hidden in resume)   | Skills _(removed)_        | —                                    | Removed from repo (was shelved under `content/temp/`, now deleted)                                                     |
| `sections[id="mentorship"]`                 | Mentorship _(removed)_    | —                                    | Removed from repo (was shelved under `content/temp/`, now deleted)                                                     |
| `sections[id="education"]`                  | Education                 | `recognition/education.json`         | 1 record; expanded with `intro`, `field`, `achievementDetail`, `summary` for Recognition credential card               |
| `sections[id="awards"]`                     | Awards                    | `recognition/awards.json`            | 7 items verbatim                                                                                                       |
| `sections[id="publications"]`               | Publications              | `research/publications.json`         | 3 items verbatim                                                                                                       |
| `sections[id="conferences"]`                | Conferences               | `research/conferences.json`          | 4 items verbatim                                                                                                       |
| `sections[id="kaggle_compact"]`             | Kaggle                    | `recognition/kaggle.json`            | 9 competitions (rank-ordered case-study cards) + global rank line; derived from `resume_builder/wiki/projects/kaggle/` |

## Intentionally excluded

| Resume location                  | Why excluded                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `personal.contact[type="phone"]` | Personal phone — privacy on a public site                                                              |
| `sections[id="references"]`      | References (named individuals) — private, not for public display                                       |
| `sections[id="kaggle"]` (raw)    | Duplicate of per-competition wiki pages; long descriptions now live in `recognition/kaggle.json` items |

## Notes / decisions

- **Title:** the resume's `personal.title` is blank; "Technical AI Leader" is taken from the
  positioning contract (`ai-tech-lead-positioning.md`) and summary line 1. Adjust in
  `person/profile.json` if a different headline is preferred.
- **Canonical facts** (team scale 1→12 across 5 countries; "$3M+ initiative = AI Lead *within*";
  $20M–$50M is a program-level projection) are preserved verbatim — do not rephrase in a way
  that overstates personal scope.
- **No fabrication:** every line traces to the resume or wiki sources. New framing in `work/projects.json`
  and `recognition/kaggle.json` (summaries/tags) is a re-presentation of existing bullets, not new claims.
- When the resume is updated, re-derive the affected JSON file(s) under `content/` and re-run the
  verification greps in [Content editing](./content-editing.md).

## Related docs

- [Content editing](./content-editing.md) — how to edit derived files
- [Case study & experience info standard](./case-study-experience-info-standard.md) — ideal field set + format rules for the two flagship sections
- [content/README.md](../content/README.md) — curation rules
- [Requirements](./requirements.md) — privacy acceptance criteria
