---
name: list-presentations
description: List all presentations with their pipeline phase, next command, and deploy status. Usage: /list-presentations
---

# List Presentations

Show every deck: where it is in the pipeline, what runs next, and whether it has shipped.

## Workflow

1. Get the phase state. It is derived from artifacts on disk, never guessed:
   ```bash
   engine/scripts/deck-status.sh --porcelain
   ```
   Each line is `id= phase= phase_num= next= slides= mocks= figures= blocked=`. Rows come back most-recently-committed first; keep that order.
2. Read `presentations/index.md` for the ID-to-name mapping.
3. For each deck, check whether `public/{name}/index.html` and `public/{name}/slides.pdf` exist.
4. Print one table: ID, name, phase, next, slides, figures, HTML, PDF.

Decks written before the pipeline report `phase=legacy`. Show them as `legacy` with an empty next column. They are frozen; do not offer to migrate one.

When `blocked=` is non-empty, put it in the next column beside the command so the gap is visible without a second run.
