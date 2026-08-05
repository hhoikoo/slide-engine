# c-strikethrough

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A component that is being replaced, where the reader still needs to read its name.

```xml
<path d="M278,1814 H362" fill="none" stroke="#7d8998" stroke-width="1"/>
<text x="320" y="1814" font-size="17.78" font-weight="700" fill="#7d8998"
      text-anchor="middle" dominant-baseline="central">old queue</text>
```

Explicit line rather than `text-decoration`, so the weight is 1 and the colour is `#7d8998` regardless of renderer. Emit the line before the text. Span it from the label width formula plus 4 either side: at 17.78, `width = 17.78 x 0.55 x chars`. The box outline goes to `#979ea8` too; the label alone struck through inside a black box reads as a mistake.
