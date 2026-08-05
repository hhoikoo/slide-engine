# c-box

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

The standard component. Everything that is not something else is this.

```xml
<rect x="40" y="252" width="160" height="56" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<text x="120" y="280" font-size="17.78" font-weight="700" fill="#000000"
      text-anchor="middle" dominant-baseline="central">scheduler</text>
```

Width comes from the label, not from taste: `font-size x (0.55 x latin + 0.88 x hangul)` plus 32 to 36 of horizontal padding, rounded up to a multiple of 8. Height 48 or 56. For a tinted box, pale fill plus same-hue mid stroke: `fill="#edf5ff" stroke="#6db1ff"`.
