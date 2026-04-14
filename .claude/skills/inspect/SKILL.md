---
name: inspect
description: Visually inspect slides by capturing screenshots and analyzing them for layout/design issues. Usage: /inspect [slide-number]
argument-hint: "[slide-number]"
---

# Inspect Slides

Capture slide screenshots and visually analyze them for layout and design issues.

## Input

`$ARGUMENTS` is an optional slide number. If omitted, inspect all slides.

## Workflow

1. **Find the presentation directory**: Look for `sections/` in cwd or parent.
2. **Build first**: Run `/build html` to ensure `slides.md` and `output/.merged-theme.css` exist.
3. **Capture screenshots**:
   ```bash
   OUTDIR=$(mktemp -d)
   TEMPLATE_DIR="/Users/hhkoo/Documents/Presentation/template-gen"
   THEME_DIR="$TEMPLATE_DIR/themes/bai-flat"
   cp slides.md "$OUTDIR/slides.md"
   cp output/.merged-theme.css "$OUTDIR/.merged-theme.css"
   cd "$OUTDIR"
   THEME_DIR="$THEME_DIR" npx marp --no-stdin --images png --image-scale 2 \
     --allow-local-files --html \
     --config "$TEMPLATE_DIR/engine/marp.config.js" \
     --theme-set "$OUTDIR/.merged-theme.css" \
     slides.md
   ```
   This produces `slides.001.png`, `slides.002.png`, etc.
4. **Read slide images**: Use the Read tool on each PNG file (Claude can read images natively).
   - If a specific slide number was given, only read that one (e.g., `slides.003.png` for slide 3).
   - Otherwise read all of them.
5. **Analyze each slide** for:
   - Text overflow or content cut off
   - Layout alignment issues
   - Empty or sparse slides
   - Image sizing problems
   - Readability (font size, contrast)
   - Inconsistent spacing
   - Broken or missing images
6. **Report findings**: For each issue, specify the slide number, what's wrong, and a suggested fix (referencing the markdown source).
7. **Clean up**: Remove the temp directory.
