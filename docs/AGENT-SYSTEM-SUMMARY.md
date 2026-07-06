# Agent System Summary

**Last synced:** 2026-07-06

[`AGENTS.md`](../AGENTS.md) (repo root) is the quick-reference SSOT for the agent
system — this document is the expanded inventory. When the two disagree, fix this
one to match `AGENTS.md` and the source files under `.claude/`.

## Overview

The portfolio site runs a multi-agent maintenance system: **11 agents**
(`.claude/agents/`), **12 skills** (`.claude/skills/`, also reachable via the
`.agents/skills/` symlink), and **3 slash commands** (`.claude/commands/`). Three
sonnet orchestrators delegate to two sonnet specialists and six haiku page
representatives; shared runtime and authoring rules live in `.claude/references/`.
Each entry below is summarized from the source file's frontmatter — see the file
pointer for the authoritative definition.

## Agents

### Orchestrators (sonnet)

| Agent                         | Model  | Tools                                                   | Role                                                                                                                                                                             | File                                              |
| ----------------------------- | ------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| site-consistency-orchestrator | sonnet | Read, Grep, Glob, Bash, Agent(page-\*, design-guardian) | Runs the Page Consistency Team: reads page-routing.csv, spawns page agents + design guardian in parallel, manages `.cursor/page-team.state.json`; never edits content directly.  | `.claude/agents/site-consistency-orchestrator.md` |
| site-review-fix               | sonnet | Read, Edit, Write, Grep, Glob, Bash, Agent              | End-to-end site review-and-fix: runs `npm run verify`, audits content SSOT, a11y, dead code, design consistency; fixes verified issues; commits if verify passes.                | `.claude/agents/site-review-fix.md`               |
| site-review-auto              | sonnet | Read, Edit, Write, Grep, Glob, Bash, Agent              | Autonomous headless variant of site-review-fix: unconditional commit on verify success, mandatory dated audit doc in `docs/audits/`, design-standardizer sweep, no user prompts. | `.claude/agents/site-review-auto.md`              |

### Specialists (sonnet)

| Agent               | Model  | Tools                        | Role                                                                                                                                                                                                         | File                                    |
| ------------------- | ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| design-guardian     | sonnet | Read, Edit, Grep, Glob, Bash | Binding design authority for cross-view consistency; resolves page-agent conflicts on padding, typography, card shells, tokens. Sole editor of `src/styles/global.css` and shared `ui/`/`cards/` primitives. | `.claude/agents/design-guardian.md`     |
| design-standardizer | sonnet | Read, Edit, Grep, Glob, Bash | Proactive token enforcement: sweeps `src/components/**/*.astro` for hardcoded design values, replaces them with tokens (adding missing ones to `:root` first), consolidates duplicates.                      | `.claude/agents/design-standardizer.md` |

### Page representatives (haiku)

All six use tools `Read, Edit, Grep, Glob, Bash` and share runtime rules from
`.claude/references/page-agent-playbook.md`. Each edits only its own view's
components — never other views.

| Agent            | Model | Role                                                                                    | File                                 |
| ---------------- | ----- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| page-about       | haiku | About view (`view_id=home`): hero, thirukural, and leadership sections.                 | `.claude/agents/page-about.md`       |
| page-contact     | haiku | Contact view: `Contact.astro` only.                                                     | `.claude/agents/page-contact.md`     |
| page-experience  | haiku | Experience view: `Experience.astro` and its view's content JSON.                        | `.claude/agents/page-experience.md`  |
| page-recognition | haiku | Recognition view: Awards, Kaggle, and Education components.                             | `.claude/agents/page-recognition.md` |
| page-research    | haiku | Research view: Publications, Conferences, and Speakers components.                      | `.claude/agents/page-research.md`    |
| page-vision      | haiku | Vision view: `VisionPrograms.astro`, `VisionImpact.astro`, and its view's content JSON. | `.claude/agents/page-vision.md`      |

### Frontmatter wiring

Facts declared in agent frontmatter (beyond name/description/tools/model):

- **Turn budgets (`maxTurns`):** site-review-auto 120, site-review-fix 100,
  site-consistency-orchestrator 80, design-standardizer 60, design-guardian 40,
  each page representative 25.
