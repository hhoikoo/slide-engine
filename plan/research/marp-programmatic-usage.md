# Marp Programmatic Usage

## Overview

Marp exposes two programmatic interfaces:

1. **marp-core / marpit as a library** — `import { Marp } from '@marp-team/marp-core'` — renders Markdown to HTML+CSS in-process, no subprocesses, no browser. This is the engine layer.
2. **marp-cli as a library** — `import { marpCli } from '@marp-team/marp-cli'` — full conversion pipeline including PDF/PPTX/image export, requires a browser for non-HTML outputs. This is the pipeline layer.

For AI/LLM-driven slide generation, the typical approach is:
- Use the **engine layer** (marp-core) for in-process HTML rendering and validation.
- Use the **CLI layer** for final PDF/PPTX export.

---

## 1. Marp Core as a Library

### Installation

```bash
npm install @marp-team/marp-core
# or for the barebones framework:
npm install @marp-team/marpit
```

### Basic Usage

```javascript
import { Marp } from '@marp-team/marp-core'

const marp = new Marp()

const markdown = `
---
theme: default
paginate: true
---

# Hello World

This is slide 1.

---

## Slide 2

- Item A
- Item B
`

const { html, css, comments } = marp.render(markdown)

// html — full HTML string (all slides as <section> elements)
// css  — scoped CSS string for the theme + inline styles
// comments — Array<string[]> — presenter notes per slide
```

### The `render()` Return Value

```typescript
interface RenderResult {
  html: string;        // rendered HTML (or string[] if htmlAsArray: true in env)
  css: string;         // complete CSS for the slide deck
  comments: string[][]; // presenter notes: outer array = slides, inner = per-slide notes
}
```

The `html` is NOT a complete HTML document — it is the `<section>` elements (one per slide), possibly wrapped in a container div. To get a complete HTML page, you use the CLI or assemble it yourself.

### Constructor Options

```javascript
const marp = new Marp({
  // HTML tag support
  // false (default) = deny all raw HTML
  // true = allow all HTML (risky)
  // object = allowlist: { 'div': ['class', 'style'], 'span': ['class'] }
  html: false,

  // Emoji support
  emoji: {
    shortcode: true,    // convert :smile: etc.
    unicode: false,     // convert unicode emoji to twemoji SVG
    twemoji: {
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
      ext: 'svg'        // 'svg' or 'png'
    }
  },

  // Math typesetting
  math: 'mathjax',    // 'mathjax' (default) | 'katex' | false
  // math: { lib: 'katex', katexOption: { ... }, katexFontPath: '/fonts/katex/' }

  // CSS minification (default: true)
  minifyCSS: true,

  // Helper script for auto-scaling and WebKit polyfill
  // The script is injected into rendered HTML
  script: {
    source: 'cdn',    // 'cdn' (default) | 'inline'
    nonce: 'abc123'   // optional CSP nonce
  },
  // script: false   — disable script injection entirely

  // Heading ID (slug) generation
  slug: true,   // true (default) | false | function | { slugifier, postSlugify }

  // Loose YAML parsing (default: false in Marpit, true in marp-core)
  looseYAML: true,

  // markdown-it configuration
  markdown: {
    breaks: true,   // convert newlines to <br> (default in marp-core)
    html: false,    // raw HTML in markdown (separate from marp html option)
  },

  // CSS container query support
  cssContainerQuery: false,  // or true, or container name(s)

  // CSS nesting support (default: true in marp-core)
  cssNesting: true,

  // Auto-divide slides at heading levels
  headingDivider: false, // false | number | number[]

  // Inline SVG wrapping (default: enabled in marp-core)
  inlineSVG: true,
})
```

### Marpit Constructor Options (base class)

Marpit has a smaller set of options (marp-core inherits and extends):

