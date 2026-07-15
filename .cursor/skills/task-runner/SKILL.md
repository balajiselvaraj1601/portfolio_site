---
name: task-runner
description: >-
  Work through TASKS.md checkbox items one at a time until all are [x].
  Use when the user says "run tasks", "work through TASKS.md", or starts a task batch.
---

# Task runner Skill

Process the repo-root `TASKS.md` checklist until every item is checked or a BLOCKED item stops the run.

## Before starting

1. Run `./.cursor/scripts/task-runner-start.sh` (creates `.cursor/task-runner.state.json` with `enabled: true` and prints the kickoff prompt).

2. Confirm **Run Everything** (or an allowlist that covers `npm run build`) is enabled so the batch does not stall on approvals.

3. Operator guide: `docs/task-runner.md`.

## Workflow

1. Read `TASKS.md` at the repo root.
2. Pick the **first** unchecked `- [ ]` item only (skip items under Conventions).
3. If that item starts with `BLOCKED:`, report the blocker and stop - do not continue.
4. Implement that item fully (follow repo `AGENTS.md`).
5. Run `npm run build` (or the AC named on the item).
6. If verify passes, edit `TASKS.md` to `- [x]` for that item.
7. If verify fails, fix before marking done.
8. Repeat until no unchecked queue items remain, then report completion and run `./.cursor/scripts/task-runner-cancel.sh`.

## Rules

- Never skip ahead or batch-mark items.
- Never mark an item done without verification.
- If blocked after two attempts on the same item, edit it to `- [ ] BLOCKED: <reason>` and stop.
- Do not commit unless the user asked.
- Update checkboxes in `TASKS.md` - not only in chat.

## Efficiency: batch edits and parallel calls

- **Batch edits:** implement each item with the fewest edits - combine changes to one file into a single edit.
- **Read before edit:** read each file once, plan all changes, then apply them together.
- **One item at a time:** never batch-mark checkboxes; verify before flipping `- [ ]` to `- [x]`.

## Quick reference: where to go deeper

| Topic          | Reference file                                     |
| -------------- | -------------------------------------------------- |
| Operator guide | [`docs/task-runner.md`](../../docs/task-runner.md) |

## Cancel

Run `./.cursor/scripts/task-runner-cancel.sh` or set `"enabled": false` in the state file.

## Status

Run `./.cursor/scripts/task-runner-status.sh` to see pending count and next item.
