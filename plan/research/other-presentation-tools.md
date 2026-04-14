# Survey of Markdown / Text-Based Presentation Tools

> Research date: April 2026. This survey covers tools beyond Marp and Slidev.

---

## 1. reveal.js + reveal-md

**What it is:** reveal.js is the dominant HTML presentation framework — a JavaScript library that turns structured HTML (or Markdown) into full-featured browser presentations. reveal-md is a companion CLI that lets you point it at any `.md` file and instantly serve or export a reveal.js deck.

**Markdown format:**
- Slides are separated by `---` (horizontal) or `----` (vertical/nested)
- Front matter controls global config (theme, transition, highlight style)
- Speaker notes go in `<aside class="notes">` or after a `Note:` line
- Inline HTML is fully supported for custom layouts

**Theming:**
- 11 built-in themes (black, white, moon, sky, league, beige, serif, simple, blood, night, solarized)
- Custom themes are plain CSS/SCSS loaded via `--theme` flag or front matter
- Remote theme URLs work too (CDN-hosted custom CSS)

**Export options:**
- PDF via Puppeteer (built into reveal-md): `reveal-md deck.md --print slides.pdf`
- Static HTML bundle: `reveal-md deck.md --static ./dist`
- Quarto wraps reveal.js and adds its own export pipeline (HTML, PDF, PPTX)

**Pros for AI-driven generation:**
- Pure Markdown → slide mapping is trivial to prompt for
- The separator convention (`---`) is easy for an LLM to reproduce reliably
- reveal-md's `--watch` mode enables rapid iteration loops
- Front matter YAML controls virtually every visual property programmatically
- Plugin ecosystem (Mermaid, MathJax, code highlight) embeds cleanly in Markdown

**Cons:**
- Speaker notes syntax is slightly awkward in raw Markdown
- Nested slides add complexity to prompt engineering
- Full custom themes require CSS knowledge; not as plug-and-play as Marp themes
- No native PPTX output (PDF only via Puppeteer, or via Quarto)

---

## 2. Remark.js

**What it is:** A minimalist, browser-based Markdown presentation framework. Slides live in a single HTML file with Markdown in a `<textarea>`. Remark is the engine behind R's **xaringan** package.

**Markdown format:**
- Slides separated by `---`
- Presenter notes after `???`
- Layout classes applied with `class:` at the top of a slide
- Two-column layout: `.left-column[]` / `.right-column[]` shortcodes
- Content classes: `.red[]`, `.large[]`, etc. for inline styling

**Theming:**
- CSS-only theming; no built-in theme switcher CLI
- xaringan (R wrapper) provides several polished themes and a `xaringan::inf_mr()` infinite moon reader for live reload
- The bare framework is intentionally unstyled — you bring your own CSS

**Export options:**
- Print-to-PDF via browser (`?print-pdf` URL parameter in some setups)
- xaringan decks can render to PDF via `pagedown::chrome_print()`
- No native static-site export; the HTML file is self-contained

**Pros for AI-driven generation:**
- Extremely simple format — easy to generate programmatically
- Presenter notes (`???`) are naturally structured for LLM content
- xaringan integrates with R Markdown's code execution pipeline
- Low JavaScript dependency footprint

**Cons:**
- Largely in maintenance mode; core development has slowed
- No native CLI (you serve the HTML yourself)
- Theming requires writing CSS from scratch
- Not ideal for non-R workflows; JS-only usage is barebones
- Export quality depends on browser print behavior

---

## 3. Spectacle (React-based)

**What it is:** A React component library from Formidable Labs for building presentations in JSX or MDX. The big selling point: you can embed live-running React components, code playgrounds, and demos directly in slides.

**Markdown/format:**
- Primary authoring is in JSX (React components)
- MDX mode (`spectacle-mdx`) lets you write slides in Markdown with JSX islands
- Slides separated by `---` in MDX mode; JSX `<Slide>` components otherwise
- `MarkdownSlides` tagged template literal converts raw Markdown to slides

**Theming:**
- Themes are JavaScript objects mapping component names to style objects
- Full React ecosystem for customization (CSS-in-JS, styled-components)
- Markdown-generated tags use theme defaults (not configurable per-tag)

**Export options:**
- Static build via standard React/webpack pipeline
- PDF via browser print or puppeteer scripting
- No built-in CLI export; requires a build step

**Pros for AI-driven generation:**
- Excellent for tech demos where code needs to run live on the slide
- Component-level reuse means templates can be React components
- MDX mode gives a reasonable Markdown-ish authoring surface

**Cons:**
- High barrier to entry: requires Node, React, build toolchain
- Not a good target for pure Markdown → slides workflows
- LLM-generated JSX is messier and harder to validate than plain Markdown
- Theme changes require JS code edits, not simple config switches
- Smaller community than reveal.js; less active development in 2025–2026

---