```javascript
import { Marpit } from '@marp-team/marpit'

const marpit = new Marpit({
  anchor: true,          // slide anchors (id attributes)
  container: marpitContainer, // wrapper element(s)
  cssContainerQuery: false,
  cssNesting: false,     // default false in bare Marpit
  headingDivider: false,
  lang: '',
  looseYAML: false,
  markdown: {},          // markdown-it options
  printable: true,       // add PDF-printable styles
  slideContainer: false,
  inlineSVG: false,      // disabled by default in bare Marpit
})
```

---

## 2. Theme Management

### Loading Themes

```javascript
import { Marp } from '@marp-team/marp-core'
import fs from 'fs'

const marp = new Marp()

// Add a theme from a CSS string
const themeCSS = fs.readFileSync('./my-theme.css', 'utf8')
const theme = marp.themeSet.add(themeCSS)
// theme.name === 'my-theme' (from /* @theme my-theme */ comment)

// Set as default (used when no theme directive is specified)
marp.themeSet.default = marp.themeSet.get('my-theme')

// Check if a theme exists
marp.themeSet.has('my-theme')  // true

// Iterate all loaded themes
for (const theme of marp.themeSet.themes()) {
  console.log(theme.name)
}

// Get theme metadata
const sizes = marp.themeSet.getThemeMeta(theme, 'size')
```

### ThemeSet API

```typescript
class ThemeSet {
  default: Theme | undefined       // fallback theme
  metaType: object                 // type config for custom metadata
  size: number                     // number of registered themes (readonly)
  cssNesting: boolean

  add(css: string): Theme          // parse and register theme CSS
  addTheme(theme: Theme): void     // register Theme instance directly
  get(name: string, fallback?: boolean): Theme | undefined
  getThemeMeta(theme: Theme|string, meta: string): string | string[] | undefined
  has(name: string): boolean
  delete(name: string): boolean
  clear(): void
  themes(): IterableIterator<Theme>
}
```

---

## 3. Plugin System

Marp (via Marpit) supports three kinds of plugins, all registered via the chainable `.use()` method:

```javascript
marp.use(plugin1).use(plugin2, option1, option2)
```

### markdown-it Plugins

Any markdown-it plugin can be used:

```javascript
import { Marp } from '@marp-team/marp-core'
import markdownItMark from 'markdown-it-mark'          // ==highlighted==
import markdownItContainer from 'markdown-it-container' // ::: custom blocks
import markdownItKatex from 'markdown-it-katex'        // LaTeX math

const marp = new Marp()
  .use(markdownItMark)
  .use(markdownItContainer, 'callout', {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) return '<div class="callout">'
      return '</div>'
    }
  })
```

### Marpit Plugins

A Marpit plugin is a function that receives a markdown-it instance augmented with a `.marpit` property pointing to the Marpit instance:

```javascript
import { marpitPlugin } from '@marp-team/marpit/plugin'

const myPlugin = marpitPlugin(({ marpit }) => {
  // Access the Marpit instance
  const { markdown, themeSet, customDirectives } = marpit

  // Add a custom global directive
  customDirectives.global.watermark = (value) => {
    // Return object to merge into slide metadata
    return { watermark: value }
  }

  // Add a custom local directive
  customDirectives.local.highlight = (value) => {
    return { highlight: String(value) }
  }

  // Add a theme
  themeSet.add(`/* @theme injected */ section { background: #f0f0f0; }`)

  // Manipulate the markdown-it token stream
  markdown.core.ruler.push('my-rule', (state) => {
    // state.tokens is the flat token array
    for (const token of state.tokens) {
      // transform tokens
    }
  })
})

const marp = new Marp().use(myPlugin)
```

### PostCSS Plugins

```javascript
import postcssCustomMedia from 'postcss-custom-media'

// PostCSS plugins are auto-detected by type
const marp = new Marp().use(postcssCustomMedia)
```

Marpit detects whether a plugin is a PostCSS plugin (by checking if it is a function that accepts `root, result`) and routes it accordingly.

---

## 4. Custom Directives

Custom directives extend Marp's frontmatter/HTML-comment directive system:

```javascript
const marp = new Marp()

