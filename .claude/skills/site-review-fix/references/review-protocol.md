# Site review fix — interaction protocol

Phased workflow for `.cursor/site-review.state.json`. All agents follow these phases
in order unless mode is `audit` (Phases 0→1→2→3→7 only).

---

## State file schema

Path: `.cursor/site-review.state.json`

```json
{
  "enabled": true,
  "run_id": "2026-07-02T215500Z",
  "armed_at": "2026-07-02T215500Z",
  "fire_at": "2026-07-03T004500Z",
  "phase": "init",
  "mode": "full",
  "goal": "…",
  "allow_commit": true,
  "findings": [],
  "fixes": [],
  "verify_status": null,
  "commit_sha": null,
  "log_path": null
}
```

### Finding shape

```json
{
  "id": "SR-001",
  "severity": "high",
  "theme": "ci",
  "file": "src/…",
  "summary": "…",
  "status": "open"
}
```

Severity: `critical`, `high`, `medium`, `low`, `nit`.

Themes: `ci`, `content`, `dead_code`, `a11y`, `seo`, `design`, `hygiene`, `ssot`.

### Fix shape

```json
{
  "finding_id": "SR-001",
  "summary": "…",
  "files_changed": ["…"]
}
```

---

## Phase 0 — Initialize

1. Parse goal from user prompt or `SITE_REVIEW_GOAL` env.
2. Determine mode (`full` default; `audit` if read-only requested).
3. Read agent file, this protocol, and baseline audit doc.
4. Create or reset state file with `run_id` (UTC timestamp), timestamps, empty arrays.
5. Set `phase: "init"`.

**Gate:** state file exists with `run_id` and `goal`.

---

## Phase 1 — Baseline verify

1. Run `npm run verify` from repo root.
2. Capture stdout/stderr; parse failures into `findings[]` with severity `critical` or `high`.
3. Set `verify_status: "fail"` if non-zero; `"pass"` if zero.
4. Set `phase: "baseline_complete"`.

**Gate:** verify output captured in state or log.

---

## Phase 2 — Audit (parallel sweeps)

Launch independent audits. Merge all into `findings[]`.

| Sweep             | Agent / method                       | Checks                                                                   |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| Content SSOT      | generalPurpose                       | Cross-file name/drift in `content/`; hardcoded copy in `src/components/` |
| Dead code         | generalPurpose                       | Unreferenced sections/cards; imports never used                          |
| A11y / SEO        | generalPurpose                       | alt, h1, focus, meta, JSON-LD, external link rel                         |
| Design            | site-consistency-orchestrator (full) | All 6 nav views via page-consistency-team                                |
| Baseline re-check | self                                 | Each theme in `docs/audits/simplification-refactor-2026-07-03.md`        |

Set `phase: "audit_complete"`.

**Gate:** at least one finding or explicit "clean" per theme documented in state.

---

## Phase 3 — Triage

1. Deduplicate overlapping findings.
2. Sort: verify blockers (critical/high + theme ci) first, then high, medium, low.
3. Assign fix order; mark deferred items with `status: "deferred"` and reason.
4. Set `phase: "triaged"`.

**Gate:** ordered fix list exists in state notes or `findings[].status`.

---

## Phase 4 — Fix

1. Fix items in triage order — surgical edits only.
2. For each fix, append to `fixes[]` and set finding `status: "fixed"`.
3. Re-run targeted checks after each batch (e.g. `npm run format:check` after markdown edits).
4. If design fixes needed, ensure page-team implement phase completed.
5. Set `phase: "fix_complete"`.

**Gate:** all non-deferred findings addressed or explicitly blocked with reason.

---

## Phase 5 — Verify

1. Run `npm run verify`.
2. On failure: return to Phase 4 for remaining blockers; max 3 verify loops.
3. On success: set `verify_status: "pass"`, `phase: "verify_complete"`.

**Gate:** `npm run verify` exits 0.

---

## Phase 6 — Commit

Skip if `allow_commit` is false or mode is `audit`.

1. `git status` — review changed paths.
2. Stage only site files (never `.cursor/site-review.state.json`, logs, `dist/`).
3. Commit with structured message (see agent file template).
4. Record `commit_sha` from `git rev-parse HEAD`.
5. Set `phase: "commit_complete"`.

**Gate:** commit exists or skip documented.

---

## Phase 7 — Report

1. Set `phase: "complete"`, `enabled: false`.
2. Write summary: findings count by severity, fixes count, verify status, commit sha.
3. Set `log_path` if run via CLI script.

**Gate:** state `phase: "complete"`.

---

## Audit-only mode

Phases 0→1→2→3→7. No Phase 4–6. Report findings for user action.

---

## Escalation

If blocked after 3 verify loops, set `phase: "blocked"`, document remaining failures in state,
and exit without commit.
