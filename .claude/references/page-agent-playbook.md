# Page Agent Playbook

Runtime rules, modes, and phases shared by every page representative agent
(`.claude/agents/page-*.md`). Each agent Reads this file first (its "Load first" block) -
**never restate these rules in individual agent files** (SSOT). Authoring rules live in
`.claude/references/page-agent-standard.md`.

**You are a simple model.** Follow every instruction literally. Do NOT improvise.
Do NOT skip steps. Do NOT infer information that is not written in the source files.
Follow phases sequentially; do not reorder operations.

---

## Hard Rules P1-P14

| #   | Rule                                                                                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | **Content in JSON only.** Public copy lives in `content/` - never hardcode in components.                                                                                                                                                                                                                                  |
| P2  | **Schema first.** New or changed JSON fields require `src/schemas/` before content edits.                                                                                                                                                                                                                                  |
| P3  | **View scope.** Edit only the sections/components listed in your Appendix A. Never touch other views.                                                                                                                                                                                                                      |
| P4  | **Guardian owns shared primitives.** `src/styles/global.css`, `src/components/ui/`, and `src/components/cards/` are edited only by the design guardian. You may **audit** them (emit findings) but never edit - unless a guardian decision explicitly assigns `implementation_owner: page-*` for a scoped-CSS-only change. |
| P5  | **No phone numbers.** Never publish phone numbers or a References section.                                                                                                                                                                                                                                                 |
| P6  | **Build gate.** Run `npm run build` after any code or content change before reporting done.                                                                                                                                                                                                                                |
| P7  | **Sitemap pin.** Do not upgrade `@astrojs/sitemap` from exactly `3.6.0`.                                                                                                                                                                                                                                                   |
| P8  | **No dist commits.** Never commit `dist/`.                                                                                                                                                                                                                                                                                 |
| P9  | **Read before write.** Read every target file fully before editing; re-read after.                                                                                                                                                                                                                                         |
| P10 | **Structured findings.** Audit output must match `finding-schema.md` JSON shape.                                                                                                                                                                                                                                           |
| P11 | **State file.** Write phase outputs to `.cursor/page-team.state.json` when orchestrator requests.                                                                                                                                                                                                                          |
| P12 | **One objection max.** In Accept, either accept all decisions or raise exactly one blocking objection with evidence.                                                                                                                                                                                                       |
| P13 | **Eyebrows per contract.** Eyebrow presence exactly per contract §4 table - never restate or reinterpret the policy.                                                                                                                                                                                                       |
| P14 | **Shelved stays shelved.** Never enable, restyle, or audit shelved components (listed in your Appendix A). Flag accidental re-enabling (`visible: true` in `content/pages/00_site.json`) as a P1 `structure` finding.                                                                                                    |

---

## Operating modes

| Mode      | Trigger                           | Phases      |
| --------- | --------------------------------- | ----------- |
| Audit     | `audit`, orchestrator Phase 1     | 0 to 1-5       |
| Accept    | `accept`, orchestrator Phase 4    | 0 to 2-5       |
| Implement | `implement`, orchestrator Phase 5 | 0 to 3-4 to 5     |
| Full      | orchestrator delegates full cycle | 0 to 1-2 to 3-4 to 5 |

---

## Phases

### Phase 0 - Initialize

1. Complete your "Load first" block (this playbook + the design contract) if not already done.
2. Read your page brief (path noted under your View-specific rules).
3. Load your Appendix A view binding.
4. Confirm mode from the orchestrator prompt.

**Gate:** view binding loaded; mode confirmed.

### Phase 1 - Audit

1. Read each owned file in Appendix A.
2. Run the contract "Audit procedure (mechanical)" plus your Appendix B checklist.
3. For type/style checks, use your Appendix C text & object hierarchy: it maps the
   view's elements (reading order) to the contract §3a text ladder (T1-T10) and
   §3b/§5 object tiers. Cite level codes - token values live in the contract (SSOT);
   never re-list or hardcode font/weight/size values.
4. Emit `findings[]` per `finding-schema.md`. Do NOT edit files in audit mode.

**Gate:** JSON findings returned.

### Phase 2 - Accept

1. Read guardian `decisions[]` affecting your view.
2. Per P12: accept all, or one objection with evidence.
3. Return `{ "view_id": "...", "accepted": true|false, "objection": null|"..." }`.

**Gate:** response recorded.

### Phase 3 - Implement

1. Apply only decisions assigned to you with `accepted: true`.
2. Surgical edits only - match existing Astro/CSS style.
3. Record files changed.

**Gate:** all assigned P0/P1 fixes applied.

### Phase 4 - Verify

1. Re-read every edited file.
2. Run `npm run build`.
3. Confirm no out-of-scope edits (P3/P4).

**Gate:** build passes.

### Phase 5 - Report

Return JSON exactly:

```json
{ "view_id": "...", "findings": [], "files_changed": [], "build": "pass|fail" }
```

Full shapes: `.claude/skills/page-consistency-team/references/finding-schema.md`.

---

## Common mistakes (all views)

1. Editing `global.css` or shared `ui/`/`cards/` primitives (P4 violation) - escalate to guardian.
2. Adding or removing eyebrows contrary to contract §4 (P13).
3. Hardcoding px where a §2 token exists.
4. Inventing copy, metrics, or facts not present in content JSON (P1).
5. Enabling shelved sections or components (P14).
6. Editing another view's files (P3).
