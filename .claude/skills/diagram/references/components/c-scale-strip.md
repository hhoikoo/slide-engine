# c-scale-strip

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

An ordered ramp shown in place. **This is not a legend.** A legend maps arbitrary keys to names and makes the reader shuttle back per cell. This states once which end of one ordinal ramp is "more", after which every cell reads by relative darkness. **Product register only.**

```xml
<rect x="812" y="968" width="40" height="24" rx="6" fill="#edf5ff"/>
<rect x="856" y="968" width="40" height="24" rx="6" fill="#6db1ff"/>
<rect x="900" y="968" width="40" height="24" rx="6" fill="#1071e5"/>
<text x="812" y="960" font-size="13.33" font-style="italic" fill="#6f7681">low</text>
<text x="940" y="960" font-size="13.33" font-style="italic" fill="#6f7681"
      text-anchor="end">high</text>
```

Geometry fixed: three swatches, 40 x 24, `rx=6`, pitch 44. Exactly three steps, one hue, pale then mid then dark. You set the hue and the two end words. Place it in the matrix corner, on the header line, as part of the grid rather than floating beside it. It also teaches that the palest step is a value and not an empty cell.