## 4. Beamer (LaTeX)

**What it is:** The standard LaTeX document class for academic and scientific presentations. Produces high-quality PDF slides with precise mathematical typesetting.

**Markdown/format:**
- Native format is LaTeX: `\begin{frame}{Title}...\end{frame}`
- Can be authored from Markdown via **Pandoc** (`pandoc -t beamer input.md -o out.pdf`)
- Quarto supports `format: beamer` with Markdown source
- Slide separators in Pandoc Markdown: `##` headings become frames

**Theming:**
- 30+ built-in themes (Warsaw, Madrid, Berlin, Metropolis, etc.)
- Themes set in preamble: `\usetheme{Metropolis}`
- Color themes applied separately: `\usecolortheme{seahorse}`
- Custom themes require LaTeX macro knowledge

**Export options:**
- PDF only (native); no HTML output
- High-quality, print-ready output with exact font control
- Pandoc can chain Markdown → Beamer PDF in one command

**Pros for AI-driven generation:**
- Pandoc Markdown → Beamer is a clean pipeline (LLM writes Markdown, Pandoc converts)
- Excellent math rendering; ideal for academic/scientific content
- Deterministic output; no browser rendering variance
- LaTeX preamble can be templated and swapped for theme switching

**Cons:**
- LaTeX compilation is slow and error-prone (dependency on a full TeX distribution)
- PDF-only: no interactive elements, no web embedding
- Debugging LaTeX errors is difficult, especially in generated output
- Theme switching requires editing LaTeX preamble, not a config flag
- Poor fit for design-forward, visually rich presentations

---

## 5. Quarto Presentations

**What it is:** Quarto is a next-generation scientific publishing system from Posit (formerly RStudio). It supports multiple output formats from a single `.qmd` (Quarto Markdown) source, including revealjs (HTML), Beamer (PDF), and PowerPoint.

**Markdown format:**
- Standard Markdown + YAML front matter
- Code chunks with executable output (R, Python, Julia, Observable)
- Slides delimited by `##` headings (or `---` in revealjs mode)
- Columns: `:::: {.columns}` / `::: {.column}` fenced divs
- Incremental lists: `:::{.incremental}` fenced div

**Theming (revealjs target):**
- Built-in themes inherited from reveal.js
- Custom theme: `theme: custom.scss` — a single Sass variable override file
- Brand YAML (`_brand.yml`) for organization-wide color/font/logo consistency

**Export options:**
- `quarto render deck.qmd --to revealjs` → HTML
- `quarto render deck.qmd --to beamer` → PDF
- `quarto render deck.qmd --to pptx` → PowerPoint
- Same source file, multiple output formats with one flag change

**Pros for AI-driven generation:**
- Multi-format output from one source is ideal for template switching
- Executable code chunks embed results directly in slides (reproducibility)
- YAML front matter makes configuration declarative and LLM-friendly
- Active development; strong data science community
- `_brand.yml` enables robust theme switching without touching slide content

**Cons:**
- Quarto must be installed (separate from R/Python); adds pipeline complexity
- Revealjs output is the most capable format; PowerPoint output is limited
- Code execution requires the relevant runtime to be installed
- Fenced div syntax (`::: {}`) is less intuitive for LLMs than simple Markdown

---

## 6. Obsidian Slides / HackMD

### Obsidian Slides (Built-in + Advanced Slides plugin)

**What it is:** Obsidian has a built-in Slides plugin that renders any note as a reveal.js presentation. The **Advanced Slides** plugin (now discontinued but still widely used; **Slides Extended** is the active fork) extends this with more features.

**Format:**
- Standard Obsidian Markdown with `---` slide separators
- `<!--slide bg="color"-->` comments for per-slide backgrounds
- Supports Obsidian wiki-links, embeds, and Dataview queries in slides
- Mermaid diagrams render natively

**Export:**
- PDF export via browser print
- HTML export via Advanced Slides plugin
- Limited compared to standalone tools

**Pros for AI-driven generation:**
- Works inside an existing Obsidian vault — slides are just notes
- Great for knowledge-base → presentation pipelines
- Local-first, no server dependency

**Cons:**
- Requires Obsidian to be running; no headless CLI mode
- Advanced Slides is discontinued; Slides Extended is the maintained fork
- Limited theming options compared to standalone tools

### HackMD

**What it is:** A web-based collaborative Markdown editor with built-in presentation mode (powered by reveal.js under the hood).

**Format:**
- GitHub Flavored Markdown with `---` slide separators
- Mermaid, Graphviz, and other diagram blocks render natively
- Math via MathJax/KaTeX

**Export:**
- PDF via browser
- Publish as a public URL
- Export as HTML

**Pros for AI-driven generation:**
- Zero setup; browser-based
- Good for collaborative review of AI-generated content
- Mermaid support is first-class

