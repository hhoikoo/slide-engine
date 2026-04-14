# Slidev Overview

## What Is Slidev?

Slidev (slide + dev, pronounced /slaɪdɪv/) is an open-source, web-based presentation framework designed specifically for developers. Rather than a WYSIWYG editor, it lets you write slides in Markdown and augment them with Vue.js components, UnoCSS utility classes, and the full power of the web platform. It was created by Anthony Fu and launched in April 2021.

**Current state (April 2026):** v52.x, ~45,600 GitHub stars, 2k forks, used by 8,400+ projects, active Discord community.

---

## Architecture

Slidev is a Vite-powered application built on the Vue 3 ecosystem.

| Layer | Technology |
|---|---|
| Build tool | Vite (instant HMR, plugin API) |
| UI framework | Vue 3 + TypeScript |
| Styling | UnoCSS (atomic CSS, Tailwind-compatible) |
| Code highlighting | Shiki (accurate, multi-language) |
| Live code editor | Monaco Editor (VS Code engine) |
| Math rendering | KaTeX |
| Diagrams | Mermaid, PlantUML |
| Export rendering | Playwright / Chromium (headless) |
| Package manager | npm / pnpm (theme distribution) |

The development server runs at `localhost:3030`. Because slides are compiled as a SPA, you get true hot-reload as you type—slide content, styles, and even Vue components update instantly without a full refresh.

---

## How It Works

### Single-File Source

All slides live in a single `slides.md` file. The framework parses it, splitting content at `---` separators and building an in-memory slide tree.

### Slide Separators

```markdown
# First Slide

Content here

---

# Second Slide

More content
```

A separator can carry frontmatter to configure just that slide:

```markdown
---
layout: image-right
image: /bg.png
transition: fade
---

# Slide with image
```

### Headmatter (Global Config)

The very first frontmatter block configures the entire deck:

```yaml
---
theme: seriph
title: My Presentation
author: Jane Doe
highlighter: shiki
lineNumbers: true
drawings:
  persist: false
transition: slide-left
mdc: true
---
```

Key headmatter fields:

| Field | Purpose |
|---|---|
| `theme` | npm package name (e.g. `seriph`, `./`) |
| `addons` | extra addon packages |
| `title` / `author` | metadata |
| `transition` | default slide transition |
| `highlighter` | code highlighter (shiki default) |
| `lineNumbers` | show line numbers in code blocks |
| `drawings` | annotation/drawing settings |
| `mdc` | enable Markdown Components syntax |
| `aspectRatio` | slide ratio (default 16/9) |
| `canvasWidth` | base canvas width (default 980) |

### Per-Slide Frontmatter

Individual slides can override the global config:

```yaml
---
layout: two-cols
background: '#f0f0f0'
class: 'text-center'
clicks: 3
transition: zoom
disabled: false
hide: false
---
```

### Speaker Notes

HTML comments at the end of a slide become presenter notes:

```markdown
# My Slide

Content

<!-- 
Notes only visible in presenter mode.
Supports **markdown** and <b>HTML</b>.
-->
```

---

## Built-In Layouts

Slidev ships with a set of built-in layouts selectable via the `layout` frontmatter key:

| Layout | Description |
|---|---|
| `default` | Standard title + content |
| `cover` | Large title slide |
| `center` | Centered content |
| `intro` | Author/speaker introduction |
| `image-right` | Text on left, image on right |
| `image-left` | Image on left, text on right |
| `image` | Full background image |
| `two-cols` | Two equal columns |
| `two-cols-header` | Header + two columns |
| `iframe` | Embeds a URL in an iframe |
| `iframe-right` | iframe on right, content on left |
| `section` | Section divider / chapter heading |
| `quote` | Pull-quote layout |
| `statement` | Single large statement |
| `fact` | Metric + supporting text |
| `end` | Closing slide |
| `none` | No wrapper, raw HTML |

You can create custom layouts as Vue SFCs in the `layouts/` directory.

---

## Vue Components in Slides

You can drop any Vue component directly into Markdown:

```markdown
# Interactive Chart

<MyBarChart :data="[1, 4, 9, 16]" />
```

Place custom components in `components/` and they are auto-imported. You can also use third-party Vue libraries by importing them in setup files.

---

## Click Animations

Slidev has a built-in click-step system that does not require JavaScript:

```markdown
<v-click>This appears on first click</v-click>

<v-clicks>
- Item 1
- Item 2
- Item 3
</v-clicks>
```

The `v-click` directive is equivalent to the `[fragment]` concept in reveal.js but simpler to write.

---

## Code Highlighting

Slidev uses Shiki for accurate, language-aware syntax highlighting. Beyond basic fences, it supports:

