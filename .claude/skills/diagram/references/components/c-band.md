# c-band

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A solid neutral grouping band. Weaker than a boundary: it groups things that belong together without claiming a perimeter. **Product register only.**

```xml
<rect x="360" y="72" width="240" height="104" rx="6" fill="#f2f3f5"/>
<!-- contents, then text last -->
<text x="376" y="98" font-size="15.56" font-style="italic" fill="#6f7681">group</text>
```

No stroke. The fill is always `#f2f3f5`; a band that needs a second tint is a boundary instead. Same inset rule as `c-boundary` if you label it.
