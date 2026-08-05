# c-axes

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

Two lines. No frame, no gridlines, no ticks unless a reader must read values off them.

```xml
<path d="M60,964 V1084" fill="none" stroke="#3a414a" stroke-width="2"/>
<path d="M60,1084 H300" fill="none" stroke="#3a414a" stroke-width="2"/>
<path d="M60,1068 L120,1044 L180,1032 L240,1008 L300,1000" fill="none"
      stroke="#3a414a" stroke-width="2" stroke-linejoin="round"
      stroke-linecap="round"/>
<text x="60" y="956" font-size="15.56" font-style="italic" fill="#6f7681">value</text>
<text x="300" y="1104" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="end">time</text>
<text x="308" y="1000" font-size="15.56" font-weight="700" fill="#000000"
      dominant-baseline="central">p95</text>
```

Two separate paths, not one polyline, so the corner has no join artefact. Axis labels are italic grey at the ends: the y label 8 above the axis top, the x label 20 below the axis and end-anchored. **Series are labelled in place at the end of the line**, bold, 8 past the last point, never in a legend. One or two series, no more.
