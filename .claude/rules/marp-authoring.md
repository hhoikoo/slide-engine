---
paths:
  - "**/*.md"
---
# Marp Slide Authoring

## Section File Format

Presentations use multi-file sectioned authoring under `sections/`.

`00.md` carries no slide content. It holds the YAML frontmatter block, and optionally a deck-scoped `<style>` block after it:
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
- The first file must use a `00` prefix (assembler convention for frontmatter detection), enforced by `engine/scripts/assemble-sections.sh:23`.
- `slides.md` is a build artifact assembled from `sections/` by `assemble-sections.sh`. Do not edit it directly.

Deck folder shape, slide identity and figure identity live in `docs/deck-lifecycle.md`.

## Engine Gotchas

- **Two-column `<div>` blank lines:** Marp requires blank lines around `<div>` tags inside slides for markdown to render inside them.
- **Four-box `<b>` syntax:** The four-box layout uses `<b>Title</b>` tags for box headers, not `**bold**`.
- **Image path conventions:** Local images use relative paths (`images/figures/f03.svg`). Theme assets use the `/assets/...` prefix (resolved to `THEME_DIR/assets/` by the engine).
- **Opaque figure names:** git-crypt does not encrypt paths, so figure filenames are public on GitHub. Every figure is `fNN.<ext>`, allocated in `draft/figures.md`. See `docs/deck-lifecycle.md`, Figure identity.
- **Layout class directive placement:** `<!-- _class: layout-name -->` must be the first line Marp sees after the slide separator. A `<!-- _slide: S.n -->` marker may precede it in the section file; `assemble-sections.sh` strips those before Marp reads anything. Marp folds an unknown local directive into the slide's presenter notes rather than ignoring it, which is why the strip exists.
- **Speaker notes:** Use `<!-- ... -->` HTML comments. Must appear after all slide content on the slide.
- **Emoji rendering:** Marp uses twemoji, which converts Unicode emoji to `<img>` elements that break inline layout. Avoid Unicode emoji in slides.
- **CJK bold:** Handled by the `markdown-it-cjk-friendly` plugin (no `<b>` workaround needed).
- **Diagrams: prefer hand-authored SVG over mermaid.** For any diagram that carries real weight (architecture, data flow, sequences, timelines), author a clean SVG under `images/figures/` using the theme palette and reference it as a normal image. Hand-built SVGs give deliberate layout, on-brand styling, and predictable rendering; mermaid auto-layout is a fallback for throwaway or quick-draft diagrams only. Mermaid is still supported: standard ```mermaid code blocks are rendered to SVG via `mmdc` (mermaid-cli) before marp, and left as-is if mmdc is missing.
- **Build variants:** Use `<!-- vendor-start -->` / `<!-- vendor-end -->` and `<!-- whitelabel-start -->` / `<!-- whitelabel-end -->` markers in slide content. The `html-wl`/`pdf-wl` targets strip vendor blocks and apply term substitutions from a per-presentation `variants.yaml` (or `variants.json`). Block stripping always runs; only the substitutions need the file. Its schema is a `substitutions:` map of literal find-and-replace pairs, longest key first, applied to whitelabel builds only.

## Citation System

Slides can reference research docs via `<sup>[research:{id}]</sup>` markers where `{id}` is the research doc's frontmatter ID. Running `node engine/scripts/generate-citation-map.js <presentation-dir>` assigns `[1]`, `[2]`... by order of first appearance, rewrites the markers in-place, generates `research/citation-map.md`, and creates a `{NN}-references.md` section file. The script is idempotent.
