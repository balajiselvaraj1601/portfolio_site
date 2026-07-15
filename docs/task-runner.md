# Long-Running Task Batches

Run multi-step agent work through a persisted markdown checklist (`TASKS.md`) with automatic continuation until every queue item is checked.

`TASKS.md` is created at the repo root per batch and removed when the batch is done - its absence means no batch is active (all hooks short-circuit gracefully when the file is missing).

## Prerequisites

1. **Run Everything** - Cursor Settings - Agents - Approvals & Execution - Run Everything  
   (Or use Auto-review with an allowlist that includes `npm run build` and file edits.)

2. **Dependencies** - `jq` on PATH (used by hooks and helper scripts).

3. **Hooks loaded** - Project hooks live in [`.cursor/hooks.json`](../.cursor/hooks.json). Restart Cursor if hooks do not appear in the Hooks output channel after edits.

## Quick start

```bash
# 1. Create TASKS.md at the repo root with a ## Queue section and add tasks
# 2. Enable the batch
./.cursor/scripts/task-runner-start.sh

# 3. Paste the printed prompt into Agent chat
```

The agent processes **one unchecked item at a time**, verifies (usually `npm run build`), marks `- [x]` in `TASKS.md`, and repeats.

## Monitor progress

- Watch checkboxes flip in `TASKS.md`
- Check status anytime:

```bash
./.cursor/scripts/task-runner-status.sh
```

- Cursor **Hooks** output channel - stop-hook auto-continuations and errors

## Cancel a batch

```bash
./.cursor/scripts/task-runner-cancel.sh
```

Or delete `.cursor/task-runner.state.json` manually. Runtime state is gitignored; copy [`.cursor/task-runner.state.json.example`](../.cursor/task-runner.state.json.example) if you need a template.

## Task format

Include a **Conventions** section in `TASKS.md` when you create it:

- One actionable `- [ ]` line per task (imperative, verifiable)
- Optional `AC: ...` on the next indented line
- If stuck after two attempts: `- [ ] BLOCKED: <reason>` - the stop hook will **not** auto-continue

## How auto-continuation works

```text
Agent finishes turn
  - stop hook reads .cursor/task-runner.state.json + TASKS.md Queue
  - unchecked items remain? inject followup_message (up to loop_limit: 50)
  - all done or BLOCKED? allow stop and remove state file
```

New sessions with an active batch get a reminder via the `sessionStart` hook.

## Localhost smoke (optional verify step)

With the dev server running (`npm run dev`):

```bash
npm run smoke:localhost
```

Checks hero visibility, Thirukural layout, Awards/Kaggle filter isolation, and hash nav. See [`.cursor/scripts/smoke-localhost.mjs`](../.cursor/scripts/smoke-localhost.mjs).

## Files

| Path                                                   | Role                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `TASKS.md`                                             | Checkbox queue (source of truth; created per batch, absent between batches) |
| `.cursor/skills/task-runner/SKILL.md`                  | Agent workflow skill                                                        |
| `.cursor/scripts/task-runner-{start,status,cancel}.sh` | Operator helpers                                                            |
| `.cursor/hooks/task-runner-stop.sh`                    | Auto-continue on incomplete queue                                           |
| `.cursor/hooks/task-runner-session.sh`                 | Resume reminder on new session                                              |
| `.cursor/task-runner.state.json`                       | Local enable flag (gitignored)                                              |

## Safety

- **`loop_limit: 50`** - max auto follow-ups per conversation (in `hooks.json`)
- **`BLOCKED:`** - escape hatch; hook stops looping
- **No auto-commit** - agent must not commit unless you ask