- **Skill preloads (`skills:`):** site-consistency-orchestrator loads
  `page-consistency-team`; site-review-fix and site-review-auto both load the
  `site-review-fix` skill.
- **Delegation scope:** site-consistency-orchestrator's `Agent(...)` tool is
  restricted to the six page representatives plus design-guardian; the two
  review orchestrators have unrestricted `Agent`.
- **Edit rights:** the orchestrator has no Edit/Write (delegate-only); the review
  orchestrators add Write (audit docs); specialists and page reps have Edit but
  not Write.

## Skills

All paths are `.claude/skills/<name>/SKILL.md`.

| Skill                          | Purpose                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| icon-square-center             | Square-and-center black-background raster PNG icons without resizing — crop to content, trim excess black margin.                     |
| page-consistency-team          | Multi-agent Page Consistency Team workflow: six page reps + design guardian; modes audit / change / implement / full.                 |
| portfolio-a11y-contrast        | Enforce WCAG 2.1 AA — accent-token contrast in both themes plus the post-deploy Lighthouse gate; audits and reports, hands edits off. |
| portfolio-card-shells          | Define, restyle, and recolor box/card shells — padding, radius, border, hover states, `--accent-card` routing, four card tiers.       |
| portfolio-content-authoring    | Schema-first editing of the Zod-validated JSON under `content/` — the copy layer, not the design layer.                               |
| portfolio-icon-audit           | Inventory and resolve icons/logos/images: map every entity to an IconName, logo SVG, or brand file; delegate missing assets.          |
| portfolio-icon-patterns        | Define and change icon/glyph/mark aspects (size, color, chrome, accent) as page-agnostic design patterns.                             |
| portfolio-icon-standardization | Enforce icon size, circular chrome, and color-blending SSOTs — mark tokens, delivery tiers, `--accent-card` inheritance.              |
| portfolio-seo-meta             | Keep SEO/page metadata in sync across split SSOTs: canonical, OG/Twitter, JSON-LD Person, sitemap, robots.txt, OG image.              |
| portfolio-visual-verify        | Render, capture, and diff the site reliably — handles the reveal-animation and scroll-settle screenshot gotchas.                      |
| site-review-fix                | Full-site review-and-fix orchestration playbook (backs the site-review-fix and site-review-auto agents).                              |
| svg-logo-crop                  | Crop portfolio logo SVGs to visible ink — remove empty borders without clipping letterforms or emblem arcs.                           |

## Commands

| Command      | Purpose                                                                                                                        | Path                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| /page-team   | Run the Page Consistency Team to audit/fix design and token consistency across nav views (`[audit\|change\|implement\|full]`). | `.claude/commands/page-team.md`   |
| /release     | Orchestrate a release: verify CI, bump version, tag, and push to origin (`[patch\|minor\|major\|X.Y.Z]`).                      | `.claude/commands/release.md`     |
| /site-review | Run the full review-and-fix orchestrator: audit, fix verified issues, verify, commit (`[full\|audit]`).                        | `.claude/commands/site-review.md` |

All three commands set `disable-model-invocation: true` (explicit invocation only)
and scope `allowed-tools` to their workflow.

## Shared references

Files in `.claude/references/`:

- `design-consistency-contract.md` — agent-checkable design checklist distilled from `docs/design-direction.md`, `docs/typography.md`, and `global.css`; page agents audit against it, design-guardian treats it as binding.
- `page-agent-playbook.md` — runtime rules, modes, and phases shared by every page representative; each `page-*.md` agent reads it first (SSOT, never restated per agent).
- `page-agent-standard.md` — authoring standard for every file in `.claude/agents/`; load when creating, auditing, or updating any agent definition.

## Related documentation

- [`AGENTS.md`](../AGENTS.md) — repo-root quick-reference SSOT for the agent system.
- [`docs/page-team.md`](page-team.md) — Page Consistency Team workflow documentation.
- [`docs/task-runner.md`](task-runner.md) — task-runner / automation documentation.
- [`docs/architecture.md`](architecture.md) — overall site architecture.
- [`.claude/references/page-agent-playbook.md`](../.claude/references/page-agent-playbook.md) — shared page-agent runtime rules.
- `CLAUDE.md` (repo root) — Claude-specific entry points and triggers.
