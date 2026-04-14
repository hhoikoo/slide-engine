---
name: build
description: Build presentation slides to HTML or PDF. Usage: /build [html|pdf]
argument-hint: "[html|pdf]"
---

# Build

Compile Marp slides to HTML or PDF.

## Input

`$ARGUMENTS` is the output format: `html` (default) or `pdf`.

## Workflow

1. Detect the current presentation directory (look for `sections/` in cwd or parent).
2. Determine `TEMPLATE_DIR` -- the template-gen repo root. Default: `/Users/hhkoo/Documents/Presentation/template-gen`
3. Run: `make -C "$TEMPLATE_DIR" $FORMAT DIR="$PRESENTATION_DIR" THEME="${THEME:-bai-flat}"`
4. If build succeeds, report the output path.
5. If building HTML, open it in the browser: `open "$PRESENTATION_DIR/output/slides.html"`
6. If build fails, read the error output and suggest fixes.

## Fallback

If the Makefile or engine is not set up, fall back to crude assembly + direct marp invocation:
```bash
cat sections/*.md > slides.md
npx marp --html --allow-local-files slides.md -o output/slides.html
```
