# c-bus-bar

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A network fabric. Colour here encodes fabric identity, which is the one legitimate case for more than three hues; declare it with `<!-- categorical: N -->`.

```xml
<path d="M140,1180 H200" fill="none" stroke="#6db1ff" stroke-width="2"/>
<path d="M200,1152 V1260" fill="none" stroke="#6db1ff" stroke-width="7"
      stroke-linecap="round"/>
<text x="200" y="1140" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="middle">storage</text>
```

Bar is 5 to 7 wide with round caps, vertical, spanning the full height of the node groups it serves. Taps are 2px lines **in the bar's own colour**. A line that ends on a bar is a tap; a line that runs past one is a crossing, and no line ever crosses a bar of its own hue, so the two cases never look alike. The fabric label is italic grey above the bar, centred.

Emit taps before bars so the bar overpaints the tap ends and each tap reads as terminating on the fabric.
