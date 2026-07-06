# Content Map — Resume → Portfolio

Traceability from the source resume to the portfolio content layer. Source:
`resume_builder/jobs/generalized_ai_tech_lead/resume/resume_healthcare.json` (schemaVersion 3).

## Mapping

| Resume location                             | Portfolio section    | `content/` file              | Transformation                                                                                                         |
| ------------------------------------------- | -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `personal.name`, `personal.summary.lines[]` | Hero, About          | `person/profile.json`        | Title set to "Technical AI Leader" (resume title was blank); 5 summary lines verbatim                                  |
| `personal.contact[]`                        | Contact              | `person/profile.json`        | **Phone dropped.** Kept: email, LinkedIn, Kaggle, location                                                             |
| `sections[id="funds"]` ("Strategic Impact") | Vision (org impact)  | `work/vision-board.json`     | Org impact cards derived from strategic-impact narrative                                                               |
| `sections[id="experience"]`                 | Experience           | `work/experience.json`       | 6 roles, all projects + bullets, `tier` preserved                                                                      |
| `sections[id="education"]`                  | Education            | `recognition/education.json` | 1 record; expanded with `intro`, `field`, `achievementDetail`, `summary` for Recognition credential card               |
| `sections[id="awards"]`                     | Awards               | `recognition/awards.json`    | 22 items verbatim                                                                                                      |
| `sections[id="publications"]`               | Publications         | `research/publications.json` | 3 items verbatim                                                                                                       |
| `sections[id="conferences"]`                | Conferences          | `research/conferences.json`  | 3 items verbatim                                                                                                       |
| `sections[id="kaggle_compact"]`             | Kaggle               | `recognition/kaggle.json`    | 9 competitions (rank-ordered case-study cards) + global rank line; derived from `resume_builder/wiki/projects/kaggle/` |
| (derived)                                   | Collaborations strip | `person/collaborations.json` | Organization logos on About                                                                                            |
| (derived)                                   | Vision (programs)    | `work/vision-board.json`     | Program cards and infographic hubs                                                                                     |

## Intentionally excluded

| Resume location                  | Why excluded                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `personal.contact[type="phone"]` | Personal phone — privacy on a public site                                                              |
| `sections[id="references"]`      | References (named individuals) — private, not for public display                                       |
| `sections[id="kaggle"]` (raw)    | Duplicate of per-competition wiki pages; long descriptions now live in `recognition/kaggle.json` items |
| `sections[id="generative_ai"]`   | Not part of final site scope                                                                           |
| `sections[id="tools"]`           | Skills section not in final site                                                                       |
| `sections[id="mentorship"]`      | Mentorship section not in final site                                                                   |

## Notes / decisions

- **Title:** the resume's `personal.title` is blank; "Technical AI Leader" is taken from the
  positioning contract (`ai-tech-lead-positioning.md`) and summary line 1. Adjust the `title`
  field in `person/profile.json` if a different title is preferred.
- **Canonical facts** (team scale 1→12 across 5 countries; "$3M+ initiative = AI Lead *within*";
  $20M–$50M is a program-level projection) are preserved verbatim — do not rephrase in a way
  that overstates personal scope.
- **No fabrication:** every line traces to the resume or wiki sources. Summaries in
  `recognition/kaggle.json` and nested experience projects are re-presentations of existing bullets, not new claims.
- When the resume is updated, re-derive the affected JSON file(s) under `content/` and re-run the
  verification greps in [Content editing](./content-editing.md).

## Related docs

- [Content editing](./content-editing.md) — how to edit derived files
- [Case study & experience info standard](./case-study-experience-info-standard.md) — ideal field set for Experience roles
- [content/README.md](../content/README.md) — curation rules
- [Requirements](./requirements.md) — privacy acceptance criteria
