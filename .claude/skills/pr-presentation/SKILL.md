---
name: pr-presentation
description: Create a PR to merge the current presentation branch into main. Usage: /pr-presentation
---

# PR Presentation

Create a pull request to merge the current presentation branch into main on the slides repo.

## Workflow

1. Detect the current presentation directory (look for `sections/` in cwd or parent).
2. Determine the branch name from the directory or `git branch --show-current`.
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