// Global directive — applies to the whole deck, last value wins
marp.customDirectives.global.company = (value) => {
  // value is the raw YAML-parsed value
  // Return an object that gets merged into the document-level metadata
  return { company: String(value) }
}

// Local directive — applies to current slide and subsequent slides
marp.customDirectives.local.accent = (value) => {
  // Return object merged into slide-level metadata
  return { accent: String(value) }
}
```

Accessing directive values in a plugin:

```javascript
marpitPlugin(({ marpit }) => {
  marpit.customDirectives.local.accent = (value) => ({ accent: value })

  marpit.markdown.core.ruler.push('apply-accent', (state) => {
    for (const token of state.tokens) {
      if (token.type === 'marpit_slide_open') {
        const meta = token.meta || {}
        if (meta.marpitDirectives?.accent) {
          // meta.marpitDirectives contains resolved directive values for this slide
          token.attrSet('data-accent', meta.marpitDirectives.accent)
        }
      }
    }
  })
})
```

---

## 5. Patching the render() Method

A common pattern (used in the `bai-flat` template's `marp.config.js`) is to wrap `marp.render()` to post-process the HTML output:

```javascript
// marp.config.js
module.exports = {
  engine: ({ marp }) => {
    const origRender = marp.render.bind(marp)

    marp.render = (markdown, opts) => {
      const result = origRender(markdown, opts)

      // Post-process result.html
      result.html = injectProgressBars(result.html)
      result.html = resolveImagePaths(result.html, srcDir)
      result.html = inlineSvgImages(result.html)
      result.html = injectAutoScaleScript(result.html)

      return result
    }

    return marp
  }
}
```

This approach works because `marp.render()` returns a plain object — you can modify `html`, `css`, or `comments` before returning.

---

## 6. Marp CLI as a Library

### Installation

```bash
npm install @marp-team/marp-cli
```

### Basic API

```javascript
import { marpCli } from '@marp-team/marp-cli'

// Arguments are identical to CLI flags
const exitCode = await marpCli([
  'presentation.md',
  '--pdf',
  '--theme', './my-theme.css',
  '--output', './output/presentation.pdf'
])

if (exitCode > 0) {
  throw new Error(`marp-cli failed with exit code ${exitCode}`)
}
```

### Error Handling

```javascript
import { marpCli, CLIError } from '@marp-team/marp-cli'

try {
  await marpCli(['deck.md', '--pdf'])
} catch (err) {
  if (err instanceof CLIError) {
    console.error(`CLI error code ${err.errorCode}: ${err.message}`)
  } else {
    throw err  // unexpected error
  }
}
```

By default, `marpCli` has `throwErrorAlways: true` in library context — it throws instead of calling `process.exit()`.

### Configuration Object

You can pass a config object as the second argument to programmatically override settings:

```javascript
import { marpCli } from '@marp-team/marp-cli'

await marpCli(['deck.md'], {
  // These options are merged with (and override) marp.config.js
  pdf: true,
  theme: './custom-theme.css',
  allowLocalFiles: true,
  engine: ({ marp }) => marp.use(myPlugin),
  options: {
    html: true,
    math: 'katex',
  }
})
```

### Watch/Server Mode with programmatic stop

```javascript
import { marpCli, waitForObservation } from '@marp-team/marp-cli'

// Start server in background (marpCli promise does NOT resolve until stopped)
const cliPromise = marpCli(['--server', './slides/'])
  .catch(console.error)

// Wait until the server is ready
const { stop } = await waitForObservation()
console.log('Marp server is ready at http://localhost:8080')

// ... do work, call API, run tests ...

stop()  // stop the server → marpCli promise resolves
await cliPromise
```

### TypeScript Config Helper

```typescript
import { defineConfig } from '@marp-team/marp-cli'

