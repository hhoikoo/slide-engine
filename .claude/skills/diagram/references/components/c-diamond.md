# c-diamond

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A routing decision. One per branch point, never as decoration.

```xml
<path d="M688,240 L776,280 L688,320 L600,280 Z" fill="#f2f3f5"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Written as centre `(cx,cy)` with half-width `hw` and half-height `hh`: `M{cx},{cy-hh} L{cx+hw},{cy} L{cx},{cy+hh} L{cx-hw},{cy} Z`. `hw` must be at least the label width, because the diamond is only full width on its centre line. `hh` 40 to 56. Label the two exits on the outgoing arrows, not inside the diamond.
