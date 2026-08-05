# c-box-sharp

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

The whiteboard-register box. Same part, `rx` dropped, fill always white.

```xml
<rect x="40" y="1958" width="160" height="56" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

A file is either all `rx=6` or all sharp. The linter fails on a mix.
