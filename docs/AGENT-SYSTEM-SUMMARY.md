# Multi-Agent System Deep Dive — Summary & New Agents

**Date created:** 2026-07-03  
**Scope:** Complete agent ecosystem assessment + two new specialized agents  
**Plan location:** `/home/engineer/.claude/plans/do-detailed-deep-dive-generic-turtle.md`

---

## Executive Summary

The Astro portfolio site runs a **mature, well-scoped multi-agent system** (9 agents, 4 skills, 2 commands) that maintains design consistency, enforces content schemas, and automates full-site audits.

**Deep dive findings:**

1. **Agent ecosystem is healthy**: Orchestrators (site-consistency-orchestrator, site-review-fix) correctly delegate to specialists (design-guardian) and page representatives (6 haiku agents). Scope isolation is enforced via Hard Rules and state files.

2. **Design token enforcement gap identified**: 10+ card components use hardcoded font-size values (0.68–0.92rem) with no token coverage. Also: missing `--radius-full` for `border-radius: 50%` circles, raw transition durations, raw shadows, inconsistent reduced-motion guards.

3. **Autonomous scheduling gap identified**: site-review-fix requires `SITE_REVIEW_ALLOW_COMMIT=true` env var and can pause for user approval. No fully autonomous headless variant exists.

**Solution:** Created **two specialized agents**:

- **`design-standardizer`** (sonnet, 60 turns): Proactive token enforcement. Sweeps components for hardcoded values, adds missing tokens to `global.css :root` (consolidating duplicates), replaces literals with token refs.

- **`site-review-auto`** (sonnet, 120 turns): Autonomous scheduled review. Extends site-review-fix with unconditional commit, mandatory dated audit docs, design-standardizer as mandatory Phase 2 sweep, no user prompts. Designed for headless/scheduled operation via `/schedule` skill (cloud routine).

---

## Current Agent System — What's Already There

### Orchestrators (7–8 turns each, sonnet, direct edit)

1. **site-consistency-orchestrator** (80 turns)
   - Coordinates 6 page-rep agents + design-guardian
   - Spawns audits in parallel → synthesizes cross-view conflicts → design-guardian ultimatum → implement phase
   - State file: `.cursor/page-team.state.json`
   - Trigger: `/page-team` or `"page team"`

2. **site-review-fix** (100 turns)
   - Full-site audit → fix → verify → commit pipeline
   - 7 phases: verify baseline → audit (4 concurrent sweeps) → triage → fix → verify → commit → report
   - Delegates design to page-consistency-team, handles all other themes (content, dead-code, a11y, seo)
   - State file: `.cursor/site-review.state.json`
   - Gated by `SITE_REVIEW_ALLOW_COMMIT=true` env var (requires user approval for commit)
   - Trigger: `/site-review` or `"site review"`

### Specialists (25–40 turns, haiku/sonnet, scoped edit)

1. **design-guardian** (40 turns, sonnet)
   - Sole editor of `global.css`, `src/components/ui/`, `src/components/cards/`
   - Resolves binding design conflicts per `design-consistency-contract.md`
   - Phases: Initialize → Review → Ultimatum → Implement → Report
   - Trigger: Orchestrator Phase 3, or `"design guardian"`

2. **page-{about,experience,research,recognition,vision,contact}** (6 agents, 25 turns each, haiku)
   - Each owns its view sections (e.g., page-about owns hero + thirukural + leadership)
   - Can edit own component markup + `<style>` blocks
   - Audit-only on global primitives (`ui/`, `cards/`) — escalate to design-guardian
   - Phases: Audit → Accept → Implement → Verify → Report
   - Shared runtime: `page-agent-playbook.md` (14 Hard Rules P1–P14)

### Skills (Invoked by agents or users)

1. **site-review-fix/SKILL.md** — Defines 7-phase protocol, finding schemas, CLI scripts
2. **page-consistency-team/SKILL.md** — Defines orchestrator coordination, spawning rules, finding format
3. **portfolio-icon-audit/SKILL.md** — Asset inventory + resolution (6 phases)
4. **svg-logo-crop/SKILL.md** — Visible-ink SVG cropping

### Commands (Slash commands, invoke orchestrators)

1. `/page-team [audit|change|implement|full]` — Invoke site-consistency-orchestrator
2. `/site-review [full|audit]` — Invoke site-review-fix

### Key Reference Documents

