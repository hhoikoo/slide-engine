# c-iso-cylinder

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

**A cylinder in this projection is not projected.** It stays the flat datastore glyph standing upright, `ry/rx = 0.21`, seated on the plane the same way everything else is. A circle correctly projected onto the ground plane comes out as a tilted ellipse and reads as a mistake. The cylinder is a symbol of a datastore, not a solid in the scene.

So this is `c-cylinder`, unchanged, plus the seating rule:

```xml
<path d="M380,1660 l-40,40 h176 l40,-40 z" fill="#eef0f3"
      stroke="#b4bdc8" stroke-width="2" stroke-linejoin="round"/>
<path d="M392,1612 a56,12 0 0 1 112,0 v56 a56,12 0 0 1 -112,0 z" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<path d="M392,1612 a56,12 0 0 0 112,0" fill="none"
      stroke="#000000" stroke-width="2" stroke-linecap="round"/>
```
