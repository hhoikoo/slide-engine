---
name: build
description: Build presentation slides to HTML or PDF. Usage: /build [format] [presentation-name]
argument-hint: "[html|pdf|html-wl|pdf-wl] [presentation-name]"
---

# Build

Compile Marp slides to HTML or PDF.

## Input

`$ARGUMENTS` may contain:
- A format: `html` (default), `pdf`, `html-wl`, or `pdf-wl`
- A presentation name (e.g., `2026-04-build-demo`)
- Both, in any order

## Resolve Presentation Directory

1. If a presentation name is given in `$ARGUMENTS`, resolve to `$PRESENTATIONS_DIR/.worktrees/{name}/{name}/`.
2. If not given, use the presentation directory from earlier in this conversation (e.g., from `/new-presentation` or `/open-presentation`).
3. If neither, ask the user.
4. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.

## Workflow

1. Resolve the presentation directory (see above).
2. Determine `TEMPLATE_DIR`: `/Users/hhkoo/Documents/Presentation/template-gen`
3. Map the format argument to a Makefile target: `html`, `pdf`, `html-wl`, or `pdf-wl`.
4. Run: `make -C "$TEMPLATE_DIR" $TARGET DIR="$PRESENTATION_DIR" THEME="${THEME:-bai-flat}"`
5. If build succeeds, report the output path.
6. If building HTML (html or html-wl), open it in the browser: `open "$PRESENTATION_DIR/output/slides.html"` (or `slides-wl.html` for whitelabel).
7. If build fails, read the error output and suggest fixes.
