# c-ghost-column

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

The other form of "N of these": one real column plus empty placeholders. Use it when the reader needs to see the slots, not the contents. `c-card-stack` when they overlap in reality, `c-ghost-column` when they sit side by side.

```xml
<rect x="520" y="364" width="92" height="72" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<rect x="632" y="364" width="92" height="72" rx="6" fill="#ffffff"
      stroke="#dfe3e8" stroke-width="2" stroke-linejoin="round"/>
<rect x="744" y="364" width="92" height="72" rx="6" fill="#ffffff"
      stroke="#dfe3e8" stroke-width="2" stroke-linejoin="round"/>
```

Ghosts take `#dfe3e8` at the same weight as the real one, never a thinner stroke and never a dash. Identical width and pitch to the pixel. Ghosts carry no label at all; a labelled ghost is just a box.
