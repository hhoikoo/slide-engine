# Slidev Integration

> Status: Deferred
> Priority: Low (only if needed)
> Depends on: MVP

## Context

Slidev is stronger than Marp for:
- Live code demos with step-through animations
- Click animations (v-click)
- Vue components embedded in slides
- Hot-reload dev server

But for AI-generated corporate/personal decks, Marp wins on simplicity and LLM output reliability.

## If/when needed

### Approach: Marp-first with one-way converter

Write slides in Marp markdown (simpler, LLM-reliable), then convert to Slidev when interactive features are needed.

### Converter: `engine/scripts/marp-to-slidev.js`

| Marp | Slidev |
|------|--------|
| `<!-- _class: title -->` | `layout: cover` |
| `<!-- _class: two-col -->` + `<div>` | `layout: two-cols` + `::left::` / `::right::` |
| `<!-- _class: divider -->` | `layout: section` |
| `![bg right:40%](img)` | Image with sizing class |

Unsupported layouts get a TODO comment. The converter produces a starting point for manual refinement.

### Theme parity

A Slidev theme (`@lablup/slidev-theme-bai-flat`) that visually approximates the Marp bai-flat theme. Estimated effort: 18-33 hours per the Slidev research.

## Decision

Skip for now. Revisit if a specific presentation needs interactive features.
