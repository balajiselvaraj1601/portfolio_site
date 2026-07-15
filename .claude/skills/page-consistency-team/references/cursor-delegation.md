# Cursor delegation - page team

When the orchestrator runs in **Claude Code** and implementation requires heavy
multi-file edits across views, delegate to Cursor via codespace dispatch.

**Cursor-native sessions:** skip dispatch - implement directly in workspace.

---

## When to dispatch

- 5+ files across 2+ views
- Orchestrator context is full
- User explicitly requested Cursor implementation

---

## Invoke

```bash
/home/engineer/workspace/codespace/src/cli_agents/cursor_dispatch.sh \
  -w /home/engineer/workspace/portfolio_site \
  -f -t \
  -p "<delegation package>"
```

---

## Delegation package template

```
DELEGATE_TO: Cursor Agent
WORKSPACE: /home/engineer/workspace/portfolio_site

TASK
Implement approved page-team decisions (Phase 5).

CONTEXT
- State file: .cursor/page-team.state.json
- Decisions to implement: {paste decision_ids and binding_text}
- Design contract: .claude/references/design-consistency-contract.md
- AGENTS.md working rules apply

CONSTRAINTS
- Only edit files listed in decisions.
- Page agents scope: view-owned sections/components only.
- Guardian scope: global.css and shared ui/cards primitives.
- Run npm run build before handoff.
- Do not commit unless user asks.

OUTPUT FORMAT
Return JSON:
{
  "decisions_implemented": ["DG-001", ...],
  "files_changed": ["relative/paths"],
  "build": "pass|fail",
  "notes": "..."
}

VALID IF: build passes; edits match decision scope
INVALID IF: out-of-scope files; content hardcoded in components; schema skipped
```

---

## Skill inlining rule

External Cursor dispatch **cannot** read `.claude/skills/`. Inline the relevant
decision list and contract sections in the prompt. Native Cursor agent sessions
should read skill files directly via `.cursor/skills/page-consistency-team/SKILL.md`.