export default defineConfig({
  inputDir: './slides',
  output: './dist',
  theme: 'gaia',
  themeSet: './themes',
  pdf: false,
  options: {
    html: true,
  }
})
```

---

## 7. The Engine Function Pattern

The `engine` option in `marp.config.js` is the primary extension point for custom processing:

```javascript
// marp.config.js (CommonJS)
module.exports = {
  engine: ({ marp }) => {
    // marp is already a Marp Core instance with all built-in features

    // 1. Use markdown-it plugins
    marp.markdown.disable(['marpit_fragment']) // disable built-in rules
    marp.use(markdownItMark)

    // 2. Add themes
    const customThemeCSS = require('fs').readFileSync('./themes/corporate.css', 'utf8')
    marp.themeSet.add(customThemeCSS)
    marp.themeSet.default = marp.themeSet.get('corporate')

    // 3. Wrap render for HTML post-processing
    const orig = marp.render.bind(marp)
    marp.render = (md, opts) => {
      const result = orig(md, opts)
      result.html = myPostProcess(result.html)
      return result
    }

    // 4. Return the modified instance
    return marp
  },

  // Other config options
  themeSet: './themes',
  output: './dist',
  allowLocalFiles: true,
}
```

**ESM version:**
```javascript
// marp.config.mjs
import markdownItContainer from 'markdown-it-container'
import { readFileSync } from 'fs'

export default {
  engine: ({ marp }) => {
    return marp.use(markdownItContainer, 'callout')
  },
  theme: 'gaia',
  pdf: true,
}
```

**Async engine (for loading remote assets):**
```javascript
export default {
  engine: async ({ marp }) => {
    const themeCSS = await fetch('https://example.com/theme.css').then(r => r.text())
    marp.themeSet.add(themeCSS)
    return marp
  }
}
```

---

## 8. Rendered HTML Structure

Understanding the HTML output is essential for post-processing:

### Default Output (marp-core, inline SVG enabled)

```html
<!-- Outer container -->
<div class="marpit">

  <!-- Slide 1 -->
  <svg viewBox="0 0 1280 720" data-marpit-svg="">
    <foreignObject width="1280" height="720">
      <section id="1" data-marpit-pagination="1" data-marpit-pagination-total="3">
        <!-- slide content -->
        <h1>Slide Title</h1>
        <ul>
          <li>Item A</li>
        </ul>
        <!-- paginate element -->
      </section>
    </foreignObject>
  </svg>

  <!-- Slide 2 (with scoped style) -->
  <svg viewBox="0 0 1280 720" data-marpit-svg="">
    <foreignObject width="1280" height="720">
      <section id="2" data-marpit-scope-abc123="" data-marpit-pagination="2" data-marpit-pagination-total="3" class="lead">
        <h2>Special Slide</h2>
      </section>
    </foreignObject>
  </svg>

</div>
```

Key attributes:
- `data-marpit-pagination` — current slide number
- `data-marpit-pagination-total` — total slides
- `data-marpit-scope-XXXXXX` — added when `<style scoped>` is used; used by CSS scoping
- `class` on `<section>` — from `class` or `_class` directives

### Presenter Notes

The `comments` return value from `render()` is parallel to slides:

```javascript
const { html, css, comments } = marp.render(markdown)
// comments[0] = ['Note for slide 1', 'Second note for slide 1']
// comments[1] = []         // slide 2 has no notes
// comments[2] = ['Note for slide 3']
```

---

## 9. Building a Slide Generation Pipeline for LLMs

### Pattern: LLM → Markdown → Marp → HTML/PDF

```javascript
import { Marp } from '@marp-team/marp-core'
import { marpCli } from '@marp-team/marp-cli'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs/promises'
import path from 'path'

const client = new Anthropic()

