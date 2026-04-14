# Slidev Theming Deep Dive

## How Themes Work

Slidev themes are standard npm packages. They are applied with a single line in the presentation's headmatter:

```yaml
---
theme: seriph
---
```

If the package is not installed, Slidev will prompt to auto-install it on the first `slidev` command. You can also reference a local theme during development:

```yaml
---
theme: ./   # current directory is the theme
---
```

Themes are not "ejected" — the package files live in `node_modules` and are composed on top of the user's slides. This means updating a theme across all presentations is as simple as bumping the npm version.

---

## Theme Package Conventions

### Package Naming

```
slidev-theme-{name}         # public, e.g. slidev-theme-seriph
@scope/slidev-theme-{name}  # scoped, e.g. @lablup/slidev-theme-corporate
```

### Required `package.json` Fields

```json
{
  "name": "slidev-theme-corporate",
  "version": "1.0.0",
  "keywords": ["slidev-theme", "slidev"],
  "main": "./layouts/default.vue",
  "slidev": {
    "defaults": {
      "aspectRatio": "16/9",
      "canvasWidth": 980,
      "transition": "slide-left",
      "highlighter": "shiki"
    }
  },
  "engines": {
    "slidev": ">=0.48.0"
  }
}
```

The `slidev.defaults` block is deep-merged with the user's frontmatter — users can still override any value. This is how themes set sensible defaults without locking users in.

### Color Schema Declaration

```json
{
  "slidev": {
    "colorSchema": "light"
  }
}
```

Options: `"light"`, `"dark"`, `"both"` (default). If `"both"`, the theme must handle both `html.dark` and `html.light` selectors in CSS.

---

## Theme File Structure

A well-structured theme package looks like:

```
slidev-theme-corporate/
├── layouts/
│   ├── default.vue       # Required: base layout
│   ├── cover.vue         # Override built-in cover
│   ├── section.vue       # Chapter divider
│   ├── two-cols.vue      # Override two-column
│   └── intro.vue         # Speaker intro slide
├── components/
│   ├── Footer.vue        # Reusable footer component
│   ├── Logo.vue          # Brand logo
│   └── ProgressBar.vue   # Slide progress
├── styles/
│   └── index.css         # Global CSS and CSS variables
├── setup/
│   └── unocss.ts         # UnoCSS preset configuration
├── public/
│   ├── logo.svg          # Brand assets
│   └── fonts/            # Custom webfonts
├── slides.md             # Example/preview presentation
└── package.json
```

**Key rule:** Non-JS files (`.vue`, `.ts`, `.css`) are published and used directly without pre-compilation. Slidev compiles them at build time. This means themes can be published as-is from source.

---

## Layouts System

### How Layouts Work

Layouts are Vue Single File Components (SFCs) that wrap slide content. Every slide rendered by Slidev uses the `<slot />` pattern:

```vue
<!-- layouts/default.vue -->
<template>
  <div class="slidev-layout default">
    <div class="content">
      <slot />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Footer from '../components/Footer.vue'
</script>

<style>
.slidev-layout.default {
  /* layout-specific styles */
}
</style>
```

### Named Slots

Complex layouts use named slots for multiple content regions:

```vue
<!-- layouts/two-cols.vue -->
<template>
  <div class="slidev-layout two-cols">
    <div class="col-left">
      <slot name="default" />
    </div>
    <div class="col-right">
      <slot name="right" />
    </div>
  </div>
</template>
```

In slides.md:

```markdown
---
layout: two-cols
---

# Left column content

::right::

# Right column content
```

### Available Layout Props

Layouts receive frontmatter values as props:

```vue
<script setup>
const props = defineProps({
  background: String,
  class: String,
})
</script>
```

### Priority Order

When the same layout name appears in multiple places, Slidev resolves it in this order:
1. `layouts/` in the user's presentation project (highest priority)
2. Theme layouts
3. Slidev built-in layouts (fallback)

This means you can override a theme layout locally without forking the theme.

---

## UnoCSS Integration

UnoCSS is the default styling engine since Slidev v0.42.0. It is a fast, atomic CSS engine compatible with Tailwind CSS utilities.

### Why UnoCSS Over Tailwind

- Faster — on-demand generation with no purging step
- More extensible — create custom presets, shortcuts, and rules
- Tree-shaken automatically — only emits used classes
- Works seamlessly with Vite/Vue

### Configuring UnoCSS in a Theme

Create `setup/unocss.ts`:

```typescript
import { defineUnoSetup } from '@slidev/types'
import transformerDirectives from '@unocss/transformer-directives'

export default defineUnoSetup(() => ({
  shortcuts: {
    'brand-text': 'text-[#FF6B35] font-bold',
    'brand-bg': 'bg-[#1A1A2E]',
    'slide-title': 'text-4xl font-black leading-tight tracking-tight',
  },
  theme: {
    colors: {
      brand: {
        primary: '#FF6B35',
        secondary: '#1A1A2E',
        accent: '#4ECDC4',
      },
    },
    fontFamily: {
      sans: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
  },
  transformers: [transformerDirectives()],
}))
```

### CSS Variables for Theming

The recommended pattern is to define CSS variables at the root and reference them throughout:

```css
/* styles/index.css */
:root {
  --brand-primary: #FF6B35;
  --brand-secondary: #1A1A2E;
  --brand-accent: #4ECDC4;
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

.slidev-layout {
  font-family: var(--font-body);
  color: var(--brand-secondary);
}

.slidev-layout h1 {
  font-family: var(--font-heading);
  color: var(--brand-primary);
}
```

