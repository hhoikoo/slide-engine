# Marp Theming Deep Dive

## How Themes Work — Architecture

Marp themes are CSS files consumed by the `ThemeSet` class (from Marpit). The flow:

1. Theme CSS is loaded into `marpit.themeSet.add(cssString)` or via `--theme` / `--theme-set` in the CLI.
2. The `theme` directive in frontmatter selects the active theme by name.
3. At render time, Marpit:
   - Parses the CSS through PostCSS
   - Scopes all CSS selectors inside the slide container selector (e.g., `.marpit > svg > foreignObject > section`, or just `section` depending on context)
   - Injects the scoped CSS into the output's `<style>` block
   - Merges any inline `<style>` and `<style scoped>` blocks from the Markdown

Themes are not compiled — they are processed at render time by Marpit's PostCSS pipeline. This means themes can use CSS nesting (flattened by Marpit for compatibility), and standard CSS features.

---

## The `@theme` Metadata Comment

Every theme CSS file **must** start with (or include) this metadata comment:

```css
/* @theme my-theme-name */
```

This is how Marpit identifies the theme and what name to use for the `theme` directive. Without it, the theme will not load.

Additional metadata can be declared in subsequent comments:

```css
/* @theme my-theme */
/* @auto-scaling true */
/* @size 16:9 1920px 1080px */
/* @size 4:3 960px 720px */
```

The `@auto-scaling` metadata tells Marp Core that this theme supports auto-scaling features (fitting headers with `<!-- fit -->`, shrinking code blocks/math to prevent overflow). Without it, auto-scaling is disabled for the theme.

The `@size` metadata defines dimension presets that users can select via the `size` global directive:

```markdown
---
theme: my-theme
size: 4:3
---
```

---

## CSS Structure of a Theme

### The `section` Selector (Slide Viewport)

Each slide maps to a `<section>` element. The `section` selector in theme CSS is the primary styling target:

```css
/* @theme my-theme */

section {
  /* Slide dimensions — must use absolute units */
  width: 1280px;
  height: 720px;

  /* Base typography */
  font-family: 'Inter', 'Noto Sans', sans-serif;
  font-size: 32px;
  line-height: 1.5;
  color: #333;
  background-color: #fff;

  /* Padding */
  padding: 60px;
  box-sizing: border-box;
}
```

**Critical rules about dimensions:**
- Use only absolute units (`px`, `cm`, `in`, `mm`, `pc`, `pt`, `Q`) — no `%`, `vw`, `vh`, `em`, `rem`.
- The width/height here defines the slide canvas size. In inline SVG mode, SVG `viewBox` is set from these values, enabling proportional scaling in the browser.
- Only one size per theme instance (unless multiple `@size` presets are declared).

### The `:root` Pseudo-Class

In Marpit, `:root` is reinterpreted to mean `section` (the slide element), NOT the HTML root. However, `:root` has higher CSS specificity:

```css
/* These are equivalent targets but different specificity */
section { color: black; }        /* 0-0-1 specificity */
:root { color: black; }          /* 0-1-0 specificity */
```

Using `:root` for CSS custom property declarations is a common pattern:

```css
:root {
  --color-primary: #2196f3;
  --color-background: #ffffff;
  --font-size-base: 32px;
}
```

Note: `rem` units in Marpit's context are relative to the `<section>` element's font-size, not the HTML root. This is intentional for slide scaling.

### Pagination — `section::after`

When `paginate: true` is set, Marpit renders the slide number via the `section::after` pseudo-element using the `data-marpit-pagination` attribute:

```css
section::after {
  /* Default: show current page */
  content: attr(data-marpit-pagination);

  /* Custom: show "Page N / Total" */
  content: attr(data-marpit-pagination) ' / ' attr(data-marpit-pagination-total);

  /* Position in bottom-right corner */
  position: absolute;
  bottom: 20px;
  right: 40px;
  font-size: 0.6em;
  color: rgba(0, 0, 0, 0.4);
}
```