// 1. LLM generates Marp Markdown
async function generateSlideMarkdown(topic, slideCount = 10) {
  const systemPrompt = `You are a presentation expert. Generate Marp-compatible Markdown presentations.

Rules:
- Use YAML frontmatter with marp: true, theme, paginate: true
- Separate slides with ---
- Use HTML comments <!-- _class: ... --> for slide-specific classes
- Use <!-- presenter note text --> for presenter notes
- Available slide classes: title, two-col, side-by-side, focus, divider
- Keep content concise: 4-6 bullet points per slide max
- Use ## for slide headings (auto-converted to header bar by the theme)
`

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Create a ${slideCount}-slide presentation about: ${topic}

Output only the Marp Markdown, no explanation.`
    }]
  })

  return message.content[0].text
}

// 2. Validate and preview with marp-core (no browser needed)
function validateAndPreview(markdown) {
  const marp = new Marp({
    html: true,
    math: 'mathjax',
  })

  // Load custom theme
  const themeCSS = fs.readFileSync('./themes/corporate.css', 'utf-8')
  marp.themeSet.add(themeCSS)

  try {
    const { html, css, comments } = marp.render(markdown)

    // Count slides
    const slideCount = (html.match(/<section/g) || []).length

    return {
      valid: true,
      slideCount,
      html,
      css,
      comments,
    }
  } catch (err) {
    return { valid: false, error: err.message }
  }
}

// 3. Export to PDF via CLI
async function exportToPDF(markdownPath, outputPath) {
  await marpCli([
    markdownPath,
    '--pdf',
    '--theme', './themes/corporate.css',
    '--allow-local-files',
    '--output', outputPath,
  ])
}

// Full pipeline
async function generatePresentation(topic) {
  // Step 1: Generate
  console.log('Generating slides...')
  const markdown = await generateSlideMarkdown(topic, 12)

  // Step 2: Validate
  const preview = validateAndPreview(markdown)
  if (!preview.valid) {
    throw new Error(`Invalid Marp markdown: ${preview.error}`)
  }
  console.log(`Generated ${preview.slideCount} slides`)

  // Step 3: Save markdown
  const mdPath = `./output/${Date.now()}.md`
  await fs.writeFile(mdPath, markdown, 'utf-8')

  // Step 4: Export
  const pdfPath = mdPath.replace('.md', '.pdf')
  await exportToPDF(mdPath, pdfPath)
  console.log(`PDF saved to ${pdfPath}`)

  return { mdPath, pdfPath, slideCount: preview.slideCount }
}
```

### Pattern: Structured JSON → Markdown Assembler

Rather than asking an LLM to produce Markdown directly, use structured output and assemble Markdown programmatically:

```javascript
// Slide schema for LLM structured output
const slideSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },          // deck title
    theme: { type: 'string', enum: ['default', 'gaia', 'corporate'] },
    slides: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['title', 'content', 'two-col', 'focus', 'divider'] },
          heading: { type: 'string' },
          subheading: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
          left_column: { type: 'array', items: { type: 'string' } },
          right_column: { type: 'array', items: { type: 'string' } },
          quote: { type: 'string' },
          notes: { type: 'string' },
          image: { type: 'string' },
        }
      }
    }
  }
}

// Assembler: structured data → Marp Markdown
function assembleMarp(deck) {
  const lines = []

  // Frontmatter
  lines.push('---')
  lines.push('marp: true')
  lines.push(`theme: ${deck.theme || 'default'}`)
  lines.push('paginate: true')
  lines.push('html: true')
  if (deck.header) lines.push(`header: "${deck.header}"`)
  lines.push('---')
  lines.push('')

  for (const slide of deck.slides) {
    // Slide-specific directives
    if (slide.type !== 'content') {
      lines.push(`<!-- _class: ${slide.type} -->`)
    }
    if (!slide.paginate) {
      lines.push('<!-- _paginate: false -->')
    }

    // Content
    if (slide.heading) {
      const level = slide.type === 'title' ? '#' : '##'
      lines.push(`${level} ${slide.heading}`)
      lines.push('')
    }

    if (slide.subheading) {
      lines.push(`### ${slide.subheading}`)
      lines.push('')
    }

    if (slide.bullets?.length) {
      for (const b of slide.bullets) {
        lines.push(`- ${b}`)
      }
      lines.push('')
    }

    if (slide.type === 'two-col' && slide.left_column && slide.right_column) {
      lines.push('<div>')
      lines.push('')
      for (const b of slide.left_column) lines.push(`- ${b}`)
      lines.push('')
      lines.push('</div>')
      lines.push('<div>')
      lines.push('')
      for (const b of slide.right_column) lines.push(`- ${b}`)
      lines.push('')
      lines.push('</div>')
      lines.push('')
    }

    if (slide.quote) {
      lines.push(`> ${slide.quote}`)
      lines.push('')
    }

    if (slide.image) {
      lines.push(`![bg right:40%](${slide.image})`)
      lines.push('')
    }

    // Presenter notes
    if (slide.notes) {
      lines.push(`<!-- ${slide.notes} -->`)
      lines.push('')
    }

    // Slide separator
    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}
