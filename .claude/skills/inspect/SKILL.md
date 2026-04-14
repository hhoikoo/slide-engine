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
   cp slides.md "$OUTDIR/slides.md"
   "$TEMPLATE_DIR/node_modules/.bin/marp" --no-config --images png --image-scale 2 "$OUTDIR/slides.md"
   ```
   Note: marp-cli's `--images` flag conflicts with `--theme-set` and `--allow-local-files` (shows help instead of rendering). Use `--no-config` and omit those flags. Screenshots will use default styling instead of the custom theme, which is sufficient for detecting overflow, alignment, and content issues. The actual themed output is verified via `/build html`.
   This produces `slides.001.png`, `slides.002.png`, etc. in `$OUTDIR/`.
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
