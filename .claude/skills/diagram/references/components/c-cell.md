# c-cell

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A sharp rect used as a data row or table cell. Cells stack flush at gutter 0, which is what tells the reader they are one row rather than three components.

```xml
<rect x="280" y="1958" width="88" height="56" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<rect x="368" y="1958" width="88" height="56" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Repeated cells share width and pitch to the pixel. This is the whiteboard-register workhorse: sequence rows of state per step are built from it.
