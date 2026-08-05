# c-parallelogram

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A job or workload: something that runs and finishes, as against a component that sits there. The lean is always the same direction across a figure.

```xml
<path d="M64,380 H240 L216,436 H40 Z" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Written as `(x,y,w,h)` with a fixed 24 of lean: `M{x+24},{y} H{x+w} L{x+w-24},{y+h} H{x} Z`. Keep the lean at 24 across every parallelogram in a figure.
