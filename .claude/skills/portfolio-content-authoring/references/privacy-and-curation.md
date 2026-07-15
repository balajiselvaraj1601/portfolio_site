# Privacy and curation

The public site is a **curated snapshot**, not a full résumé dump. These
constraints are load-bearing - one is a repo Hard Rule. Sources of truth:
`AGENTS.md - Hard Rules`, `content/README.md - Curation rules applied`, and
`docs/content-editing.md`.

## Hard privacy rules (never violate)

1. **No phone number, anywhere.** The résumé's phone field is omitted from all
   content. `AGENTS.md` Hard Rule 3 and `content/README.md` both state this.
   Contact channels are constrained by `contactTypeSchema` in `src/schemas/person.ts`
   (`email`, `linkedin`, `github`, `kaggle`, `location`) - `phone` is not a
   member, so a phone contact will not even validate.
2. **No References section.** The résumé's `references` block is private and must
   never be surfaced. `AGENTS.md` Hard Rule 3 and `content/README.md`.

Verify after any content change or re-derivation (both must return nothing):

```bash
grep -ri phone content/
grep -ri reference content/
```

## Provenance and re-derivation

Content is derived from
`resume_builder/jobs/generalized_ai_tech_lead/resume/resume_healthcare.json`
(schemaVersion 3), per `content/README.md`. That résumé JSON is the upstream
source. When it changes, **re-derive** the affected `content/` files rather than
editing résumé and portfolio independently - otherwise the two drift. Follow the
mapping in `docs/content-map.md` (see `content/README.md` file table for the
per-file résumé source).

## Other curation constraints (from `content/README.md`)

- **Contact** in `person/profile.json` carries email, LinkedIn, Kaggle, GitHub,
  and location only - no phone.
- **Kaggle** uses the compact list (`kaggle_compact` in the résumé). The raw
  per-competition `kaggle` list is intentionally dropped; don't reintroduce it.
- **One definition.** Organization names/URLs live once in
  `content/pages/99_entities.json` and are referenced by slug - never re-typed per section.

## When authoring new content

- Do not paste in anything the curation rules excluded (phone, references, the raw
  Kaggle list).
- Keep public copy public-appropriate: this deploys to GitHub Pages at a public
  URL (`AGENTS.md - What This Repo Is`).
- Run the two greps above before handoff, alongside `npm run build`.
