# Slidev vs Marp: Head-to-Head Comparison for a Presentation Generation Harness

## Context

A "presentation generation harness" means: an automated or semi-automated pipeline where an LLM (or templating system) produces slide content from structured input (e.g., research briefs, product specs, meeting notes), applies a corporate template, and outputs finished slides — ideally as PDF, PPTX, or a hosted SPA.

This comparison evaluates both tools through that specific lens.

---

## Quick Reference Summary

| Dimension | Marp | Slidev |
|---|---|---|
| Paradigm | Pure Markdown → slides | Markdown + Vue components → web app |
| Learning curve | Very low | Moderate to high |
| LLM output reliability | High (simple syntax) | Medium (Vue/directive knowledge needed) |
| Theming | CSS file per theme | npm packages with Vue layouts |
| Corporate templates | CSS-based | Vue SFCs + CSS variables (more structured) |
| PPTX output | Editable shapes | Image-embedded only |
| PDF output | Yes | Yes (Playwright) |
| SPA output | No | Yes |
| Interactivity | None | Full (Vue components, live code) |
| Build pipeline | Simple (single binary or CLI) | Complex (Node.js + Playwright) |
| CI/CD friendliness | High | Medium |
| Memory footprint | ~650MB | ~2400MB |
| Rendering speed | ~2.8ms/slide | ~8.1ms/slide |
| GitHub stars | ~7,000 | ~45,600 |
| Standalone binary | Yes | No |

---

## 1. Markdown Syntax Complexity

### Marp

Marp uses pure CommonMark with two additions:
- `---` as slide separator
- YAML frontmatter directives

A complete Marp slide file:

```markdown
---
marp: true
theme: corporate
paginate: true
---

# Title Slide

Company Name | April 2026

---

<!-- _class: lead -->

## Section Header

---

# Content Slide

- Point one
- Point two
- Point three

![bg right:40%](image.png)
```

That is essentially all the syntax an LLM needs to know to produce valid Marp output. The image directive (`![bg right:40%]`) is the most Marp-specific feature, but it is easy to learn.

### Slidev

Slidev's basic syntax is similar, but complex slides immediately require Vue and UnoCSS knowledge:

```markdown
---
theme: corporate
---

# Title Slide

---
layout: two-cols
---

# Left Content

<v-click>

- Revealed on click

</v-click>

::right::

<MyChart :data="[1, 2, 3]" />
```

For a purely static slide deck (no interactivity), the LLM can stay close to Marp-like syntax. The complexity spikes when:
- Layouts need per-region content (named slots with `::slot-name::` syntax)
- Click animations are used (`v-click`, `v-clicks`)
- Custom Vue components are embedded
- UnoCSS utility classes are needed for layout adjustments

**Winner for LLM generation: Marp** — simpler, more constrained syntax produces more reliable output. Slidev's extended syntax is harder for LLMs to use correctly, especially for Slidev-specific directives.

---

## 2. LLM / AI Content Generation

### Marp — LLM Friendliness

Strengths:
- The entire Marp syntax fits in a small system prompt
- No programming language knowledge required
- Output is deterministic and predictable
- Easy to validate (just check for `---` separators and valid YAML)
- Works well with templated prompts: "given this outline, produce a Marp slide file using theme X"

Weaknesses:
- Layout options are limited to CSS class names, which the LLM must know from the theme
- Image directives require knowing the image file paths ahead of time
- No mechanism to embed dynamic content

### Slidev — LLM Friendliness

Strengths:
- For simple slides, syntax is close to Marp
- Layout names (`layout: two-cols`, `layout: image-right`) are semantic and easy to use
- themeConfig is YAML-based and straightforward

Weaknesses:
- LLMs struggle with Slidev-specific directives (`v-click`, `::right::`, magic-move syntax)
- Vue component usage requires knowing component API
- Files become cluttered with HTML/Vue code for complex layouts
- Observed in practice (2025 testing): "Claude was more ambitious but had small, fixable syntax errors" and struggled with systematic coverage of all slides
- The richer the template, the more Slidev-specific knowledge the LLM needs

### Practical Implication

For a generation harness producing **static, corporate slide decks** (no interactivity needed):
- Marp produces cleaner, more reliable output from LLM prompts
- Slidev output quality degrades as slide complexity increases

For a harness producing **developer presentations with code demos**:
- Slidev's code highlighting and Magic Move features are uniquely valuable
- Worth the added prompt complexity

**Winner for AI generation: Marp** (for static/corporate decks), **Slidev** (for code-heavy developer talks).

---

## 3. Theming Flexibility

### Marp Theming

Marp themes are a single CSS file imported via directive:

```markdown
---
theme: custom
---
```

CSS with Marp's selector conventions:
```css
/* @theme corporate */
section {
  background-color: #fff;
  color: #1A1A2E;
  font-family: 'Inter', sans-serif;
}

section.cover {
  background: linear-gradient(135deg, #FF6B35, #1A1A2E);
  color: white;
}

h1 { color: #FF6B35; }
```

