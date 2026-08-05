# c-threshold

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A ceiling, a budget, a setpoint. Dashed, in the accent hue, with its name at the end of the line.

```xml
<path d="M420,984 H660" fill="none" stroke="#e8822a" stroke-width="2"
      stroke-dasharray="6 4" stroke-linecap="round"/>
<text x="668" y="984" font-size="15.56" font-weight="700" fill="#cc4e00"
      dominant-baseline="central">capacity</text>
```

Spans the full plot width. Dash is `6 4`, the same dash a boundary uses, because a threshold is a boundary in one dimension. Stroke is the hue mid, the label the hue dark, 8 past the line end and vertically centred on it.