- **Line highlighting:** ` ```ts {2,5-7} ` — highlights specific lines
- **Progressive line reveal:** ` ```ts {all|2|5-7|all} ` — steps through on each click
- **Monaco Editor:** ` ```ts {monaco} ` — makes code editable in the slide
- **Magic Move:** wraps multiple code blocks in ` ````md magic-move ` for smooth animated transitions between code states (powered by Shiki Magic Move)
- **TwoSlash:** inline TypeScript type tooltips

---

## Transitions & Animations

Slide-level transitions use CSS/JS animation presets:

```yaml
---
transition: slide-left
---
```

Available presets: `slide-left`, `slide-right`, `slide-up`, `slide-down`, `fade`, `zoom`, `none`. Custom transitions can be defined as Vue transition components.

---

## Presenter Mode

Navigate to `localhost:3030/presenter` to open the presenter view, which shows:
- Current slide (large)
- Next slide (preview)
- Speaker notes
- Timer
- Slide progress

A separate remote control URL can be shared so a second person can advance slides remotely.

---

## Export Options

Export is handled by Playwright/Chromium rendering the SPA and capturing pages.

| Format | Command | Notes |
|---|---|---|
| PDF | `slidev export` | Default; each slide = one page |
| PNG | `slidev export --format png` | One image per slide |
| PPTX | `slidev export --format pptx` | Slide images embedded in PowerPoint |
| SPA | `slidev build` | Static site deployable anywhere |
| Markdown | `slidev export --format md` | Slide content as md |

CLI export flags:
- `--with-clicks` — exports a page for every click step
- `--range 1,4-5,8` — export specific pages
- `--dark` — force dark mode
- `--timeout` — Playwright render timeout

The SPA output can be deployed to Vercel, Netlify, GitHub Pages, or any static host.

**Limitation:** PPTX export embeds slides as images, not editable PowerPoint shapes. Unlike Marp, you cannot get a truly editable PPTX.

---

## Theming System

Themes are npm packages installed once and applied with a single line in headmatter:

```yaml
---
theme: seriph
---
```

Slidev auto-installs the package on first run. Themes can define:
- Global CSS / CSS variables
- Custom layouts (overriding or extending built-ins)
- Custom Vue components
- Default deck configuration (`slidev.defaults` in package.json)
- UnoCSS / Shiki configuration overrides

**Official themes (5):** `default`, `seriph`, `shibainu`, `bricks`, `apple-basic`

**Community themes:** 50+ packages on npm tagged `slidev-theme`

---

## Strengths

1. **Full web-platform power** — embed iframes, WebGL, live API calls, real-time data in slides
2. **Exceptional code presentation** — Shiki highlighting, Magic Move, Monaco live editing, line-by-line reveals
3. **Vue component ecosystem** — any Vue 3 component works in slides
4. **Hot module replacement** — instant dev feedback
5. **Version-controllable** — plain text source works perfectly with Git
6. **Real-time collaboration** — shared presenter link
7. **Recording + camera** — built-in webcam overlay for conference talks
8. **Rich animation model** — v-click directives, CSS transitions, Magic Move
9. **45k+ GitHub stars, active community** — mature project with responsive maintainers
10. **Addons system** — modular extensions beyond themes (e.g., polling, drawing)

---

## Limitations vs Marp

| Dimension | Slidev | Marp |
|---|---|---|
| **Learning curve** | Steeper — requires Markdown + Vue + UnoCSS knowledge | Very flat — plain Markdown + CSS only |
| **Markdown purity** | Extended/hybrid — HTML/Vue frequently needed for layout | Pure CommonMark + minimal directives |
| **LLM generation quality** | AI models handle basic syntax but struggle with advanced Slidev directives; output files can be cluttered with HTML/Vue | Simpler syntax = more reliable AI output |
| **Build dependency footprint** | Large — Node.js ≥20.12, Playwright for export, 2400MB memory at scale | Small — single binary available |
| **PPTX output** | Images only (non-editable) | Editable PPTX via `--pptx-editable` flag |
| **Rendering speed** | ~8ms/slide (heavier Vite/Vue pipeline) | ~2.8ms/slide (lightweight) |
| **Memory usage** | ~2400MB | ~650MB |
| **Standalone binary** | No — requires Node.js environment | Yes — standalone executables exist |
| **Offline / CI export** | Requires Playwright/Chromium installation | Requires Chrome/Chromium, but simpler setup |
| **Static site output** | Yes (full SPA) | HTML only (no SPA routing) |
| **Interactivity** | Full — live Vue components, animations | None — static slides only |
| **Corporate brand themes** | npm-based, highly structured | CSS-file-based, simpler but less modular |
| **Community/ecosystem** | Larger (~45k stars, 50+ themes) | Smaller (~7k stars, fewer themes) |

---

## Summary

Slidev is the most powerful markdown-based presentation framework for developers who want full web-platform expressiveness: interactive demos, live code, rich animations, and reusable Vue components. It trades simplicity for capability. For a presentation generation harness that needs to produce static, PDF-friendly slides from AI-generated content, Slidev's complexity may add friction—but its theming system is far more structured and reusable than Marp's CSS approach, and it produces better-looking HTML/SPA output.

---

*Sources:*
- https://sli.dev/guide/why
- https://sli.dev/guide/
- https://sli.dev/guide/syntax
- https://sli.dev/guide/exporting.html
- https://sli.dev/custom/directory-structure
- https://github.com/slidevjs/slidev
- https://github.com/slidevjs/themes
- https://dasroot.net/posts/2026/04/markdown-presentation-tools-marp-slidev-reveal-js/
- https://www.pkgpulse.com/blog/slidev-vs-marp-vs-revealjs-code-first-presentations-2026
- https://snyk.io/blog/slidev-101-coding-presentations-with-markdown/
