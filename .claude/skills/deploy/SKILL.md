---
name: deploy
description: Build HTML and deploy to GitHub Pages via the slide-engine repo's gh-pages branch. Usage: /deploy
---

# Deploy

Build the current presentation and publish it to GitHub Pages.

Built HTML is deployed to the `gh-pages` branch of the slide-engine repo (this repo), not the slides repo. This keeps the slides repo private while serving presentations publicly.

## Input

`$ARGUMENTS` is unused.

## Workflow

1. Detect the current presentation directory (look for `sections/` in cwd or parent).
2. Determine the presentation name from the directory name (e.g., `2026-04-build-demo`).
3. Run `/build html` to compile slides.
4. Determine the slide-engine repo root. Default: `/Users/hhkoo/Documents/Presentation/template-gen`.
5. Create a temporary worktree for the gh-pages branch:
   ```
   git -C "$ENGINE_DIR" worktree add /tmp/slide-engine-gh-pages gh-pages
   ```
6. Copy the built HTML into the gh-pages worktree:
   ```
   mkdir -p /tmp/slide-engine-gh-pages/{presentation-name}
   cp output/slides.html /tmp/slide-engine-gh-pages/{presentation-name}/index.html
   ```
7. Regenerate the index page: scan all directories in the gh-pages worktree matching `20*/`, generate an `index.html` listing them with links.
8. Commit and push:
   ```
   git -C /tmp/slide-engine-gh-pages add .
   git -C /tmp/slide-engine-gh-pages commit -m "deploy: {presentation-name}"
   git -C /tmp/slide-engine-gh-pages push origin gh-pages
   ```
9. Clean up the temporary worktree:
   ```
   git -C "$ENGINE_DIR" worktree remove /tmp/slide-engine-gh-pages
   ```
10. Report the Pages URL.

## Notes

- The slide-engine repo must have a remote named `origin` and a `gh-pages` branch.
- GitHub Pages must be configured to serve from the `gh-pages` branch.
- If the remote or gh-pages branch does not exist, report the error and suggest setup steps.
- The temporary worktree is cleaned up after deploy, whether it succeeds or fails.