Page counter attributes:
- `data-marpit-pagination` — current page number (1-indexed)
- `data-marpit-pagination-total` — total number of slides

### Header and Footer

When `header` or `footer` directives are set, Marpit renders `<header>` and `<footer>` elements inside `<section>`. Theme CSS must style them:

```css
section > header,
section > footer {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0 40px;
  font-size: 0.55em;
  color: rgba(0, 0, 0, 0.4);
}

section > header {
  top: 0;
  height: 60px;
  line-height: 60px;
}

section > footer {
  bottom: 0;
  height: 40px;
  line-height: 40px;
}
```

If a theme reserves space for header/footer, the `section` padding-top/bottom must match:

```css
section {
  padding-top: 80px;    /* header height + gap */
  padding-bottom: 60px; /* footer height + gap */
}
```

---

## Built-in Themes

### default

Based on GitHub's `github-markdown-css` styling, adapted for slides. Content centers vertically. Clean, minimal, professional.

**CSS variables (customize via `<style>` block):**
```css
/* Variables follow github-markdown-css naming + Marp extras */
:root {
  --color-prettylights-syntax-comment: #8b949e;
  /* ... full github-markdown-css variable set ... */
}
```

**Special classes:**
- `invert` — inverted color scheme (dark background, light text)

**Size presets:** `16:9` (1280×720, default), `4:3` (960×720)

### gaia

Inspired by the classic yhatt/marp and the azusa-colors Keynote template. More stylized, with warm accent colors.

**SCSS-based source** (compiled to CSS for distribution). Key color variables:

```css
:root {
  --color-background: #fff8e1;  /* warm cream */
  --color-foreground: #455a64;  /* slate */
  --color-highlight: #0288d1;   /* blue */
  --color-dimmed: #607d8b;      /* muted blue-grey */
  --color-background-stripe: rgba(0,0,0,.05);
}
```

**Special classes:**
- `lead` — centers content vertically and horizontally (title slides)
- `gaia` — applies blue primary scheme (dark blue background, light text)
- `invert` — inverted colors

**Features:**
- Heading sizes responsive to the `em` scale (h1: 1.8em down to h6: 0.9em)
- Lato font (400/900 weights) for body, Roboto Mono for code
- Syntax highlighting via highlight.js (sunburst style)
- Decorative blockquote styling with quotation marks
- Table striping with alternating rows
- `@auto-scaling` enabled — fitting headers, code block shrinking, math shrinking

**Customization:**
```markdown
<style>
:root {
  --color-background: #1a237e;
  --color-foreground: #e8eaf6;
  --color-highlight: #ffca28;
  --color-dimmed: #90caf9;
}
</style>
```

### uncover

Simple, minimal, modern. Inspired by reveal.js and other frameworks.

**CSS variables:**
```css
:root {
  --color-background: #fff;
  --color-background-code: #f0f0f0;
  --color-foreground: #333;
  --color-highlight: #f96;
}
```

**Special classes:**
- `invert` — reversed color scheme

---

## Creating a Custom Theme from Scratch

### Minimal Viable Theme

```css
/* @theme minimal */

section {
  width: 1280px;
  height: 720px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 30px;
  color: #222;
  background: #fafafa;
  padding: 60px 80px;
  box-sizing: border-box;
}

h1 { font-size: 1.8em; margin: 0 0 0.5em; }
h2 { font-size: 1.3em; margin: 0 0 0.4em; }

ul, ol { margin: 0; padding-left: 1.2em; }

code {
  background: #eee;
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-size: 0.85em;
}

pre code {
  background: none;
  padding: 0;
}

pre {
  background: #1a1a1a;
  color: #f8f8f8;
  padding: 1em;
  border-radius: 6px;
  overflow: hidden;
}

/* Pagination */
section::after {
  content: attr(data-marpit-pagination) ' / ' attr(data-marpit-pagination-total);
  position: absolute;
  bottom: 20px;
  right: 40px;
  font-size: 0.5em;
  color: rgba(0,0,0,0.35);
}
```

