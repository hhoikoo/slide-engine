# c-stadium

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

External system or endpoint. `rx = height/2`, and that radius means this and nothing else. It is not a pill, not a chip, not a badge.

```xml
<rect x="240" y="252" width="144" height="56" rx="28" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Set `rx` to exactly half the height or the linter reads it as a stray corner radius and fails the register check.
