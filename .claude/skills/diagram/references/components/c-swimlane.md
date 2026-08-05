# c-swimlane

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

One band of a layered stack, with its label outside on the left. The label sits outside because a layer name is a role, not a component, and putting it inside makes the band read as a box. **Product register only.**

```xml
<rect x="736" y="80" width="240" height="88" rx="6" fill="#f2f3f5"/>
<!-- contents, then text last -->
<text x="720" y="124" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="end" dominant-baseline="central">control</text>
```

Label x is `band.x - 16`, anchored `end`, vertically centred on the band. Gutter between lanes 8 to 16. Do not draw arrows between adjacent lanes; adjacency already says "sits on".
