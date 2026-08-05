# c-iso-plane

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

The unit of an isometric layer stack: a fabric, a zone, a tier, drawn as a surface rather than a box.

```xml
<path d="M176,1360 l-64,64 h288 l64,-64 z" fill="#6db1ff" fill-opacity="0.18"
      stroke="#1071e5" stroke-width="2" stroke-linejoin="round"/>
<path d="M176,1396 l-64,64 h288 l64,-64 z" fill="#00c2a8" fill-opacity="0.18"
      stroke="#008573" stroke-width="2" stroke-linejoin="round"/>
<path d="M176,1432 l-64,64 h288 l64,-64 z" fill="#e8822a" fill-opacity="0.18"
      stroke="#cc4e00" stroke-width="2" stroke-linejoin="round"/>
```

You set `X`, `Y`, `W`, `D` and the hue. Everything else is fixed:

- **`W:D` between 4:1 and 5:1** for a slab that reads as a surface, 10:1 for a thin fabric sliver. Nothing squarer than 4:1; it stops looking like a plane and starts looking like a lid. Above, 288:64 is 4.5:1.
- **Stack offset is pure vertical translation**, same `X`, `Y` stepped. Base case: **pitch is 40 to 45% of the depth**, so adjacent slabs overlap by 55 to 60%. Less overlap and the group stops reading as one stack. **When objects are seated on different slabs the seating inequality in `tokens.md` overrides this and forces a larger pitch**: `exemplars/08-isometric-layers.svg` runs pitch 36 on depth 48, a 75% pitch, because every base line has to clear every slab edge by 12px. Derive the pitch from the seating, never from the look, and expect a seated scene to overlap less than the base case.
- **Paint the top slab first and the bottom slab last.** The lowest slab overpaints the ones above it. That is backwards for shelves and correct for what this actually looks like, a deck fanned toward the reader.
- **`fill-opacity` scales against area**, 0.16 to 0.21 for a full-size plane and 0.54 to 0.55 for a narrow sliver. The saturated ink then stays roughly constant whatever the slab's size.
- **The outline carries the identity, not the fill.** Same-hue-darker stroke, fully opaque. Where two translucent fills cross the blend is muddy, but the two outlines still trace two slabs. Drop the outlines and the stack collapses into a smear.
- **Three translucent slabs is the ceiling.** Three plus one boundary plane reads; five does not.
