# c-disabled

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

Superseded, inactive, or removed by the change being argued.

```xml
<rect x="40" y="1786" width="160" height="56" rx="6" fill="#f2f3f5"
      stroke="#b4bdc8" stroke-width="2" stroke-dasharray="2 2"
      stroke-linejoin="round"/>
<text x="120" y="1814" font-size="17.78" font-weight="700" fill="#979ea8"
      text-anchor="middle" dominant-baseline="central">legacy path</text>
```

Grey plus dotted: fill `#f2f3f5`, stroke `#b4bdc8`, dash `2 2`, label `#979ea8`. Weight stays 2 and the geometry stays identical to the live version, which is what lets a before/after pair keep pixel-identical panels.

**One conflict to watch.** Dotted also means telemetry. If your figure already uses a dotted line for telemetry, this part is ambiguous; use `c-strikethrough` instead, or drop the dash and rely on grey alone.
