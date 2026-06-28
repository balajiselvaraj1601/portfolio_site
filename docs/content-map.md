# Content Map — Resume → Portfolio

Traceability from the source resume to the portfolio content layer. Source:
`resume_builder/jobs/generalized_ai_tech_lead/resume/resume_healthcare.json` (schemaVersion 3).

## Mapping

| Resume location | Portfolio section | `content/` file | Transformation |
|-----------------|-------------------|-----------------|----------------|
| `personal.name`, `personal.summary.lines[]` | Hero, About | `person/profile.json` | Title set to "Technical AI Leader" (resume title was blank); 5 summary lines verbatim |
| `personal.contact[]` | Contact | `person/profile.json` | **Phone dropped.** Kept: email, LinkedIn, Kaggle, location |
| `sections[id="funds"]` ("Strategic Impact") | Strategic Impact | `work/strategic-impact.json` | 7 items verbatim, order preserved |
| `sections[id="experience"]` | Experience | `work/experience.json` | 6 roles, all projects + bullets, `tier` preserved |
| (derived from experience) | Projects | `work/projects.json` | 8 headline projects flattened into cards with summary/highlights/tags/domain |
| `sections[id="generative_ai"]` | Generative AI *(shelved)* | `drafts/research/generative-ai.json` | 3 items verbatim; not on live site |
| `sections[id="tools"]` (hidden in resume) | Skills | `work/skills.json` | 6 categories; surfaced because a portfolio needs a Skills UI |
| `sections[id="mentorship"]` | Mentorship | `work/mentorship.json` | 2 items verbatim |
| `sections[id="education"]` | Education | `recognition/education.json` | 1 record verbatim |
| `sections[id="awards"]` | Awards | `recognition/awards.json` | 7 items verbatim |
| `sections[id="publications"]` | Publications | `research/publications.json` | 3 items verbatim |
| `sections[id="conferences"]` | Conferences | `research/conferences.json` | 4 items verbatim |
| `sections[id="kaggle_compact"]` | Kaggle | `recognition/kaggle.json` | 9 competitions (compact list) + rank line |

## Intentionally excluded

| Resume location | Why excluded |
|-----------------|--------------|
| `personal.contact[type="phone"]` | Personal phone — privacy on a public site |
| `sections[id="references"]` | References (named individuals) — private, not for public display |
| `sections[id="kaggle"]` (raw) | Duplicate of `kaggle_compact` with long per-competition descriptions; compact version is enough |

## Notes / decisions

- **Title:** the resume's `personal.title` is blank; "Technical AI Leader" is taken from the
  positioning contract (`ai-tech-lead-positioning.md`) and summary line 1. Adjust in
  `person/profile.json` if a different headline is preferred.
- **Canonical facts** (team scale 1→12 across 5 countries; "$3M+ initiative = AI Lead *within*";
  $20M–$50M is a program-level projection) are preserved verbatim — do not rephrase in a way
  that overstates personal scope.
- **No fabrication:** every line traces to the resume. New framing in `work/projects.json`
  (summaries/tags) is a re-presentation of existing bullets, not new claims.
- When the resume is updated, re-derive the affected JSON file(s) under `content/` and re-run the
  verification greps in [Content editing](./content-editing.md).

## Related docs

- [Content editing](./content-editing.md) — how to edit derived files
- [content/README.md](../content/README.md) — curation rules
- [Requirements](./requirements.md) — privacy acceptance criteria
