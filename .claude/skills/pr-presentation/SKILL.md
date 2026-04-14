---
name: pr-presentation
description: Create a PR to merge a presentation branch into main. Usage: /pr-presentation [presentation-name]
argument-hint: "[presentation-name]"
---

# PR Presentation

Create a pull request to merge a presentation branch into main on the slides repo.

## Input

`$ARGUMENTS` is an optional presentation name (e.g., `2026-04-build-demo`).

## Resolve Presentation Directory

1. If a presentation name is given in `$ARGUMENTS`, resolve to `$PRESENTATIONS_DIR/.worktrees/{name}/{name}/`.
2. If not given, use the presentation directory from earlier in this conversation.
3. If neither, ask the user.
4. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.

## Workflow

1. Resolve the presentation directory (see above).
2. Determine the branch name from the worktree directory name.
3. Verify the branch is not `main`.
4. Check for uncommitted changes. If any, warn the user and suggest committing first.
5. Push the branch: `git push -u origin {branch-name}`
6. Read `synopsis.md` if it exists to generate the PR description.
7. Create the PR:
   ```
   gh pr create --base main --head {branch-name} --title "{branch-name}" --body "..."
   ```
   The body should include a summary from synopsis.md and a list of section files.
8. Report the PR URL.

## Notes

- PRs merge presentation content into main. After merge, the presentation directory lives on main permanently.
- The branch and worktree can be cleaned up after merge with `/close-presentation`.
- If a PR already exists for this branch, report its URL instead of creating a duplicate.