Marp uses `section` as the slide container and CSS classes (via `_class` directive) to apply variant styles.

Limitations:
- Layout is fully CSS-based — no slots, no component logic
- Multi-column layouts require CSS Grid/Flexbox with specific class names
- No programmatic behavior (counters, navigation state)
- Custom components not possible
- Themes distributed as CSS files, not as versioned packages

### Slidev Theming

As detailed in `slidev-theming.md`:
- Themes are npm packages with Vue SFCs for layouts
- Named slots for multi-region layouts
- UnoCSS shortcuts for brand utilities
- themeConfig for user-facing configuration
- Global layers (footer, overlays) via special Vue files
- Access to navigation state (`$nav`, `$page`) in templates

Limitations:
- Requires Vue knowledge to create or maintain
- More complex toolchain to set up

**Winner for theming flexibility: Slidev** — Vue SFCs provide structural layouts that CSS alone cannot achieve. Marp theming is simpler to write but less powerful.

---

## 4. Template Reusability

### Marp

- One CSS file = one theme
- Slide classes (`<!-- _class: two-cols -->`) trigger variant styles
- Multi-column layouts must use Marp's image directives or custom CSS hacks
- No component reuse — every slide is flat Markdown
- Templates are distributed by sharing the CSS file

### Slidev

- Layouts are reusable Vue components published as npm packages
- Components (logos, footers, charts) are auto-imported from the theme
- `themeConfig` makes themes configurable without modification
- Version-pinned via npm — upgrade all presentations by bumping the package
- Named slot system makes layout intent explicit in slide source

**Winner for template reusability: Slidev** — npm-based distribution, Vue components, and named slots create a genuinely reusable template system. Marp's CSS approach works but does not scale well.

---

## 5. Build Pipeline Complexity

### Marp Pipeline

```
slides.md + theme.css
    → marp CLI (single Node.js binary, or Docker)
    → PDF / HTML / PPTX
```

- No build system configuration required
- Standalone binaries available (no Node.js needed)
- Fast: ~2.8ms per slide
- Low memory: ~650MB
- Works in any CI environment; tiny Docker image possible
- Can run via GitHub Actions with `marp-action`
- `marp --pdf slides.md` is the entire build step

### Slidev Pipeline

```
slides.md + theme (npm)
    → slidev dev (Vite dev server, HMR)
    → slidev export (Playwright/Chromium PDF/PNG)
    → slidev build (Vite production SPA)
```

- Requires Node.js ≥ 20.12
- Requires Playwright + Chromium for PDF/PNG export (~300MB Chromium download)
- Vite-based build: more complex configuration surface
- Higher memory: ~2400MB
- CI setup is more involved (must install Node, npm deps, Playwright browsers)
- `slidev export` can fail if Playwright dependencies are missing
- Slower: ~8ms per slide + Vite startup overhead

**Winner for build pipeline simplicity: Marp** — dramatically simpler. One binary, no Playwright, fast and lightweight.

---

## 6. Output Formats

| Format | Marp | Slidev |
|---|---|---|
| PDF | Yes | Yes |
| HTML (static) | Yes | Yes (SPA) |
| PNG/images | Yes | Yes |
| PPTX (editable) | Yes — `--pptx-editable` | No — images only |
| Hosted SPA | No | Yes |
| Markdown re-export | No | Yes |

**Marp advantage:** Editable PPTX is a significant differentiator for corporate workflows where stakeholders need to make last-minute edits in PowerPoint. Slidev's PPTX contains rasterized images — the deck cannot be edited in PowerPoint.

**Slidev advantage:** SPA output is a real hosted presentation URL, shareable and viewable in any browser without downloading anything. Marp's HTML output is a basic static file.

**Winner for output formats: Tie** — Marp wins for corporate workflows needing editable PPTX; Slidev wins for web-first sharing.

---

## 7. Image Handling

### Marp

Marp has powerful image directives built into the Markdown syntax:

```markdown
![bg](background.jpg)              # full background
![bg right:40%](image.jpg)         # right panel, 40% width
![bg left](image.jpg)              # left panel
![bg cover](image.jpg)             # cover fit
![bg contain](image.jpg)           # contain fit
![bg blur](image.jpg)              # blur filter
![w:300px](inline-image.jpg)       # inline with width
```

This handles most layout scenarios purely in Markdown, without CSS. LLMs can learn these directives easily.

### Slidev

Images in Slidev are handled through:
- Standard Markdown image syntax (inline)
- CSS `background` in frontmatter: `background: /image.jpg`
- Layout props: `image: /image.jpg` for `image-right`, `image-left` layouts
- UnoCSS utilities for sizing

Slidev does not have Marp's image directive shorthand. Positioning images precisely often requires UnoCSS utility classes or HTML.

**Winner for image handling in LLM generation: Marp** — the image directive syntax is compact, powerful, and easy to prompt for.

---

## 8. Corporate Template Support

### Marp

