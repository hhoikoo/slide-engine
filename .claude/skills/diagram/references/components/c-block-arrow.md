# c-block-arrow

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

The before/after transition. A line arrow means dataflow; a block arrow means "and then the world changed". Symbol, fixed at 56 x 44.

```xml
<use href="#c-block-arrow" x="240" y="644" width="56" height="44"/>
```

Filled `#979ea8`, no stroke. Exactly one per figure, on the axis between the two panels, vertically centred on the panel content. Never use it for a flow.
