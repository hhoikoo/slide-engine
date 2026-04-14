# Content Assets

> Status: TODO
> Last updated: 2026-04-14

## What This Is

Skills and engine support for getting non-text content into slides: fetching images from URLs, rendering Mermaid diagrams, and managing the `images/` directory.

## Scope

### 1. Image fetching skill

A `/fetch-image <url> [filename]` skill that downloads an image and stores it in the presentation's `images/figures/` directory.

Workflow:
1. Accept a URL and optional filename (default: derive from URL)
2. Download to `images/figures/`
3. Print the relative path for use in markdown (`![alt](images/figures/filename.png)`)

Handles common cases:
- Direct image URLs (`.png`, `.jpg`, `.svg`, `.webp`)
- URLs that need content-type sniffing (no extension)
- Optional resize/convert via ImageMagick or sips (macOS) if the image is very large

Does not handle:
- Screenshots of web pages (that is a different tool)
- Bulk downloading (one image per invocation)

### 2. Mermaid diagram rendering

Marp does not natively render Mermaid code blocks. Two approaches:

**Option A: Pre-process step in the build pipeline.** Scan the assembled `slides.md` for ````mermaid` blocks, render each to SVG via `mmdc` (mermaid-cli), replace the block with an `![](images/generated/mermaid-N.svg)` reference. Add as a step before the marp invocation in the Makefile.

**Option B: Marp plugin.** Write a custom markdown-it plugin loaded in `marp.config.js` that renders Mermaid at build time. More integrated but harder to debug.

Option A is simpler and keeps Mermaid as an optional dependency. Start there.

Dependencies:
- `@mermaid-js/mermaid-cli` as an optional devDependency (or expect it globally)
- A new script: `engine/scripts/render-mermaid.sh` or `.js`

### 3. Image management conventions

Document the conventions for `images/`:
- `images/figures/` for hand-sourced or fetched images
- `images/generated/` for AI-generated images (plan/91) and Mermaid output
- Relative paths in markdown (`images/figures/arch.svg`)
- Theme assets via `/assets/...` prefix (already documented)

## Dependencies

- Plan/01 Phase 1-2 (engine must be set up)
- Plan/91 is related (Gemini image generation) but independent

## Implementation Order

1. `/fetch-image` skill (no engine changes needed)
2. Mermaid pre-processing script + Makefile integration
3. Update CLAUDE.md with image conventions
