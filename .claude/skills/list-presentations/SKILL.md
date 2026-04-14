---
name: list-presentations
description: List all presentation branches and active worktrees. Usage: /list-presentations
---

# List Presentations

Show all presentation branches and their worktree status.

## Workflow

1. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.
2. List all branches: `git -C "$PRESENTATIONS_DIR" branch --list --format='%(refname:short) %(committerdate:short)'`
3. List active worktrees: `git -C "$PRESENTATIONS_DIR" worktree list`
4. Display a table with columns: Branch, Worktree Path (if checked out), Last Commit Date.
5. Exclude `main` and `gh-pages` from the list (those are infrastructure branches).
