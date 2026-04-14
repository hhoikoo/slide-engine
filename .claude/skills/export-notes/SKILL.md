---
name: export-notes
description: Extract speaker notes from slides.md into a printable document. Usage: /export-notes [presentation-name]
argument-hint: "[presentation-name]"
---

# Export Notes

Extract speaker notes from Marp slides into a standalone printable document.

## Input

`$ARGUMENTS` is an optional presentation name (e.g., `2026-04-build-demo`).

## Resolve Presentation Directory

1. If a presentation name is given in `$ARGUMENTS`, resolve to `$PRESENTATIONS_DIR/.worktrees/{name}/{name}/`.
2. If not given, use the presentation directory from earlier in this conversation.
3. If neither, ask the user.
4. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.

## Workflow

1. Resolve the presentation directory (see above).
2. **Parse section files**: Read each `sections/*.md` file in sort order. For each slide (split on `---`):
   - Extract the slide title (first `#` or `##` heading)
   - Extract speaker notes (content inside `<!-- ... -->` blocks that are NOT directives like `_class:` or `_paginate:`)
   - Track slide number
3. **Generate output**: Write `output/speaker-notes.md` with format:
   ```
   # Speaker Notes: {presentation title from header in frontmatter}

   ## Slide 1: {title}
   {notes}

   ## Slide 2: {title}
   {notes}
   ...
   ```
4. **Report**: Print the output path. Note any slides that are missing speaker notes.

## Tip

The Marp HTML output also supports presenter mode: press `P` in the browser to see current slide + next slide + notes, similar to PowerPoint presenter view.
