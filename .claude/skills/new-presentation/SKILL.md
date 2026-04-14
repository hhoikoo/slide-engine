---
name: new-presentation
description: Scaffold a new presentation directory with synopsis and starter slides. Usage: /new-presentation <topic>
argument-hint: "<topic>"
---

# New Presentation

Create a new presentation directory with starter files.

## Input

`$ARGUMENTS` is the presentation topic (e.g., "WebAssembly for Backend Engineers").

## Workflow

1. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.
2. Generate a slug from the topic: lowercase, hyphens, max 40 chars.
3. Create directory: `$PRESENTATIONS_DIR/{date}-{slug}/` (date = YYYY-MM format).
4. Create subdirectories: `sections/`, `research/`, `images/figures/`, `images/generated/`, `output/`.
5. Create `sections/00-frontmatter.md` with YAML frontmatter:
   ```markdown
   ---
   marp: true
   theme: bai-flat
   paginate: true
   html: true
   header: "{topic}"
   ---
   ```
6. Create `synopsis.md` with the topic as heading and placeholder sections: Audience, Key Messages, Structure.
7. Report the created path and suggest next steps: edit synopsis.md, then run `/generate-slides`.

## Note

Do NOT create `slides.md` -- it is a build artifact assembled from `sections/` files.
