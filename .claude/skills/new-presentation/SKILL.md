---
name: new-presentation
description: Scaffold a new presentation directory with synopsis and starter slides. Usage: /new-presentation <topic>
argument-hint: "<topic>"
---

# New Presentation

Create a new presentation as a branch + worktree with starter files.

## Input

`$ARGUMENTS` is the presentation topic (e.g., "WebAssembly for Backend Engineers").

## Workflow

1. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`. This points to the base presentations repo (main branch).
2. Generate a slug from the topic: lowercase, hyphens, max 40 chars.
3. Determine the branch name: `{YYYY-MM}-{slug}` (current date).
4. Create the branch from main: `git -C "$PRESENTATIONS_DIR" branch {branch-name} main`
5. Create a worktree as a sibling: `git -C "$PRESENTATIONS_DIR" worktree add "../presentations--{branch-name}" {branch-name}`
6. Inside the worktree, create the presentation directory `{branch-name}/` with subdirectories: `sections/`, `research/`, `images/figures/`, `images/generated/`.
7. Copy `.gitignore` from main: `git -C {worktree} checkout main -- .gitignore`
8. Create `sections/00-frontmatter.md` with YAML frontmatter:
   ```markdown
   ---
   marp: true
   theme: bai-flat
   paginate: true
   html: true
   header: "{topic}"
   ---
   ```
9. Create `synopsis.md` with the topic as heading and placeholder sections: Audience, Key Messages, Structure.
10. Initial commit: `git -C {worktree} add -A && git commit -m "scaffold {branch-name}"`
11. Report the worktree path and suggest next steps: edit synopsis.md, then run `/generate-slides`.

## Note

Do NOT create `slides.md` -- it is a build artifact assembled from `sections/` files.
The `output/` directory is not created -- it is a build artifact directory created by `make`.