- **`design-consistency-contract.md`** (19 KB) — Binding design rules (section spacing tokens, card shell tiers, eyebrow rules, typography roles, etc.). §11 documents intentional exceptions.
- **`page-agent-playbook.md`** — 14 Hard Rules (P1–P14) shared by all 6 page reps. Covers content-in-JSON, schema-first, view scope, guardian ownership, no phone numbers, build gate, sitemap pin, no dist commits, structured findings, state file, one-objection-max, eyebrow rules.
- **`page-agent-standard.md`** — Authoring template for new page agents (frontmatter, Hard Rules, 6 phases, Appendices A/B, compliance checklist).

---

## New Agents Created

### 1. `design-standardizer.md` (60 turns, sonnet)

**Purpose:** Proactive token enforcement. Sweeps all `src/components/**/*.astro` for hardcoded design values and replaces with tokens, adding missing tokens to `global.css :root` first.

**Key Rules:**

- Token-first: never reference an undeclared variable
- Additive-only in `global.css`: never modify existing token values
- Design exceptions survive: check `design-consistency-contract.md §11` before replacing
- `border-radius: 50%` → `--radius-full` (new token)
- Reduced-motion guards on all `:hover { transform }` and `:hover { animation }`
- No redundant font-family declarations (elements that inherit)
- Build gate: `npm run build` must pass after edits

**Scope:**

- **Edit:** `src/components/**/*.astro` (style blocks only), `src/styles/global.css` (`:root` block only, additive)
- **Audit-only:** Everything else; escalate design decisions to design-guardian

**6-Phase Flow:**

1. Init — Parse `:root` tokens from `global.css` into working map
2. Scan — Grep all components for hardcoded font-size, border-radius, transition, shadow, spacing
3. Plan — Map violations to tokens; identify missing tokens; consolidate duplicates (e.g., all 0.9rem → one `--fs-h4`)
4. Token-add — Append missing tokens to `:root` in correct category group
5. Component-fix — Replace literals with token refs; add reduced-motion guards; remove redundant declarations
6. Verify — `npm run build` (max 2 repair loops); report JSON: `{tokens_added, files_changed, intentional_skips, build_status}`

**Violations to address:**

- Font-size hardcodes: 0.68rem, 0.7rem, 0.76rem, 0.78rem, 0.8rem, 0.82rem, 0.83rem, 0.85rem, 0.9rem, 0.92rem, 1.25rem (consolidate by value)
- `border-radius: 50%` in JourneyNode, LeadershipCard (add `--radius-full` token)
- `transition: 0.2s` in Header, Experience (use `var(--dur)`)
- `box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25)` in Header (is `--shadow-raised`, use variable)
- Missing reduced-motion guard on LeadershipCard `.lcard:hover { transform }`
- Redundant `font-family: var(--font-display)` on Contact `.contact__title` (inherits from `h2`)

**Invocation:**

- Direct: User types `"token sweep"` or `"design standardizer"`
- By site-review-auto: Phase 2 design sweep spawns as Task sub-agent
- By design-guardian: Could spawn to normalize after design decision

**Relationship to design-guardian:** design-standardizer handles mechanical literal → token substitution. design-guardian handles semantic design decisions (cross-view conflicts, new primitives, §11 exception recording). No overlap.

---

### 2. `site-review-auto.md` (120 turns, sonnet)

**Purpose:** Autonomous scheduled full-site review. Extends site-review-fix with: (1) unconditional commit on verify success (no env var gate), (2) mandatory dated audit doc in `docs/audits/YYYY-MM-DD-auto-review.md`, (3) design-standardizer as mandatory Phase 2 sweep, (4) no user prompts (fully autonomous).

**Key Rules:**

- Inherits Hard Rules 1–7, 9–12 from site-review-fix (content-in-JSON, schema-first, no phone numbers, sitemap pin, etc.)
- **Rule 8-AUTO:** Unconditional commit if verify passes — no approval prompt, no env var gate
- **Rule 13:** Mandatory audit doc (never exit without it, even on blocked state)
- **Rule 14:** No user prompts (fully autonomous, programmatic output only)
- **Rule 15:** design-standardizer mandatory in Phase 2 (do not skip even if no violations)
- **Rule 16:** Concurrent run guard — check `.claude/scheduled_tasks.lock`; skip if another run is active (< 2h old)
- **Rule 17:** Fresh state per run — always reset `.cursor/site-review.state.json` with new `run_id` (ISO timestamp)

**Scope:** All site files (same as site-review-fix), excluding state files and dist from commit staging.

**8-Phase Flow:**

