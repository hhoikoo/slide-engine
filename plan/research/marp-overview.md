# Marp: Markdown Presentation Ecosystem — Overview

## What Is Marp?

Marp is an open-source presentation ecosystem that converts plain Markdown into slide decks. Its core philosophy: write content in Markdown, let the framework handle layout, and export to HTML, PDF, or PPTX without touching slide-builder UIs. Slides live as text files — diffable, versionable, LLM-friendly.

The project is maintained by Yuki Hattori (yhatt) and the marp-team GitHub organization. It is MIT-licensed, active as of 2025–2026, and widely used in developer and academic communities.

---

## Architecture

Marp is intentionally split across multiple focused repositories:

### Layer 1 — Core Framework

**Marpit** (`@marp-team/marpit`)
- The base framework. Provides: Markdown-to-slide parsing, `<section>`-based HTML output, CSS scoping, theme loading, directives, image syntax, presenter notes extraction.
- Deliberately minimal — no built-in themes, no emoji, no math.
- Other tools build on top of Marpit.

**Marp Core** (`@marp-team/marp-core`)
- Extends Marpit with practical features: built-in themes (default, gaia, uncover), emoji support via twemoji, math typesetting (MathJax/KaTeX), auto-scaling for headers and code blocks, GitHub Flavored Markdown (tables, strikethrough), inline SVG slides, CSS container queries, and automatic heading ID slugification.
- This is what most end users interact with indirectly.

### Layer 2 — Tooling

**Marp CLI** (`@marp-team/marp-cli`)
- Command-line interface and Node.js library for converting `.md` files to HTML, PDF, PPTX, PNG, JPEG, or presenter notes text.
- Supports watch mode, server mode, parallel batch processing.
- Allows swapping the engine (custom Marpit-based engine via `--engine`), loading themes from `--theme-set`, and full configuration via `marp.config.js`.

**Marp for VS Code** (`marp-team.marp-vscode`)
- VS Code extension. Live-preview of slides, directive IntelliSense, enhanced outline, direct export to PDF/PPTX/HTML from the editor.

### Inactive / Legacy

- **Marp Web**: PWA browser interface (inactive)
- **Marp React / Marp Vue**: Framework renderer components (outdated)

---

## How Theming Works

Themes are plain CSS files with a mandatory `/* @theme name */` metadata comment. The theme is loaded into Marp's `ThemeSet`, then applied via the `theme` directive in frontmatter.

```yaml
---
theme: gaia
---
```

Marp's CSS scoping wraps all selectors inside the container element automatically — theme authors write `section { ... }` and Marpit handles the rest. Themes can also define slide dimensions (`section { width: 1280px; height: 720px; }`), pagination styling via `section::after`, and header/footer elements.

Slides can extend themes inline:

```markdown
<style>
section {
  background: #1a1a2e;
}
</style>
```

Or per-slide using `<style scoped>`, which applies CSS only to the current slide via a generated `data-marpit-scope-*` attribute.

---

## Markdown Syntax

### Frontmatter

A YAML block at the top of the document sets global directives:

```markdown
---
marp: true
theme: default
paginate: true
size: 16:9
math: mathjax
html: true
header: "Company | Presentation Title"
footer: "2026"
---
```

The `marp: true` key is required only in some contexts (VS Code extension, certain configs) to activate Marp processing.

### Slide Separators

Slides are delimited by horizontal rules:

```markdown
# Slide 1 content

---

# Slide 2 content

---
```

- `---` (three dashes with blank lines around) creates a new slide.
- `___` or `***` are NOT valid slide separators — only `---`.
- `headingDivider` global directive auto-splits at heading levels (similar to Pandoc):

```yaml
---
headingDivider: 2
---
```

This creates a new slide at every `##` heading.

### Directives

Directives control slide properties. Two syntaxes:

**HTML comment (inline, any slide):**
```html
<!-- paginate: true -->
<!-- _class: lead -->
```

**Frontmatter (document-level):**
```yaml
---
paginate: true
theme: gaia
---
```

**Global directives** (affect whole deck, last value wins):

