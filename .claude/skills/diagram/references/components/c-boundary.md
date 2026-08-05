# c-boundary

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A logical boundary, zone, plane or trust perimeter. Dashed, unfilled, with an italic grey label in the top band. Nesting a box inside it means containment, so no arrow is needed to say "part of".

Geometry is fixed relative to the rect: **top band 40, side and bottom inset 16, label baseline at `y+26`**. Content therefore runs from `(x+16, y+40)` to `(x+w-16, y+h-16)`.

```xml
<rect x="40" y="72" width="280" height="104" rx="6" fill="none"
      stroke="#979ea8" stroke-width="2" stroke-dasharray="6 4"
      stroke-linejoin="round"/>
<!-- contents here, then all text last -->
<text x="56" y="98" font-size="15.56" font-style="italic" fill="#6f7681">zone</text>
```

You set `x`, `y`, `width`, `height` and the label. Change the stroke colour only to encode the boundary kind: blue `#6db1ff` for network, `#979ea8` for logical, `#e81313` for optional.
