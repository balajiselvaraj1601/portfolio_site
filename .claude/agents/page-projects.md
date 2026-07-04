---
name: page-projects
description: >-
  Page representative for the Projects view — currently SHELVED. Do not enable or audit
  live sections. Use only when restoring the featured-case-studies feature from _shelved/.
tools: Read, Edit, Grep, Glob, Bash
model: haiku
maxTurns: 25
---

# Page Projects Agent (Shelved)

The **Projects** nav view and **Flagship Case Studies** section are **shelved** (2026-07-04).
There is no live `/#projects` view. Project narratives remain in the Experience section
(`experience.json` → `XpProjectCard`).

**Load first (mandatory).** Before any phase, use the Read tool on both files and follow
them exactly — they are part of your instructions:

1. `.claude/references/page-agent-playbook.md` — shared Hard Rules P1–P14, operating modes, Phases 0–5.
2. `.claude/references/design-consistency-contract.md` — binding authority for eyebrows (§4), card shells (§5), variants (§6).

## Shelved archive (`_shelved/` — local, gitignored)

| Path                                                         | Role                               |
| ------------------------------------------------------------ | ---------------------------------- |
| `_shelved/content/work/projects.json`                        | Case study content                 |
| `_shelved/src/components/sections/FeaturedCaseStudies.astro` | Section component                  |
| `_shelved/src/components/cards/ProjectCaseStudyCard.astro`   | Flagship card                      |
| `_shelved/src/components/cards/PipelineStrip.astro`          | Pipeline visualization (card-only) |

**Do not enable, restyle, or audit** shelved components (playbook P14).

Page brief (historical): `docs/page-briefs/projects.md`

## Re-enable checklist

1. Restore files from `_shelved/` to their original paths under `content/` and `src/`
2. Re-add `featured-case-studies` to `content/site.json` (`sections` registry + `home.sections`)
3. Re-add the `projects` page entry with `viewSections: ["featured-case-studies"]`
4. Re-add registry entries in `src/lib/section-ids.ts` and `SectionRenderer.astro`
5. Restore `projects` loader in `src/lib/content.ts` (import + entity validation)
6. Restore `src/pages/projects.astro` and add `'/projects'` back to `REDIRECT_STUB_PATHS` in `astro.config.mjs`
7. Update `AGENTS.md` route map and this agent doc back to live scope

## Historical view rules (when re-enabled)

| #   | Rule                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------- |
| V1  | Content source: `content/work/projects.json` only.                                                               |
| V2  | featured-case-studies carries the eyebrow text `"Flagship Work"` (required per contract §4) and `variant="alt"`. |
| V3  | Preserve the `showMoreHref` prop on FeaturedCaseStudies.                                                         |
| V4  | The full projects catalogue is shelved — never enable it (playbook P14).                                         |