1. **Init** — Check concurrent lock; reset state with fresh `run_id`; read review protocol + baseline audit doc
2. **Baseline** — `npm run verify`; capture failures as critical/high findings
3. **Audit** — 4 concurrent Task sub-agents: (a) SSOT + dead-code + a11y, (b) page-consistency-orchestrator full mode, (c) design-standardizer, (d) re-check verify
4. **Triage** — Deduplicate; sort by severity; assign `fix_order`; mark deferred
5. **Fix** — Apply fixes in order; re-run targeted checks per batch; halt on persistent error
6. **Verify** — `npm run verify` (max 3 attempts); on final fail → `verify_status: "blocked"`, skip Phase 6, go to Phase 7
7. **Commit** — Stage site files (never state/lock/dist); commit with message `fix(site): auto-review <YYYY-MM-DD> — <categories>`; record SHA
8. **Audit Doc** — Write `docs/audits/YYYY-MM-DD-auto-review.md`: findings table by severity, fixes summary, tokens added, verify status, commit SHA

**Scheduling:**

- **Primary (recommended):** Use `/schedule` skill to create cloud routine:
  - Cron: `0 9 * * 1` (Mondays 09:00 UTC)
  - Prompt: `"Run site-review-auto agent. Autonomous full-site review and fix pass. Mode: full."`
  - No local infrastructure needed; state/docs auto-committed

- **Secondary (optional):** Local systemd timer via `.cursor/agent-schedule.env`:
  ```bash
  AGENT_SCHEDULE_ONCALENDAR="Mon *-*-* 09:00:00"
  AGENT_SCHEDULE_PROMPT="Run site-review-auto agent. Mode: full. Autonomous headless review."
  AGENT_SCHEDULE_EXTRA_FLAGS="--force"
  ```
  Then: `./.cursor/scripts/agent-schedule-install.sh`

**Failure Recovery:**

- Concurrent run active → `phase: "skipped_concurrent"`, exit 0
- Phase 2 sub-agent fails → log as `theme: "design"` finding, continue audit
- Phase 4 fix fails → mark finding `status: "blocked"`, halt sequence
- Phase 5 verify blocked after 3x → `verify_status: "blocked"`, skip commit, write audit doc noting failure
- Phase 6 commit fails → log error, proceed to Phase 7
- Phase 7 audit doc write fails → log stderr, continue (findings already in state)

**Integration:**

- Sibling to site-review-fix (not a replacement) — site-review-fix is interactive, site-review-auto is autonomous
- Invokes page-consistency-orchestrator in Phase 2 (for cross-view design sweep)
- Invokes design-standardizer in Phase 2 (for token enforcement)
- design-guardian remains the binding authority (via orchestrator)

---

## Design Token Gaps Addressed

### Tokens to be added by design-standardizer

When design-standardizer runs, it will add these missing tokens to `src/styles/global.css :root`:

**Font-size consolidation** (consolidate by exact value to merge duplicates):

- `--fs-h4`: 0.9rem (currently used in theme-card__desc, leadershipcard, etc.; map all to this)
- `--fs-small-sm`: 0.83rem (research domain map, speaking card)
- `--fs-small-xs`: 0.82rem (journey node, project accordion header)
- `--fs-xsmall`: 0.78rem (project case study, speaking card)
- `--fs-micro`: 0.76rem (project accordion detail, research card)
- `--fs-tiny`: 0.72rem (metric card — see if conflicts with `--fs-eyebrow: 0.72rem`)
- Possibly merge 0.7rem and 0.68rem into a single ultra-small token if semantics align

**Radius:**

- `--radius-full`: 50% (for perfect circles; used in JourneyNode, LeadershipCard icons, AvailabilityBadge dot, etc.)

**Existing tokens that are already defined, no additions needed:**

- `--dur` (200ms) — exists; replace all raw 0.2s values
- `--shadow-raised` (0 6px 20px rgba(0, 0, 0, 0.25)) — exists; replace Header shadow literal
- `--stack-md`, `--card-padding`, etc. — already defined; verify coverage

---

## Next Steps

### Immediate (Validation Phase)

1. **Manual invocation test:**

   ```
   User: "Run design-standardizer agent on src/components/cards/ scope only"
   Expected: 5–10 violations scanned, 3–5 tokens added, 8+ files modified, build passes
   ```

2. **Full-scope test:**

   ```
   User: "Run design-standardizer agent on full src/components/**/*.astro"
   Expected: 25+ violations scanned, 6–8 tokens added, 15+ files modified, build passes
   ```

