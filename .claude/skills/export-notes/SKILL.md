---
name: export-notes
description: Extract speaker notes from slides.md into a printable document. Usage: /export-notes
---

# Export Notes

Extract speaker notes from Marp slides into a standalone printable document.

## Workflow

1. **Find the presentation directory**: Look for `sections/` in cwd or parent.
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