```

### Pattern: Post-Processing Rendered HTML

For advanced control (inject analytics, custom scripts, modify DOM):

```javascript
import { Marp } from '@marp-team/marp-core'
import { JSDOM } from 'jsdom'

function postProcessSlides(html, css) {
  const dom = new JSDOM(`<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`)
  const { document } = dom.window

  // Count slides
  const sections = document.querySelectorAll('section')

  sections.forEach((section, i) => {
    // Add slide number as data attribute
    section.setAttribute('data-slide-index', i)

    // Add custom progress bar
    const bar = document.createElement('div')
    bar.className = 'progress-track'
    bar.innerHTML = `<div class="progress-bar" style="width:${((i+1)/sections.length*100).toFixed(1)}%"></div>`
    section.appendChild(bar)
  })

  return dom.serialize()
}
```

---

## 10. Configuration File Reference (`marp.config.js`)

Full configuration options with types:

```javascript
// marp.config.js
const { readFileSync } = require('fs')

module.exports = {
  // Input
  inputDir: './slides',          // directory of .md files

  // Output
  output: './dist',              // output directory or file

  // Format flags (mutually exclusive or combined in programmatic use)
  pdf: false,
  pptx: false,
  notes: false,                  // export presenter notes as .txt

  // HTML template
  template: 'bespoke',           // 'bespoke' | 'bare'
  bespoke: {
    osc: true,                   // on-screen controller
    progress: true,              // progress bar
    transition: false,           // slide transitions (View Transition API)
  },

  // Theming
  theme: 'default',              // theme name or CSS file path
  themeSet: ['./themes'],        // array of CSS files or directories

  // Engine customization
  engine: ({ marp }) => {
    // marp = Marp instance, return modified instance
    return marp.use(require('./my-plugin'))
  },

  // Engine constructor options (passed to new Marp(options))
  options: {
    html: true,
    math: 'mathjax',
    minifyCSS: true,
  },

  // Metadata
  title: undefined,              // override slide title
  description: undefined,
  author: undefined,
  keywords: [],
  url: undefined,
  ogImage: undefined,
  lang: 'en',

  // Security
  allowLocalFiles: false,        // allow local file access in browser-based exports

  // Browser (for PDF/PPTX/image)
  browser: 'auto',               // 'chrome' | 'edge' | 'firefox' | 'auto' | ['chrome','firefox']
  browserPath: undefined,        // explicit browser executable
  browserProtocol: 'cdp',        // 'cdp' | 'webdriver-bidi'
  browserTimeout: 30,            // seconds

  // Performance
  parallel: 5,                   // concurrency for batch conversion (false to disable)

  // Watch / server
  watch: false,
  server: false,
  preview: false,
}
```

---

## 11. Integration Patterns for Build Systems

### Makefile Integration

```makefile
THEME := bai-flat/theme.css
SLIDES_DIR := slides
DIST_DIR := dist

