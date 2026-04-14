---
name: build
description: Build presentation slides to HTML or PDF. Usage: /build [html|pdf|html-wl|pdf-wl]
argument-hint: "[html|pdf|html-wl|pdf-wl]"
---

# Build

Compile Marp slides to HTML or PDF.

## Input

`$ARGUMENTS` is the output format:
- `html` (default): vendor/default HTML
- `pdf`: vendor/default PDF
- `html-wl`: whitelabel HTML
- `pdf-wl`: whitelabel PDF

## Workflow

1. Detect the current presentation directory (look for `sections/` in cwd or parent).
2. Determine `TEMPLATE_DIR` -- the template-gen repo root. Default: `/Users/hhkoo/Documents/Presentation/template-gen`
3. Map the argument to a Makefile target: `html`, `pdf`, `html-wl`, or `pdf-wl`.
4. Run: `make -C "$TEMPLATE_DIR" $TARGET DIR="$PRESENTATION_DIR" THEME="${THEME:-bai-flat}"`
5. If build succeeds, report the output path.
6. If building HTML (html or html-wl), open it in the browser: `open "$PRESENTATION_DIR/output/slides.html"` (or `slides-wl.html` for whitelabel).
7. If build fails, read the error output and suggest fixes.

## Fallback

If the Makefile or engine is not set up, fall back to crude assembly + direct marp invocation:
```bash
cat sections/*.md > slides.md
npx marp --html --allow-local-files slides.md -o output/slides.html
```
