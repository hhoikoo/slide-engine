---
name: open-presentation
description: Create a worktree for an existing presentation branch. Usage: /open-presentation <branch-name>
argument-hint: "<branch-name>"
---

# Open Presentation

Check out an existing presentation branch as a worktree for editing.

## Input

`$ARGUMENTS` is the branch name or a partial match (e.g., "build-demo" matches "2026-04-build-demo").

## Workflow

1. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.
2. List branches and find the best match for `$ARGUMENTS`.
3. Check if a worktree already exists for that branch: `git -C "$PRESENTATIONS_DIR" worktree list`
4. If a worktree exists, report its path.
5. If no worktree, create one: `git -C "$PRESENTATIONS_DIR" worktree add ".worktrees/{branch-name}" {branch-name}`
6. Report the worktree path and the presentation directory inside it.