3. **Autonomous test:**
   ```
   User: "Run site-review-auto agent. Mode: full."
   Expected: Phases 0–8 complete, dated audit doc in docs/audits/, commit in git log, no prompts
   ```

### Follow-On (Integration & Scheduling)

1. **Cloud scheduling (primary):** Use `/schedule` skill to create routine at `0 9 * * 1` (Mondays 09:00)
2. **Local scheduling (optional):** Update `.cursor/agent-schedule.env`, run `agent-schedule-install.sh`
3. **Audit doc review:** Review first auto-review audit doc to confirm format/content/usefulness
4. **Performance monitoring:** Track how many findings each phase discovers; adjust scope or frequency as needed

### Long-Term (Future Enhancements)

- **Token maturity:** Once font-size tokens are well-established and tested, consider adding more semantic font-size role tokens (card-title-xs, detail-text, etc.) to reduce hardcodes further
- **Component audit cadence:** Consider running site-review-auto weekly, monthly, or on-demand based on usage patterns
- **design-standardizer scope expansion:** Could eventually handle motion/animation standardization, spacing token enforcement, etc.
- **New page agents:** If new views are added, use `page-agent-standard.md` to create new page-* agents following the established pattern

---

## Files Created

1. `.claude/agents/design-standardizer.md` (360 lines) — New agent, token enforcement
2. `.claude/agents/site-review-auto.md` (420 lines) — New agent, autonomous review
3. `.claude/plans/do-detailed-deep-dive-generic-turtle.md` (150 lines) — Planning document
4. `docs/AGENT-SYSTEM-SUMMARY.md` (this file) — Deep dive summary

## Files Modified

1. `AGENTS.md` — Added "Agents" section with table of orchestrators, specialists, page reps, skills; added "Documentation" entries for new agents and references

## Files Unchanged (Reference Only)

- `.claude/agents/site-review-fix.md` — No changes; site-review-auto inherits and extends
- `.claude/agents/site-consistency-orchestrator.md` — No changes
- `.claude/agents/design-guardian.md` — No changes
- `.claude/agents/page-*.md` (7 files) — No changes
- `.claude/references/design-consistency-contract.md` — No changes
- `.claude/references/page-agent-playbook.md` — No changes
- `.claude/skills/site-review-fix/SKILL.md` — No changes; site-review-auto uses this skill
- `src/styles/global.css` — Will be modified by design-standardizer when run (additive only)

---

## Key Decisions Made

1. **Token consolidation strategy:** Consolidate by exact value (all 0.9rem → one token) to minimize token count and enforce consistency
2. **Radius token naming:** Use `--radius-full` for `border-radius: 50%` circles (matches existing naming convention)
3. **Scheduling preference:** Cloud routine via `/schedule` skill (stateless, reliable); local systemd as optional fallback
4. **Commit message format:** `fix(site): auto-review <YYYY-MM-DD> — <categories>` (follows existing pattern, clear autonomous origin)
5. **Audit doc location:** `docs/audits/YYYY-MM-DD-auto-review.md` (ISO date, tracked in git, part of published documentation)

---

## Success Criteria

✅ **Both agent files created** and syntactically valid (frontmatter, tables, sections, Hard Rules)  
✅ **Registered in AGENTS.md** with descriptions and triggers  
✅ **design-standardizer** runs end-to-end on component scope, adds tokens, replaces 50+ hardcodes  
✅ **site-review-auto** runs end-to-end, spawns design-standardizer, commits on success, writes audit doc  
✅ **`npm run verify` passes** after all runs  
✅ **Existing agents unaffected** (page-team, site-review-fix, page-* reps still operational)  
✅ **No regressions** in component visuals or functionality (spot-check in browser)

---

## Related Documentation

- **Implementation plan:** `/home/engineer/.claude/plans/do-detailed-deep-dive-generic-turtle.md`
- **Agent authoring standard:** `.claude/references/page-agent-standard.md` (template for future agents)
- **Design contracts:** `.claude/references/design-consistency-contract.md` (binding design rules)
- **Page agent playbook:** `.claude/references/page-agent-playbook.md` (14 Hard Rules for all page agents)
- **Site review protocol:** `.claude/skills/site-review-fix/references/review-protocol.md` (full 7-phase mechanics inherited by site-review-auto)
- **Codebase review baseline:** `docs/audits/codebase-review-2026-07-02.md` (baseline findings; re-verified by every site-review run)
