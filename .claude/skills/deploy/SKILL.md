---
name: deploy
description: Build HTML and deploy to GitHub Pages. Usage: /deploy
---

# Deploy

Build the current presentation and publish it to GitHub Pages.

Built HTML is committed to `public/{presentation-name}/` on the main branch of this repo (slide-engine). A GitHub Actions workflow triggers on changes to `public/` and deploys to Pages.

## Workflow

1. Detect the current presentation directory (look for `sections/` in cwd or parent).
2. Determine the presentation name from the directory name (e.g., `2026-04-build-demo`).
3. Run `/build html` to compile slides.
4. Determine the slide-engine repo root. Default: `/Users/hhkoo/Documents/Presentation/template-gen`.
5. Copy the built HTML:
   ```
   mkdir -p "$ENGINE_DIR/public/{presentation-name}"
   cp output/slides.html "$ENGINE_DIR/public/{presentation-name}/index.html"
   ```
6. Regenerate the index page: scan all directories in `public/` matching `20*/`, update `public/index.html` with links to each.
7. Commit in the slide-engine repo:
   ```
   git -C "$ENGINE_DIR" add public/
   git -C "$ENGINE_DIR" commit -m "deploy: {presentation-name}"
   ```
8. Push to origin: `git -C "$ENGINE_DIR" push`
9. Report the Pages URL. GitHub Actions will deploy automatically.

## Notes

- The slide-engine repo must have a remote named `origin`.
- GitHub Pages must be configured with source set to "GitHub Actions" in repo settings.
- If the remote is not configured, report the error and suggest setup steps.