### Extending a Built-in Theme

The simplest approach — inherit from an existing theme using `@import`:

```css
/* @theme my-company */

@import 'default';

/* Override brand colors */
:root {
  --color-primary: #e91e63;
}

section {
  /* Keep default dimensions */
  font-family: 'Inter', sans-serif;
}

/* Brand header bar */
section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: #e91e63;
}

/* Title slide special treatment */
section.title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #ffffff;
  padding: 80px;
}

section.title h1 {
  font-size: 2.4em;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.3em;
  color: #ffffff;
}
```

In SCSS preprocessors, use `@import-theme 'default'` instead of `@import 'default'` to avoid conflicts with Sass's built-in `@import`.

### Theme with Auto-Scaling Support

To enable `<!-- fit -->` headers and code-block shrinking:

```css
/* @theme auto-scaling-theme */
/* @auto-scaling true */

section {
  width: 1280px;
  height: 720px;
  /* ... */
}

/* These are required for auto-scaling to work with marp-core */
/* marp-core wraps fitting elements in custom elements */
```

Or enable selectively:
```css
/* @auto-scaling fittingHeader */    /* only fitting headers */
/* @auto-scaling code */             /* only code shrinking */
/* @auto-scaling math */             /* only math shrinking */
```

---

## CSS Variables Pattern

CSS custom properties are the recommended way to make themes configurable from Markdown. Users override variables in a `<style>` block or `style:` directive:

**In theme CSS:**
```css
/* @theme configurable-theme */

:root {
  --color-bg: #ffffff;
  --color-fg: #333333;
  --color-accent: #2196f3;
  --font-size: 30px;
  --padding-x: 60px;
  --padding-y: 40px;
}

section {
  width: 1280px;
  height: 720px;
  background: var(--color-bg);
  color: var(--color-fg);
  font-size: var(--font-size);
  padding: var(--padding-y) var(--padding-x);
  box-sizing: border-box;
}

h2 { border-bottom: 3px solid var(--color-accent); }
a   { color: var(--color-accent); }
```

**User overrides in Markdown frontmatter:**
```markdown
---
theme: configurable-theme
style: |
  :root {
    --color-bg: #1a1a2e;
    --color-fg: #e8e8f0;
    --color-accent: #ff8001;
  }
---
```

Or per-slide:
```markdown
<!-- _class: dark-variant -->
<style scoped>
:root {
  --color-bg: #0d1117;
  --color-accent: #58a6ff;
}
</style>
```

---

## Scoped Styles (Per-Slide CSS)

`<style scoped>` applies CSS only to the current slide:

```markdown
## Regular Slide

Normal content.

---

<style scoped>
section {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}
h2 { color: rgba(255,255,255,0.9); }
</style>

## Special Gradient Slide

This slide has a unique background.
```

How it works: Marpit generates a unique `data-marpit-scope-XXXXXX` attribute on the `<section>` element and rewrites the scoped CSS to target only `section[data-marpit-scope-XXXXXX]`.

CSS nesting is supported within `<style scoped>` (Marpit flattens it for compatibility):

```css
<style scoped>
section {
  .decoration-box:nth-of-type(1) { --accent-color: #e67e22; }
  .decoration-box:nth-of-type(2) { --accent-color: #27ae60; }
}
</style>
```

---

## Layout Patterns in Theme CSS

### Multi-Column Layout

Since Marp renders to `<section>` HTML, multi-column layouts require explicit HTML `<div>` elements in the Markdown. The theme provides the CSS rules:

```css
/* In theme */
section.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 0 30px;
}

section.two-col > h2 {
  grid-column: 1 / -1;  /* heading spans full width */
}

section.two-col > div {
  /* Each div is a column */
}
```