slides-pdf:
	npx marp --config marp.config.js \
	  --input-dir $(SLIDES_DIR) \
	  --output $(DIST_DIR) \
	  --pdf --allow-local-files

slides-html:
	npx marp --config marp.config.js \
	  --input-dir $(SLIDES_DIR) \
	  --output $(DIST_DIR)
	node scripts/marp-postprocess.js
```

### GitHub Actions

```yaml
name: Build Slides
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Install Chromium
        run: npx puppeteer browsers install chrome
      - name: Build slides
        run: npx marp --config marp.config.js --input-dir slides --output dist --pdf
      - uses: actions/upload-artifact@v4
        with:
          name: slides
          path: dist/
```

### Node.js Script for Batch Generation

```javascript
import { marpCli } from '@marp-team/marp-cli'
import { glob } from 'glob'
import path from 'path'

async function buildAll() {
  const files = await glob('./slides/**/*.md')

  // Build all in parallel (marp-cli handles concurrency internally)
  await marpCli([
    ...files,
    '--config', './marp.config.js',
    '--pdf',
    '--output', './dist',
    '--allow-local-files',
    '--parallel', '8',
  ])

  console.log(`Built ${files.length} presentations`)
}

buildAll().catch(console.error)
```

---

## 12. Disabling Built-in Rules

marp-core includes a `marpit_fragment` rule that makes list items appear sequentially (animated fragments) in the Bespoke template. To disable it for static PDF output:

```javascript
engine: ({ marp }) => {
  marp.markdown.core.ruler.disable('marpit_fragment')
  return marp
}
```

Other markdown-it rules that can be disabled:
- `marpit_heading_divider` — automatic slide splitting at headings
- `marpit_sweep` — slide boundary detection
- `marpit_inline_svg` — inline SVG wrapping

---

## 13. Getting Slide Count and Structure Without Rendering to File

```javascript
import { Marp } from '@marp-team/marp-core'

function analyzeDeck(markdownString) {
  const marp = new Marp({ script: false, minifyCSS: false })
  const { html, css, comments } = marp.render(markdownString)

  // Count slides
  const slideCount = (html.match(/<section\b/g) || []).length

  // Extract slide classes (to understand layout types used)
  const classMatches = [...html.matchAll(/<section\b[^>]*\bclass="([^"]*)"/g)]
  const slideclasses = classMatches.map(m => m[1].split(' '))

  // Extract notes per slide
  const slidesWithNotes = comments.filter(n => n.length > 0).length

  return {
    slideCount,
    slideclasses,
    notesCount: slidesWithNotes,
    hasPagination: html.includes('data-marpit-pagination'),
  }
}
```

---

## References

- [marp-core README](https://github.com/marp-team/marp-core)
- [marp-cli README](https://github.com/marp-team/marp-cli) — includes API section
- [Marpit API docs](https://marpit-api.marp.app/)
- [Marpit Class reference](https://marpit-api.marp.app/marpit)
- [ThemeSet API](https://marpit-api.marp.app/themeset)
- [deepwiki: marp-cli API usage](https://deepwiki.com/marp-team/marp-cli/8.2-api-usage)
- [deepwiki: marp-cli advanced usage](https://deepwiki.com/marp-team/marp-cli/8-advanced-usage)
- [Medium: Writing Marpit plugins with markdown-it](https://medium.com/@helmuth.lammer/how-to-write-a-plugin-for-marpit-with-markdown-it-a-step-by-step-guide-a58c416a3ffd)
- [marp-team/awesome-marp](https://github.com/marp-team/awesome-marp)
- Local reference: `samples/marp-template/marp.config.js` — production example of engine wrapping, render patching, plugin disabling, and HTML post-processing