Users can then override individual variables in their own `styles/index.css` without touching the theme.

### Scoping Styles

Global CSS from the theme applies to every slide, including the presenter UI. To prevent style bleed, scope styles to `.slidev-layout`:

```css
/* Good — scoped */
.slidev-layout.cover h1 {
  font-size: 3.5rem;
}

/* Risky — global */
h1 {
  font-size: 3.5rem;
}
```

---

## Custom Components in Themes

Components placed in `components/` are auto-imported globally in the theme consumer's slides. No import statement needed:

```markdown
# My Slide

<BrandLogo class="absolute top-4 right-4" />

Content here.
```

### Useful Component Patterns

**Persistent footer across all slides:**

Use `global-bottom.vue` in the theme (not a component, a special file):

```vue
<!-- global-bottom.vue -->
<template>
  <footer class="absolute bottom-4 left-0 right-0 flex justify-between px-8 text-sm opacity-60">
    <span>{{ $slidev.configs.title }}</span>
    <span>{{ $page }} / {{ $nav.total }}</span>
  </footer>
</template>
```

**Slide-specific overlays:** Use `slide-top.vue` or `slide-bottom.vue` for per-slide injections.

**Available global injections:**
- `$slidev.configs` — deck configuration
- `$nav` — navigation state (`currentPage`, `total`, `hasNext`, `hasPrev`)
- `$page` — current page number
- `$clicks` — current click state

---

## themeConfig for User-Facing Customization

Themes can expose a `themeConfig` API so users can configure the theme without editing theme source:

In `slides.md` headmatter:
```yaml
---
theme: corporate
themeConfig:
  logoUrl: /company-logo.svg
  primaryColor: '#0055AA'
  showFooter: true
  footerText: 'Confidential — Lablup Inc.'
---
```

In a layout:
```vue
<script setup>
const { themeConfig } = useSlideContext()
const logo = themeConfig.logoUrl ?? '/default-logo.svg'
const showFooter = themeConfig.showFooter ?? true
</script>
```

This is the preferred way to make themes configurable without requiring users to fork or eject.

---

## Creating a "Lablup Corporate" Theme Equivalent

### Feasibility Assessment

Creating a branded corporate Slidev theme is **entirely practical** and well-supported. The iO Digital corporate theme (`slidev-theme-iodigital`) is a real-world example with 13+ layouts, custom components, and brand assets — all in a publishable npm package.

### Required Effort

| Task | Estimated Effort |
|---|---|
| Package scaffold + package.json | 30 min |
| CSS variables + brand colors/fonts | 2–4 hrs |
| Cover, default, section layouts | 4–8 hrs |
| Two-cols, image-right, intro layouts | 4–6 hrs |
| Logo/footer components | 2–3 hrs |
| UnoCSS shortcuts for brand classes | 1–2 hrs |
| themeConfig wiring | 1–2 hrs |
| Test presentation + polish | 4–8 hrs |
| **Total** | **~18–33 hrs** |

### Key Design Decisions

1. **CSS variables vs hardcoded values** — always prefer CSS variables for colors, so users can override per-deck
2. **One npm package vs local theme** — start local (`theme: ./`), publish to private npm registry once stable
3. **Layout coverage** — at minimum implement: `cover`, `default`, `section`, `two-cols`, `image-right`, `intro`, `end`
4. **Font loading** — embed webfonts in `public/fonts/` and declare in CSS for offline/CI reliability
5. **themeConfig** — expose `logoUrl`, `primaryColor`, `showFooter`, `footerText` at minimum

### Comparison to Marp Corporate Theme

| Dimension | Slidev Corporate Theme | Marp Corporate Theme |
|---|---|---|
| Implementation | Vue SFCs + CSS | Pure CSS file |
| Distribution | npm package | CSS file import |
| Layout system | Structured Vue slots | CSS classes + directives |
| Component reuse | Full Vue components | Limited |
| Versioning | npm semver | Manual |
| Interactivity | Full | None |
| Complexity | Moderate-high | Low |
| Maintainability | Better (structured) | Simpler but less scalable |

A Slidev corporate theme is significantly more capable but requires more initial investment. Once built, it's more maintainable and consistent across presentations than a Marp CSS theme.

---

## Publishing a Private Theme

For an organization like Lablup, the recommended approach:

1. Develop locally with `theme: ./`
2. Use a private npm registry (GitHub Packages, Verdaccio, or npmjs private)
3. Publish as `@lablup/slidev-theme-corporate`
4. Consume in any presentation with:

```yaml
---
theme: '@lablup/slidev-theme-corporate'
---
```

No additional setup required — Slidev handles installation.

---

## Summary

Slidev's theming system is the most structured of any markdown presentation framework. Vue SFCs for layouts give you full template expressiveness. UnoCSS integration means brand utilities are a shortcut definition away. The themeConfig API provides clean user-facing configuration without theme forking. Creating a Lablup corporate theme is practical, estimated at 20–35 hours for a complete implementation covering major layout types.

---

*Sources:*
- https://sli.dev/guide/write-theme
- https://sli.dev/custom/
- https://sli.dev/custom/directory-structure
- https://sli.dev/custom/config-unocss
- https://sli.dev/resources/theme-gallery
- https://github.com/iodigital-com/slidev-theme-iodigital
- https://github.com/slidevjs/themes
- https://www.wimdeblauwe.com/blog/2024/11/05/technical-presentations-with-slidev/