```markdown
<!-- _class: two-col -->

## Two Column Slide

<div>

### Left Column
- Item A
- Item B

</div>
<div>

### Right Column
- Item C
- Item D

</div>
```

### Side-by-Side with Image

```css
section.side-by-side {
  display: grid;
  grid-template-columns: var(--cols, 1fr 1fr);
  grid-template-rows: auto 1fr;
  gap: 0 40px;
}

section.side-by-side > h2 {
  grid-column: 1 / -1;
}

section.side-by-side .image {
  display: flex;
  align-items: center;
  justify-content: center;
}

section.side-by-side .image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
```

Per-slide column ratio override:
```markdown
<style scoped>
section { --cols: 1.2fr 1fr; }
</style>
```

### Title Slide

```css
section.title {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 80px;
  background: #0d1b2a;
  color: white;
}

section.title h1 {
  font-size: 2.4em;
  font-weight: 800;
  line-height: 1.1;
  color: white;
  margin: 0;
}

section.title h2 {
  font-size: 1.2em;
  font-weight: 400;
  color: rgba(255,255,255,0.7);
  margin: 0.4em 0 0;
}

/* Decor element: use ::before for brand bar */
section.title::before {
  content: '';
  display: block;
  width: 80px;
  height: 6px;
  background: #ff8001;
  margin-bottom: 40px;
}
```

---

## Inline `<style>` vs `style:` Directive

Two ways to add document-level CSS tweaks:

**`style:` frontmatter directive** (global, clean):
```yaml
---
theme: default
style: |
  section {
    font-family: 'Source Sans Pro', sans-serif;
  }
  section.columns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
---
```

**`<style>` tag in Markdown body** (global, flexible placement):
```markdown
<style>
.highlight {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px 16px;
}
</style>
```

Both are parsed in the theme context and merged into the document's CSS output. The `style:` directive is preferred for template generation as it keeps the YAML block authoritative.

---

## Dark Mode / Invert Class

All built-in themes provide an `invert` class for dark variants:

```markdown
<!-- _class: invert -->

## This slide is dark
```

To implement `invert` in custom themes:

```css
section.invert {
  background: #1a1a2e;
  color: #e8e8e8;
}

section.invert h1, section.invert h2 {
  color: #ffffff;
}

section.invert code {
  background: #2d2d2d;
  color: #f8f8f2;
}
```

For system-preference-based dark mode in themes:

```css
@media (prefers-color-scheme: dark) {
  section {
    background: #1a1a2e;
    color: #e8e8e8;
  }
}
```

---

## Practical: Full Custom Theme Example

Below is a complete, production-ready minimal custom theme skeleton modeled on the patterns in the `bai-flat` theme in this repository:

```css
/* @theme company-theme */
/* @auto-scaling true */
/* @size 16:9 1280px 720px */
/* @size 4:3 960px 720px */

@import 'default';

/* ── CSS Variables ─────────────────────────────── */
:root {
  /* Brand palette */
  --color-brand: #0070f3;
  --color-brand-dark: #0052cc;
  --color-accent: #ff6b35;

  /* Semantic colors */
  --color-fg: #111111;
  --color-fg-muted: #666666;
  --color-bg: #ffffff;
  --color-bg-muted: #f5f7fa;
  --color-border: #e0e4ea;

  /* Layout tokens */
  --pad-x: 60px;
  --pad-top: 20px;
  --header-h: 64px;
  --progress-height: 4px;
  --progress-color: var(--color-brand);
}

/* ── Base Section ──────────────────────────────── */
section {
  width: 1280px;
  height: 720px;
  box-sizing: border-box;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 26px;
  line-height: 1.6;
  color: var(--color-fg);
  background: var(--color-bg);
  padding: calc(var(--header-h) + var(--pad-top)) var(--pad-x) 40px;
  overflow: hidden;
}

/* ── Heading Bar (h2 as section heading) ───────── */
section h2 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  margin: 0;
  padding: 0 var(--pad-x);
  background: var(--color-brand);
  color: white;
  font-size: 1em;
  font-weight: 700;
  line-height: var(--header-h);
  letter-spacing: 0.01em;
}

/* ── Typography ────────────────────────────────── */
section h1 { font-size: 2.2em; font-weight: 800; }
section h3 { font-size: 1.05em; font-weight: 700; color: var(--color-brand); margin: 1em 0 0.3em; }

/* ── Code ──────────────────────────────────────── */
section code {
  background: var(--color-bg-muted);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.82em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

section pre {
  background: #0d1117;
  color: #e6edf3;
  border-radius: 8px;
  padding: 1.2em 1.4em;
}

section pre code { background: none; color: inherit; padding: 0; }

/* ── Lists ─────────────────────────────────────── */
section ul, section ol {
  padding-left: 1.4em;
  margin: 0.3em 0;
}
section li { margin: 0.25em 0; }

/* ── Pagination ────────────────────────────────── */
section::after {
  content: attr(data-marpit-pagination) ' / ' attr(data-marpit-pagination-total);
  position: absolute;
  bottom: 18px;
  right: var(--pad-x);
  font-size: 0.5em;
  color: var(--color-fg-muted);
  font-variant-numeric: tabular-nums;
}

/* ── Header / Footer ───────────────────────────── */
section > header {
  position: absolute;
  top: var(--header-h);
  right: var(--pad-x);
  font-size: 0.5em;
  color: rgba(255,255,255,0.85);
  transform: translateY(calc(-1 * var(--header-h)));
  line-height: var(--header-h);
}

/* ── Special Layout Classes ────────────────────── */
section.title {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 80px var(--pad-x);
  background: linear-gradient(145deg, #001a3a 0%, #003170 100%);
  color: white;
}

section.title h1 { color: white; font-size: 2.4em; margin: 0; }
section.title h2 {
  position: static;
  background: none;
  color: rgba(255,255,255,0.7);
  font-size: 1em;
  font-weight: 400;
  height: auto;
  line-height: 1.4;
  margin: 0.4em 0 0;
  padding: 0;
}

section.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 0 30px;
}
section.two-col > h2 { grid-column: 1 / -1; }

section.invert {
  background: #0d1117;
  color: #e6edf3;
}
section.invert h3 { color: #58a6ff; }
```

---

## Responsive Design Within Slides

Slides have fixed dimensions (e.g., 1280×720px) — "responsive" means scaling to the browser window, not reflow. The inline SVG wrapper handles scaling:

```html
<svg viewBox="0 0 1280 720">
  <foreignObject width="1280" height="720">
    <section>...</section>
  </foreignObject>
</svg>
```

The SVG scales uniformly while preserving the 16:9 aspect ratio. All CSS `px` values inside the `<section>` remain fixed relative to the 1280×720 canvas. This is why themes use `px` not `vw`/`vh`.

For font scaling within a slide, use `em`/`rem` relative to the section's base font size. Setting `font-size: 30px` on `section` means `1em = 30px` throughout.

---

## Community Theme Resources

- [Marp Community Themes](https://rnd195.github.io/marp-community-themes/) — curated CSS themes with previews
- [MARP Template Library](https://yoanbernabeu.github.io/MARP-Template-Library/) — templates and starter themes
- Notable community themes: Beam (LaTeX Beamer-style), Dracula, Nord, Rosé Pine, Neobeam, Wave

---

## References

- [Marpit Theme CSS docs](https://github.com/marp-team/marpit/blob/main/docs/theme-css.md)
- [Marp Core themes README](https://github.com/marp-team/marp-core/blob/main/themes/README.md)
- [Gaia theme SCSS](https://github.com/marp-team/marp-core/blob/main/themes/gaia.scss)
- [DEV: Marp Presentation Customization](https://dev.to/chris_ayers/unleash-your-creativity-with-marp-presentation-customization-1cpn)
- [marpit-api.marp.app/themeset](https://marpit-api.marp.app/themeset)