A corporate Marp theme consists of:
- One CSS file with `section.cover`, `section.lead`, `section.content` variants
- Optional custom fonts via `@font-face`
- Header/footer via Marp's built-in `header` and `footer` directives

Limitations:
- Footer/header are plain text or simple HTML only
- No computed content (slide numbers formatted differently per section, etc.)
- Cannot inject logo as a persistent SVG across all slides programmatically
- Variants are triggered by class names the LLM must know

Works well for: simple branded decks with 2–3 layout variants.
Breaks down for: complex multi-layout presentations with dynamic footer, chapter tracking, speaker cards.

### Slidev

A corporate Slidev theme can provide:
- 10+ structured layouts as Vue SFCs
- Persistent logo/footer via `global-bottom.vue`
- Navigation-aware components (`$page / $nav.total`)
- themeConfig for per-deck overrides (logo URL, primary color, show/hide footer)
- Chapter-aware section layouts
- Speaker intro layout with headshot support

Works well for: full corporate presentation systems with consistent identity.
Requires: more upfront investment, Vue knowledge for maintenance.

**Winner for corporate template richness: Slidev** — once the theme is built, it provides a more complete, consistent, and configurable corporate identity than Marp can achieve.

---

## 9. Community and Ecosystem Size

| Metric | Marp | Slidev |
|---|---|---|
| GitHub stars | ~7,000 | ~45,600 |
| npm weekly downloads | Moderate | Higher |
| Official themes | 3 (`default`, `gaia`, `uncover`) | 5 |
| Community themes | Limited (CSS files) | 50+ npm packages |
| Addons/plugins | Marpit plugin API | npm addons + full Vite plugin ecosystem |
| VS Code extension | Yes | Yes |
| Discord/community | Small | Active Discord |
| Project age | March 2018 | April 2021 |
| Maintenance | Active | Very active |
| Contributors | Smaller team | Larger community |

Slidev has a significantly larger and more active community. It also benefits from being in the Vue/Vite ecosystem, which is massive. Marp's community is smaller but stable.

**Winner for ecosystem: Slidev** — more themes, more addons, larger community.

---

## 10. Decision Matrix for the Harness Use Case

### Choose Marp if:

- The primary output format is PDF or editable PPTX
- Slide decks are relatively simple (cover, content, section, two-col layouts)
- You want the simplest possible build pipeline (important for CI/CD)
- LLM prompt reliability is the top priority
- The team has no Vue.js experience
- You need a standalone binary (Docker, serverless) with minimal dependencies
- Decks are purely static — no interactivity needed

### Choose Slidev if:

- Presentations target developers and include live code, demos, or interactive elements
- A hosted, shareable SPA URL is desirable
- You want a rich, versioned corporate theme npm package with full layout coverage
- The team is comfortable with Vue.js
- You can accept the Playwright/Chromium dependency for CI
- Real-time collaboration or presenter features are valuable
- Theming needs to scale across many presentations with version control

### Hybrid Approach

It is possible to use **both** in a harness:
- Marp for quick, simple PDF exports (internal reports, status updates)
- Slidev for polished developer-facing or conference presentations

The LLM layer generates a common structured JSON/YAML representation, and a renderer adapter produces either Marp or Slidev Markdown from it.

---

## Side-by-Side Syntax Example

### Marp — Two-Column Layout

```markdown
---
marp: true
theme: corporate
---

# Architecture Overview

<div class="two-cols">
<div>

## Left Column
- Point A
- Point B

</div>
<div>

![](diagram.png)

</div>
</div>
```

(Requires CSS `.two-cols` defined in theme)

### Slidev — Two-Column Layout

```markdown
---
layout: two-cols
---

# Architecture Overview

## Left Column
- Point A
- Point B

::right::

![](diagram.png)
```

Slidev's named slot syntax (`::right::`) is cleaner for multi-region layouts once you know the convention. Marp requires raw HTML divs for columns.

---

## Final Recommendation

For a **presentation generation harness targeting corporate slide decks with PDF/PPTX output**:

**Primary recommendation: Marp**
- Simpler LLM prompting with more reliable output
- Faster, lighter build pipeline
- Editable PPTX output for business stakeholders

**Secondary recommendation: Slidev** for a premium tier
- More interactive, web-first presentations
- Superior theming system for long-term corporate brand management
- Use when the audience is technical or when SPA hosting is the output target

For the specific case of **developer conference talks with code demos**: Slidev is clearly superior and worth the added complexity.

---

*Sources:*
- https://sli.dev/guide/why
- https://marp.app/
- https://github.com/slidevjs/slidev/discussions/86
- https://dasroot.net/posts/2026/04/markdown-presentation-tools-marp-slidev-reveal-js/
- https://www.pkgpulse.com/blog/slidev-vs-marp-vs-revealjs-code-first-presentations-2026
- https://stackshare.io/stackups/marp-vs-slidev
- https://tonai.github.io/blog/posts/slide-libraries/
- https://snyk.io/blog/slidev-101-coding-presentations-with-markdown/
- https://github.com/iodigital-com/slidev-theme-iodigital