| Directive | Purpose |
|-----------|---------|
| `theme` | Select theme by name |
| `style` | Inline CSS to append to theme |
| `headingDivider` | Auto-split at heading levels (1–6, or array) |
| `lang` | HTML `lang` attribute |
| `size` | Slide size preset (e.g., `16:9`, `4:3`) |
| `math` | Math library (`mathjax` or `katex`) |

**Local directives** (apply to current slide and all following):

| Directive | Purpose |
|-----------|---------|
| `paginate` | `true` / `false` / `hold` / `skip` |
| `header` | Header text (Markdown supported) |
| `footer` | Footer text (Markdown supported) |
| `class` | CSS class on `<section>` |
| `backgroundColor` | Background color (CSS value) |
| `backgroundImage` | Background image (CSS `url(...)`) |
| `backgroundPosition` | CSS background-position (default: center) |
| `backgroundRepeat` | CSS background-repeat (default: no-repeat) |
| `backgroundSize` | CSS background-size (default: cover) |
| `color` | Text color (CSS value) |

**Scoped directives** (apply only to the current slide): prefix with `_`:
```html
<!-- _class: lead -->
<!-- _backgroundColor: #1a1a2e -->
<!-- _paginate: false -->
```

Custom directives can be registered via the `customDirectives` object on a Marpit/Marp instance.

### Image Handling

Marp extends standard Markdown image syntax via keywords in the alt text:

**Inline image sizing:**
```markdown
![w:200px](img.png)
![h:100px](img.png)
![w:32 h:32](img.png)
```

**CSS filters in alt text:**
```markdown
![blur:10px](img.png)
![grayscale:1](img.png)
![opacity:.5 blur:2px](img.png)
![brightness:.8 sepia:50%](img.png)
```
Available: `blur`, `brightness`, `contrast`, `drop-shadow`, `grayscale`, `hue-rotate`, `invert`, `opacity`, `saturate`, `sepia`.

**Background images** (keyword `bg`):
```markdown
![bg](background.jpg)
![bg cover](bg.jpg)
![bg contain](bg.jpg)
![bg 150%](bg.jpg)
![bg left](bg.jpg)           # Split: bg takes left half
![bg right](bg.jpg)          # Split: bg takes right half
![bg left:33%](bg.jpg)       # Split: bg takes 33% of width
```

Multiple background images stack horizontally (or `vertical` keyword for vertical stacking). Split backgrounds shrink the content area so text stays on the remaining half.

### Presenter Notes

Any HTML comment that is **not** a directive becomes a presenter note:

```markdown
# My Slide

Content here.

<!-- This is a presenter note. It will appear in the presenter view. -->
<!-- Second paragraph of notes. -->
```

Notes are:
- Collected per-slide in `marp.render()` output as the `comments` array.
- Accessible in the Bespoke HTML template's presenter view (press `p`).
- Exportable as a text file: `marp --notes deck.md -o notes.txt`
- Included in PDF with `--pdf-notes` flag.

---

## Export Formats

### HTML (default)

```bash
marp deck.md
marp deck.md -o output.html
```

Two templates:
- **Bespoke** (default): Full interactive presentation with keyboard/swipe navigation, fullscreen (F), presenter view (P), overview (O), optional progress bar (`--bespoke.progress`), slide transitions via View Transition API (`--bespoke.transition`), on-screen controller.
- **Bare**: Minimal HTML, no interactivity — good for embedding.

### PDF

```bash
marp --pdf deck.md
marp --pdf --pdf-notes deck.md          # include presenter notes
marp --pdf --pdf-outlines deck.md       # add bookmarks
```

Requires a browser (Chrome, Edge, Firefox) for headless rendering via CDP or WebDriver BiDi. High visual fidelity — what you see in HTML is what you get in PDF.

### PPTX (PowerPoint)

```bash
marp --pptx deck.md
marp --pptx --pptx-editable deck.md    # experimental: requires LibreOffice
```

Standard PPTX embeds rendered slide images — compatible with PowerPoint, Keynote, Google Slides, LibreOffice Impress. Presenter notes are included.

