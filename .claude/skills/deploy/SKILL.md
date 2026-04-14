---
name: deploy
description: Build HTML and deploy to GitHub Pages. Usage: /deploy [presentation-name]
argument-hint: "[presentation-name]"
---

# Deploy

Build a presentation and publish it to GitHub Pages.

Built HTML is committed to `public/{presentation-name}/` on the main branch of this repo (slide-engine). A GitHub Actions workflow triggers on changes to `public/` and deploys to Pages.

## Input

`$ARGUMENTS` is an optional presentation name (e.g., `2026-04-build-demo`).

## Resolve Presentation Directory

1. If a presentation name is given in `$ARGUMENTS`, resolve to `$PRESENTATIONS_DIR/.worktrees/{name}/{name}/`.
2. If not given, use the presentation directory from earlier in this conversation.
3. If neither, ask the user.
4. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.

## Workflow

1. Resolve the presentation directory (see above).
2. Run `/build html` for that presentation.
3. Determine the slide-engine repo root: `/Users/hhkoo/Documents/Presentation/template-gen`.
4. Copy the built HTML:
   ```
   mkdir -p "$ENGINE_DIR/public/{presentation-name}"
   cp $PRESENTATION_DIR/output/slides.html "$ENGINE_DIR/public/{presentation-name}/index.html"
   ```
5. Regenerate the index page: scan all directories in `public/` matching `20*/`, update `public/index.html` with links to each.
6. Commit in the slide-engine repo:
   ```
   git -C "$ENGINE_DIR" add public/
   git -C "$ENGINE_DIR" commit -m "deploy: {presentation-name}"
   ```
7. Push to origin: `git -C "$ENGINE_DIR" push`
8. Report the Pages URL.
