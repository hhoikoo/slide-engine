# Paired-value scale

One archetype from the diagram library. The selection table and the "when nothing fits" procedure are in `../archetypes.md`.

Commonly called a dumbbell or lollipop chart. Harvested from real work rather than from the reference corpus, which contained no one-dimensional plot.

**For**: N items that each carry **two** values on the **same** continuous scale, where the question is both where each item sits and how the gap between its pair compares across items. Settings against their limits, current against target, start against finish. The case the comparison matrix cannot take: a matrix renders six items as six equal rows and throws away the spread, and if the values span orders of magnitude the spread *is* the message.

**Recipe**: one horizontal axis, no frame, no gridlines, ticks only where a reader must read a value off them. One row per item at a fixed pitch, item names right-anchored in a label column outside the plot. On each row, a filled dot for each of the two values joined by a 2px `#ced4db` rule; emit the rule first so the dots overpaint its ends. Colour encodes **which of the two values**, one hue each, held identical down every row. Name the two hues once, on the first row only, with italic grey labels on hairline leaders: never a legend, and never repeated per row. **Use a log axis when the values span more than one order of magnitude**, and say so in an italic grey note at the axis end, because on a log axis equal ratios render as equal bar lengths and the varying gap becomes directly readable as length.

**Prevents**: the six-row table of numbers that hides the fact that the values span 60x and that the ratio between each pair is not constant.