`--pptx-editable` produces editable text/shapes (via LibreOffice) but with lower visual fidelity; known issues with complex themes like Gaia.

### Images

```bash
marp --image png deck.md               # title slide only → deck.png
marp --images png deck.md              # all slides → deck.001.png, deck.002.png, ...
marp --images jpeg --jpeg-quality 90 deck.md
marp deck.md -o cover@2x.png --image-scale 2
```

### Presenter Notes Text

```bash
marp --notes deck.md
marp deck.md -o notes.txt
```

---

## Strengths

1. **Plain-text source**: Markdown is diffable, version-controllable, and trivially LLM-generated. No binary formats.
2. **CSS-based theming**: Full CSS power — grid layouts, custom fonts, variables, animations.
3. **Inline SVG slides**: Aspect-ratio-preserving scaling without JavaScript, works in print.
4. **Multiple export formats**: HTML, PDF, PPTX, images from one source.
5. **Extensible engine**: Custom markdown-it plugins, PostCSS plugins, custom directives — all composable.
6. **Minimal runtime**: HTML output can be self-contained with no server needed.
7. **Configuration files**: `marp.config.js` for project-level settings (theme, engine, output paths).
8. **Automation-friendly**: CI/CD with GitHub Actions, Docker image available.
9. **Active ecosystem**: VS Code extension, Obsidian plugin, JupyterLab support, community themes.

## Limitations

1. **Browser required for PDF/PPTX/images**: Cannot convert without Chrome/Edge/Firefox installed; adds infrastructure weight in headless CI.
2. **PPTX editable is experimental**: `--pptx-editable` uses LibreOffice and has known fidelity issues; complex themes may fail.
3. **No true multi-column built-in**: Column layouts require HTML `<div>` elements inside Markdown, mixing concerns. Not pure Markdown.
4. **Theme slide dimensions are fixed**: The `width`/`height` in theme CSS defines slide size; cannot be changed per-slide or via CSS custom properties (must use absolute units).
5. **Inline SVG required for advanced backgrounds**: Split bg, multiple bg images, and bg filters only work when inline SVG mode is enabled (it is on by default in marp-core, but not in bare Marpit).
6. **CSS scoping can surprise**: Marpit rewrites all CSS selectors to scope them — some selectors may behave unexpectedly. The `:root` selector targets `<section>`, not `<html>`.
7. **No slide animations between elements**: Built-in fragment/animation support via `<!-- fit -->` and Marpit fragments, but not full reveal.js-style step animations (fragments are an opt-in plugin that can be disabled).
8. **Math rendering requires script injection**: MathJax/KaTeX inject scripts; in strict CSP environments you need to configure nonces.
9. **No native speaker-timer or annotation tools**: Presenter view is basic — no timer, no annotation layer.
10. **HTML tag restrictions by default**: Raw HTML is denied unless `html: true` is set in config or frontmatter. Even then, some elements may be on a blocklist.

---

## Key Packages and Versions (as of 2025–2026)

| Package | npm name | Role |
|---------|----------|------|
| Marpit | `@marp-team/marpit` | Base framework |
| Marp Core | `@marp-team/marp-core` | Core with themes + features |
| Marp CLI | `@marp-team/marp-cli` | CLI + Node.js API |
| Marp for VS Code | (VS Code Marketplace) | Editor extension |

Node.js v18+ is required for Marp CLI.

---

## References

- [marp.app](https://marp.app/) — Official website
- [github.com/marp-team/marp](https://github.com/marp-team/marp) — Entrance repository
- [github.com/marp-team/marp-core](https://github.com/marp-team/marp-core) — Marp Core
- [github.com/marp-team/marp-cli](https://github.com/marp-team/marp-cli) — Marp CLI
- [github.com/marp-team/marpit](https://github.com/marp-team/marpit) — Marpit framework
- [github.com/marp-team/awesome-marp](https://github.com/marp-team/awesome-marp) — Community resources
- [marpit.marp.app](https://marpit.marp.app/) — Marpit documentation
