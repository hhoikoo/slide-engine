# c-port-stub

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A port or slot on a box edge. The symbol is the outward bump; the slot is the same arc with the sweep flag flipped.

```xml
<use href="#c-port-stub" x="858" y="650" width="12" height="20"/>
```

Place at `x = edge - 2`, `y = centre - 10`. Radius is fixed at 8. Emit it after the box it sits on: the white rect inside the symbol erases the box outline across the mouth, which is what stops a chord line showing through the stub.

The slot variant, inline, for the same right edge:

```xml
<rect x="858.5" y="680" width="3" height="16" fill="#ffffff"/>
<path d="M860,680 a8,8 0 0 0 0,16" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linecap="round"/>
```

On a right edge, sweep 1 bulges out and sweep 0 cuts in. On a left edge the two are the other way round. For a top or bottom edge, swap the arc's `0,16` for `16,0` and move the erase rect to match.
