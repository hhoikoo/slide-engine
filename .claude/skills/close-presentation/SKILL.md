---
name: close-presentation
description: Remove a presentation worktree (keeps the branch). Usage: /close-presentation <branch-name>
argument-hint: "<branch-name>"
---

# Close Presentation

Remove a worktree for a presentation branch. The branch and its history remain intact.

## Input

`$ARGUMENTS` is the branch name or partial match.

## Workflow

1. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.
2. Find the matching branch from `$ARGUMENTS`.
3. Find the worktree path for that branch: `git -C "$PRESENTATIONS_DIR" worktree list`
4. If no worktree exists, report that and exit.
5. Check for uncommitted changes in the worktree: `git -C {worktree} status --porcelain`
6. If there are uncommitted changes, warn the user and ask for confirmation before proceeding.
7. Remove the worktree: `git -C "$PRESENTATIONS_DIR" worktree remove "../presentations--{branch-name}"`
8. Report success.