**Cons:**
- Not locally scriptable; web-only SaaS
- Limited theming
- Rate-limited API for programmatic use

---

## 7. Other Notable Tools

### Pandoc (Swiss-Army-Knife Converter)
- Not a presentation framework itself, but the most powerful conversion layer
- Can convert Markdown to revealjs, Beamer, PPTX, and HTML slides (DZSlides, Slidy, S5)
- `pandoc input.md -t revealjs -s -o output.html --slide-level=2`
- Essential in any LLM → slides pipeline that needs multi-format output
- Custom Pandoc templates (`--template`) enable full layout control

### MDX Deck
- React + MDX presentation framework (predecessor influence on Spectacle)
- Largely unmaintained since 2022; not recommended for new projects

### RISE (Jupyter)
- Converts Jupyter notebooks to Slideshow mode via reveal.js
- Ideal for data science presentations with live-running code
- `jupyter nbconvert --to slides notebook.ipynb --post serve`

### Deckset (macOS-only, commercial)
- Paid macOS app; renders Markdown to polished slides with no configuration
- Beautiful built-in themes; simple `# Title\n---\n` format
- Export to PDF and images
- No API or CLI; not scriptable

### Slidev (for reference context)
- Vue.js-based; `.md` files with frontmatter + `---` separators
- Strong LLM compatibility noted by developers in 2025–2026 (Claude Code integration praised)
- Themes via npm; `slidev export` to PDF/PNG/PPTX
- Active development; recommended for developer-audience presentations

---

## Comparison Matrix for AI-Driven Generation

| Tool | Source Format | LLM-Friendliness | Multi-Theme | CLI-able | Export Formats |
|---|---|---|---|---|---|
| reveal.js / reveal-md | Markdown | High | Yes (CSS) | Yes | HTML, PDF |
| Remark.js | Markdown | High | Manual CSS | No | HTML, PDF (browser) |
| Spectacle | JSX / MDX | Medium | Yes (JS objects) | Build step | HTML, PDF |
| Beamer | LaTeX / Markdown (Pandoc) | Medium | Yes (LaTeX themes) | Yes | PDF only |
| Quarto | Markdown + YAML | High | Yes (`_brand.yml`) | Yes | HTML, PDF, PPTX |
| Obsidian Slides | Markdown | High | Limited | No | HTML, PDF |
| HackMD | Markdown | High | Limited | No | HTML, PDF |
| Marp | Markdown | High | Yes (CSS) | Yes | HTML, PDF, PPTX |
| Slidev | Markdown + Vue | High | Yes (npm themes) | Yes | HTML, PDF, PPTX |
| Pandoc | Markdown | High | Via templates | Yes | Many |

---

## Recommendations for an AI Harness

**Best single-format target:** Marp or reveal-md — both accept pure Markdown, have robust CLIs, and produce reliable PDF/HTML output. An LLM can generate valid Marp/reveal-md Markdown with minimal prompt engineering.

**Best multi-format target:** Quarto — same `.qmd` source renders to revealjs, Beamer, and PPTX. The `_brand.yml` system enables theme switching without touching content.

**Best for data/code-heavy decks:** Quarto with revealjs target, or RISE for notebook-based workflows.

**Best for developer audiences:** Slidev (Vue components, code highlighting, live demos).

**Avoid for programmatic generation:** Spectacle (JSX too noisy), Deckset (no CLI), plain Remark.js (no CLI, maintenance mode).

---

## Sources

- [reveal.js official site](https://revealjs.com/)
- [reveal-md GitHub](https://github.com/webpro/reveal-md)
- [Quarto Presentations docs](https://quarto.org/docs/presentations/)
- [Quarto Beamer docs](https://quarto.org/docs/presentations/beamer.html)
- [Why I Switched from Beamer to Quarto – Vladislav Morozov](https://vladislav-morozov.github.io/blog/web/quarto/2025-06-03-why-quarto-revealjs-slides/)
- [Spectacle GitHub](https://github.com/FormidableLabs/spectacle)
- [Advanced Slides (Obsidian) GitHub](https://github.com/MSzturc/obsidian-advanced-slides)
- [Markdown-Based Presentation Tools: Marp, Slidev, reveal.js – dasroot.net (April 2026)](https://dasroot.net/posts/2026/04/markdown-presentation-tools-marp-slidev-reveal-js/)
- [HackMD & Obsidian workflow – HackMD Blog](https://hackmd.io/blog/2025/01/22/hackmd-obsidian-workflow)
- [10 Code-Based Presentation Tools for Developers – Medium](https://medium.com/demohub-tutorials/10-code-based-presentation-tools-for-developers-ranked-2025-fe764698f132)
- [Text to Diagram Tools Comparison 2025](https://text-to-diagram.com/?example=text)
- [Why xaringan / remark.js? – Yihui Xie](https://yihui.org/en/2017/08/why-xaringan-remark-js/)
