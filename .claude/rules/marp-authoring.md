---
paths:
  - "**/*.md"
---
# Marp Slide Authoring

## Section File Format

Presentations use multi-file sectioned authoring under `sections/`.

`00-frontmatter.md` contains only the YAML frontmatter block:
```markdown
---
marp: true
theme: bai-flat
paginate: true
html: true
header: "Talk Title"
---
```

Other section files contain one or more slides separated by `---`:
```markdown
## Slide Title

- Point one
- Point two

<!--
Speaker notes for this slide.
-->

---

## Next Slide

Content here.
```

Rules:
- No leading `---` at the start of section files (the assembler handles joins between files).
- The first file must use a `00-` prefix (assembler convention for frontmatter detection).
- `slides.md` is a build artifact assembled from `sections/` by `assemble-sections.sh`. Do not edit it directly.

## Engine Gotchas

- **Two-column `<div>` blank lines:** Marp requires blank lines around `<div>` tags inside slides for markdown to render inside them.
- **Four-box `<b>` syntax:** The four-box layout uses `<b>Title</b>` tags for box headers, not `**bold**`.
- **Image path conventions:** Local images use relative paths (`figures/arch.svg`). Theme assets use the `/assets/...` prefix (resolved to `THEME_DIR/assets/` by the engine).
- **Layout class directive placement:** `<!-- _class: layout-name -->` must be the first line after the slide separator.
- **Speaker notes:** Use `<!-- ... -->` HTML comments. Must appear after all slide content on the slide.
- **Emoji rendering:** Marp uses twemoji, which converts Unicode emoji to `<img>` elements that break inline layout. Avoid Unicode emoji in slides.
- **CJK bold:** Handled by the `markdown-it-cjk-friendly` plugin (no `<b>` workaround needed).
- **Mermaid diagrams:** Use standard ```mermaid code blocks in section files. The build pipeline renders them to SVG via `mmdc` (mermaid-cli) before marp. If mmdc is not installed, mermaid blocks are left as-is.
- **Build variants:** Use `<!-- vendor-start -->` / `<!-- vendor-end -->` and `<!-- whitelabel-start -->` / `<!-- whitelabel-end -->` markers in slide content. The `html-wl`/`pdf-wl` targets strip vendor blocks and apply term substitutions from `variants.yaml`.

## Citation System

Slides can reference research docs via `<sup>[research:{id}]</sup>` markers where `{id}` is the research doc's frontmatter ID. Running `node engine/scripts/generate-citation-map.js <presentation-dir>` assigns `[1]`, `[2]`... by order of first appearance, rewrites the markers in-place, generates `research/citation-map.md`, and creates a `{NN}-references.md` section file. The script is idempotent.
