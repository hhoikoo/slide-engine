# Diagram components

Reusable composite parts at diagram scale. `tokens.md` describes most of these in prose; this file draws them, so no figure has to re-derive the geometry.

Browse `components-sheet.png` first. Every part on the sheet is captioned with its id, and the sheet is a straight render of `components.svg`, so the two cannot drift.

For 24x24 monochrome glyphs, see `icons.md`. That set and this one do not overlap: icons are marks that qualify a box, components are the boxes.

## Copy, do not reference

**Cross-file `<use href>` does not work in this build and never will.** The engine inlines each figure into the slide DOM and rewrites every `id` with a random per-file prefix (`scopeSvgIds` in `engine/marp.config.js`), so `#c-iso-cube` in your figure resolves to nothing once the deck is built. There is no shared sprite at run time.

So every figure carries what it uses. Paste the markup below into your own file. Same-file `<use href="#c-iso-cube">` is fine and is rewritten correctly, which is exactly what makes symbols worth keeping for parts you instance more than once.

Two consequences worth stating plainly. Ids may be reused freely across figures, because they are scoped per file. And when a part here changes, existing figures do not change with it; that is the cost of inlining and it is not worth fighting.

## Symbols versus templates

A part is shipped as a `<symbol>` only when its geometry is genuinely fixed and an author would otherwise retype fiddly numbers. Four qualify.

| symbol | viewBox | place with |
|---|---|---|
| `c-iso-cube` | `0 0 128 124` | `<use href="#c-iso-cube" x="X" y="Y" width="128" height="124"/>` |
| `c-cloud` | `0 0 96 56` | `<use href="#c-cloud" x="X" y="Y" width="96" height="56"/>` |
| `c-block-arrow` | `0 0 56 44` | `<use href="#c-block-arrow" x="X" y="Y" width="56" height="44"/>` |
| `c-port-stub` | `0 0 12 20` | `<use href="#c-port-stub" x="edge-2" y="centre-10" width="12" height="20"/>` |

**Always pass `width` and `height` equal to the symbol's viewBox.** A `<use>` without them, or with different ones, scales the symbol, and a scaled symbol has the wrong stroke weight for the figure around it. That is the single easiest way to get this wrong.

Everything else is a template, because its size depends on what it holds. A boundary is as wide as its contents; a box is as wide as its label. A `<symbol>` that only works at one width is worse than a template an author adapts, so those are not shipped as symbols even where a symbol would have been possible.

## What is fixed and what you set

Fixed in every part below, never a parameter: `rx="6"` in the product register, `stroke-width="2"` on outlines, `stroke-linejoin="round"` and `stroke-linecap="round"`, `#000000` for outlines, `#3a414a` for connectors, `#979ea8` for hairlines and boundaries, the six type sizes, the `6 4` dash for a boundary, the 6px elbow radius. Amber mid is `#e8822a`, the theme token, not the corpus `#fc9432`.

You set: position, width, height, label text, and the accent hue where a part takes one. Nothing else.

## Registers

Every part works in the product register. Where a part also works on a whiteboard, drop `rx="6"` and use white fills. Three exceptions are product-register only and are marked as such below: `c-band`, `c-swimlane` and `c-scale-strip` all depend on a tinted fill, which the whiteboard register does not have.

The isometric group is its own thing. It is neither register and must not be mixed with flat boxes in the same figure.

---

## Containers and grouping

### c-boundary

A logical boundary, zone, plane or trust perimeter. Dashed, unfilled, with an italic grey label in the top band. Nesting a box inside it means containment, so no arrow is needed to say "part of".

Geometry is fixed relative to the rect: **top band 40, side and bottom inset 16, label baseline at `y+26`**. Content therefore runs from `(x+16, y+40)` to `(x+w-16, y+h-16)`.

```xml
<rect x="40" y="72" width="280" height="104" rx="6" fill="none"
      stroke="#979ea8" stroke-width="2" stroke-dasharray="6 4"
      stroke-linejoin="round"/>
<!-- contents here, then all text last -->
<text x="56" y="98" font-size="15.56" font-style="italic" fill="#6f7681">zone</text>
```

You set `x`, `y`, `width`, `height` and the label. Change the stroke colour only to encode the boundary kind: blue `#6db1ff` for network, `#979ea8` for logical, `#e81313` for optional.

### c-band

A solid neutral grouping band. Weaker than a boundary: it groups things that belong together without claiming a perimeter. **Product register only.**

```xml
<rect x="360" y="72" width="240" height="104" rx="6" fill="#f2f3f5"/>
<!-- contents, then text last -->
<text x="376" y="98" font-size="15.56" font-style="italic" fill="#6f7681">group</text>
```

No stroke. The fill is always `#f2f3f5`; a band that needs a second tint is a boundary instead. Same inset rule as `c-boundary` if you label it.

### c-swimlane

One band of a layered stack, with its label outside on the left. The label sits outside because a layer name is a role, not a component, and putting it inside makes the band read as a box. **Product register only.**

```xml
<rect x="736" y="80" width="240" height="88" rx="6" fill="#f2f3f5"/>
<!-- contents, then text last -->
<text x="720" y="124" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="end" dominant-baseline="central">control</text>
```

Label x is `band.x - 16`, anchored `end`, vertically centred on the band. Gutter between lanes 8 to 16. Do not draw arrows between adjacent lanes; adjacency already says "sits on".

---

## Nodes

### c-box

The standard component. Everything that is not something else is this.

```xml
<rect x="40" y="252" width="160" height="56" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<text x="120" y="280" font-size="17.78" font-weight="700" fill="#000000"
      text-anchor="middle" dominant-baseline="central">scheduler</text>
```

Width comes from the label, not from taste: `font-size x (0.55 x latin + 0.88 x hangul)` plus 32 to 36 of horizontal padding, rounded up to a multiple of 8. Height 48 or 56. For a tinted box, pale fill plus same-hue mid stroke: `fill="#edf5ff" stroke="#6db1ff"`.

### c-box-sharp

The whiteboard-register box. Same part, `rx` dropped, fill always white.

```xml
<rect x="40" y="1958" width="160" height="56" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

A file is either all `rx=6` or all sharp. The linter fails on a mix.

### c-cell

A sharp rect used as a data row or table cell. Cells stack flush at gutter 0, which is what tells the reader they are one row rather than three components.

```xml
<rect x="280" y="1958" width="88" height="56" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<rect x="368" y="1958" width="88" height="56" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Repeated cells share width and pitch to the pixel. This is the whiteboard-register workhorse: sequence rows of state per step are built from it.

### c-stadium

External system or endpoint. `rx = height/2`, and that radius means this and nothing else. It is not a pill, not a chip, not a badge.

```xml
<rect x="240" y="252" width="144" height="56" rx="28" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Set `rx` to exactly half the height or the linter reads it as a stray corner radius and fails the register check.

### c-cylinder

Datastore. Two paths: the body, which carries the fill and the outer outline, then the visible cap arc on top of it.

```xml
<path d="M424,264 a68,14 0 0 1 136,0 v32 a68,14 0 0 1 -136,0 z" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<path d="M424,264 a68,14 0 0 0 136,0" fill="none"
      stroke="#000000" stroke-width="2" stroke-linecap="round"/>
```

Read it as: start at the left of the top ellipse, sweep 1 over the top, drop `v{body}`, sweep 1 under the bottom, close. Then repeat the first arc with sweep 0 to draw the front half of the top ellipse.

You set `rx` (half the width) and the body height. **`ry / rx = 0.21`**, from `tokens.md`. At `rx=68` that is `ry=14`. Overall height is `body + 2 x ry`. Centre the label at `top_ellipse_centre + body x 0.7`, low enough to clear the cap arc.

### c-diamond

A routing decision. One per branch point, never as decoration.

```xml
<path d="M688,240 L776,280 L688,320 L600,280 Z" fill="#f2f3f5"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Written as centre `(cx,cy)` with half-width `hw` and half-height `hh`: `M{cx},{cy-hh} L{cx+hw},{cy} L{cx},{cy+hh} L{cx-hw},{cy} Z`. `hw` must be at least the label width, because the diamond is only full width on its centre line. `hh` 40 to 56. Label the two exits on the outgoing arrows, not inside the diamond.

### c-note

A request, a document, a message. Rounded top, wavy bottom.

```xml
<path d="M822,252 H970 Q976,252 976,258 V300 c-20,10 -60,-10 -80,0 c-20,10 -60,-10 -80,0 V258 Q816,252 822,252 Z"
      fill="#ffffff" stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Parameterised on `(x,y,w,h)` with the flat bottom at `yb = y + h - 8`:

```
M{x+6},{y} H{x+w-6} Q{x+w},{y} {x+w},{y+6} V{yb}
c-{w/8},10 -{3w/8},-10 -{w/2},0
c-{w/8},10 -{3w/8},-10 -{w/2},0
V{y+6} Q{x},{y} {x+6},{y} Z
```

Two symmetric cubics make two humps. The wave carries about 7 either side of `yb`, so budget `h` as the distance to the flat part, not to the lowest ink. Keep the label above `yb`.

### c-parallelogram

A job or workload: something that runs and finishes, as against a component that sits there. The lean is always the same direction across a figure.

```xml
<path d="M64,380 H240 L216,436 H40 Z" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Written as `(x,y,w,h)` with a fixed 24 of lean: `M{x+24},{y} H{x+w} L{x+w-24},{y+h} H{x} Z`. Keep the lean at 24 across every parallelogram in a figure.

### c-cloud

The internet, or anything outside the system you are drawing. Symbol.

```xml
<use href="#c-cloud" x="280" y="392" width="96" height="56"/>
```

Fixed at 96 x 56. It is too small to hold a label, so label it beside, at 17.78 bold, vertically centred on the cloud. The outline is the union of three circles on one baseline, which is why the path is not editable by hand: change the size with a second symbol rather than by scaling this one.

### c-card-stack

"N of these", where the N things are identical and their sameness is the point. Three cards is always the right number.

```xml
<rect x="64" y="528" width="160" height="56" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<rect x="52" y="520" width="160" height="56" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<rect x="40" y="512" width="160" height="56" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<text x="120" y="540" ...>worker</text>
```

**Connect on the left or the top edge only.** The offset puts the back cards down and to the right of the front card, so a connector arriving at the front card's right or bottom edge lands on top of them and reads as pointing at the wrong card. If the flow reaches this element from the right, either re-plan the layout so it arrives from the left, or drop the stack and use a plain `c-box` with an italic count label beside it.

**Emit back to front.** The back card is written first and the front card last, so the front one overpaints. Offset is `(+12, +8)` per card. `tokens.md` records the corpus measurement as `(+15, +8)`; the exemplars round it to `(+12, +8)` to stay on the multiple-of-4 grid, and that is what this part uses. Only the front card is labelled. Connectors attach to the front card.

### c-ghost-column

The other form of "N of these": one real column plus empty placeholders. Use it when the reader needs to see the slots, not the contents. `c-card-stack` when they overlap in reality, `c-ghost-column` when they sit side by side.

```xml
<rect x="520" y="364" width="92" height="72" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<rect x="632" y="364" width="92" height="72" rx="6" fill="#ffffff"
      stroke="#dfe3e8" stroke-width="2" stroke-linejoin="round"/>
<rect x="744" y="364" width="92" height="72" rx="6" fill="#ffffff"
      stroke="#dfe3e8" stroke-width="2" stroke-linejoin="round"/>
```

Ghosts take `#dfe3e8` at the same weight as the real one, never a thinner stroke and never a dash. Identical width and pitch to the pixel. Ghosts carry no label at all; a labelled ghost is just a box.

---

## Connectors and annotation

### c-elbow

The orthogonal connector. 77% of corpus routing is orthogonal and 1091 of 1129 elbows are r=6, so this is the most consistent detail in the whole style.

```xml
<path d="M440,536 H474 Q480,536 480,542 V600 Q480,606 486,606 H514" fill="none"
      stroke="#3a414a" stroke-width="2" stroke-linejoin="round"
      marker-end="url(#ah-ink)"/>
```

**The control-point rule, which is the whole part.** At each corner, name the un-rounded vertex `V`. Then: stop 6 units short of `V` on the axis you arrived along, emit `Q{Vx},{Vy}` with the control point exactly on `V`, and land 6 units past `V` on the axis you leave along. So a corner at `(480,536)` turning from rightwards to downwards is `H474 Q480,536 480,542`. The control point is always the vertex itself, never an offset from it, and the two 6s are always the same 6 as the box `rx`.

**No `stroke-linecap="round"` on a path that carries a marker.** A round cap is centred on the path's endpoint and `refX="10"` puts the arrowhead's tip on that same point, so the cap protrudes past the tip as a visible nub. Keep `stroke-linejoin="round"` for the elbows; drop the linecap. Round caps are for open-ended lines only: leaders, bus bars, span rules. `lint-svg.py` fails this as `ARROW_CAP`.

Always `fill="none"`. **Inset the endpoint by `4 + stroke-width` from the target border**, so 6 at stroke-width 2; the arrowhead then lands on the border instead of over it. Dash the whole path `6 4` to mean logical rather than physical.

### c-arrowhead

One triangle everywhere. Defined as markers, not symbols, and copied into your `<defs>`.

```xml
<marker id="ah-ink" viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#3a414a"/>
</marker>
<marker id="ah-ink-thick" viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth="3" markerHeight="3" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#3a414a"/>
</marker>
<marker id="ah-hair" viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#979ea8"/>
</marker>
```

**Sizing.** `markerUnits` defaults to `strokeWidth` and must stay there. The rendered head length is therefore `markerWidth x stroke-width`. Hold that product at **12 for the full head** and at **7 for the half head** on 1px annotation leaders and dotted lines. So `markerWidth=6` at stroke-width 2, `markerWidth=3` at stroke-width 4, `markerWidth=7` at stroke-width 1. Set `markerHeight` to the same number. Do not switch to `userSpaceOnUse`: at stroke-width 8 the line swallows the head.

**One marker per colour.** `context-stroke` works in Chrome but Safari has not shipped it, and deployed HTML is Safari-exposed. `components.svg` carries `ah-ink`, `ah-ink-thick`, `ah-hair`, `ah-blue`, `ah-amber` and `ah-ghost`; copy the ones you use and delete the rest.

### c-block-arrow

The before/after transition. A line arrow means dataflow; a block arrow means "and then the world changed". Symbol, fixed at 56 x 44.

```xml
<use href="#c-block-arrow" x="240" y="644" width="56" height="44"/>
```

Filled `#979ea8`, no stroke. Exactly one per figure, on the axis between the two panels, vertically centred on the panel content. Never use it for a flow.

### c-leader

The house's answer to a legend: label the element in place, on a hairline curved leader. Béziers are for leaders and nothing else.

```xml
<path d="M96,740 Q96,700 138,694" fill="none"
      stroke="#979ea8" stroke-width="1" stroke-linecap="round"
      marker-end="url(#ah-hair)"/>
<text x="96" y="756" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="middle">one per zone</text>
```

**The control-point rule.** One quadratic, always. If the leader leaves the label vertically, the control point is `(start.x, end.y)`. If it leaves horizontally, it is `(end.x, start.y)`. Either way the curve is a quarter turn: it leaves the label along one axis and arrives at the target along the other.

The label is italic 15.56 or 13.33 in `#6f7681`, set on white, 12 to 16 clear of the curve's start. Italic marks it as text about the picture rather than the name of a thing. **Korean leaders are set upright in the same grey**, because Pretendard ships no italic and Hangul in Inter Italic looks wrong.

### c-bracket

Marks a span across a row: "these three are one shard", "this range is the budget".

```xml
<path d="M360,700 V706 H656 V700" fill="none"
      stroke="#3a414a" stroke-width="1" stroke-linejoin="round"/>
<text x="508" y="726" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="middle">one shard</text>
```

Depth is 6, weight is 1, and it sits 12 below the row it brackets. The label is centred under it, italic grey, 20 below the bracket line. Flip the two `V` runs upward to bracket from above.

### c-port-stub

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

### c-ghost-route

The path not taken. `#dfe3e8` at full weight, with a matching arrowhead, so it reads as a route that exists but is not being argued.

```xml
<path d="M40,856 H136" fill="none" stroke="#dfe3e8" stroke-width="2"
      stroke-linecap="round" marker-end="url(#ah-ghost)"/>
```

Full weight is the point. A thinner or dashed ghost reads as a different kind of flow rather than the same flow, unused. Needs the `ah-ghost` marker.

### c-arrow-label

What an arrow carries. Bold, 17.78, set directly on white.

```xml
<text x="296" y="828" font-size="17.78" font-weight="700" fill="#000000"
      text-anchor="middle">writes</text>
```

**Never a filled pill and never a plate behind it.** Sit it 12 to 16 above the line, centred on the segment. Plain present verbs, never gerunds: `writes`, `evicts`, `fetches`. Colour it the flow's hue dark stop (`#cc4e00`, `#1071e5`, `#008573`) when the arrow is coloured, `#000000` otherwise.

### c-panel-label

The only text licensed to look like a title, and only on a genuine multi-panel comparison.

```xml
<text x="460" y="820" font-size="15.56" font-weight="700" fill="#4c535d">before</text>
```

15.56 or 17.78 bold in `#4c535d`, top-left of its panel, 8 above the panel content. **Not 26.67**: at that size it reads as an in-canvas title, which the style forbids. Sentence case, so `before` and `after`, not `AS-IS` and `TO-BE`. Two to four words, differentiating the panels, never restating the slide headline.

---

## Data display

### c-axes

Two lines. No frame, no gridlines, no ticks unless a reader must read values off them.

```xml
<path d="M60,964 V1084" fill="none" stroke="#3a414a" stroke-width="2"/>
<path d="M60,1084 H300" fill="none" stroke="#3a414a" stroke-width="2"/>
<path d="M60,1068 L120,1044 L180,1032 L240,1008 L300,1000" fill="none"
      stroke="#3a414a" stroke-width="2" stroke-linejoin="round"
      stroke-linecap="round"/>
<text x="60" y="956" font-size="15.56" font-style="italic" fill="#6f7681">value</text>
<text x="300" y="1104" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="end">time</text>
<text x="308" y="1000" font-size="15.56" font-weight="700" fill="#000000"
      dominant-baseline="central">p95</text>
```

Two separate paths, not one polyline, so the corner has no join artefact. Axis labels are italic grey at the ends: the y label 8 above the axis top, the x label 20 below the axis and end-anchored. **Series are labelled in place at the end of the line**, bold, 8 past the last point, never in a legend. One or two series, no more.

### c-threshold

A ceiling, a budget, a setpoint. Dashed, in the accent hue, with its name at the end of the line.

```xml
<path d="M420,984 H660" fill="none" stroke="#e8822a" stroke-width="2"
      stroke-dasharray="6 4" stroke-linecap="round"/>
<text x="668" y="984" font-size="15.56" font-weight="700" fill="#cc4e00"
      dominant-baseline="central">capacity</text>
```

Spans the full plot width. Dash is `6 4`, the same dash a boundary uses, because a threshold is a boundary in one dimension. Stroke is the hue mid, the label the hue dark, 8 past the line end and vertically centred on it.

### c-scale-strip

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

### c-bus-bar

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

---

## Isometric

A separate visual system. Read `tokens.md`, "The oblique plane", before using any of it. Every constant below is from that section; nothing here is derived.

### The projection

**45 degree cavalier oblique, not a true isometric.** Horizontal stays horizontal, vertical stays vertical, and the depth axis recedes **up and to the right at exactly 45 degrees with no foreshortening**. The horizontal-to-vertical ratio on the depth axis is therefore **1:1**: one unit back is one unit right and one unit up. Equivalent to `matrix(1,0,-1,1,tx,ty)` on an axis-aligned rect.

**Never emit a `transform`.** Compute the coordinates and write the path. The house style has no transforms anywhere, and a transformed subtree breaks the linter's geometry checks and the paint-order reasoning.

The whole projection reduces to one substitution. A ground rect of width `W` and depth `D`, with its back-left corner at `(X,Y)`, becomes:

```
M{X},{Y} l{-D},{D} h{W} l{D},{-D} z

  back-left    (X, Y)          back-right   (X+W, Y)
  front-left   (X-D, Y+D)      front-right  (X+W-D, Y+D)
  bbox         (W+D) x D, x from X-D to X+W
```

Build any new object from that. A vertical extrusion of height `H` from an edge is `v{H}`; a depth edge is always `l{-D},{D}` going front, `l{D},{-D}` going back. There is nothing else to know.

**Labels are never skewed.** All 132 label runs in the source figure carry an identity transform. Plane names go horizontal to the left of the stack. Object names go horizontal above the object. Plane-content names go horizontal below the front edge. Nothing follows the 45 degree axis, ever.

### c-iso-plane

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

### c-iso-cube

A container, pod or session inside an isometric scene. This is the `isometric cube` of the shape vocabulary; there is no separate flat version. Symbol, `W=88`, `d=36`, `H=84`.

```xml
<use href="#c-iso-cube" x="650" y="1382" width="128" height="124"/>
```

Front-face top-left lands at `(x+2, y+38)`. The base line, the one that seats on a plane, lands at `y+122`.

To build one at another size, from front-face top-left `(x,yt)`, width `W`, height `H`, depth `d`:

```
top    M{x+d},{yt-d} l{-d},{d} h{W} l{d},{-d} z      fill #ffffff
side   M{x+W+d},{yt-d} l{-d},{d} v{H} l{d},{-d} z    fill #ced4db
front  M{x},{yt} h{W} v{H} h{-W} z                   fill #f2f3f5
```

All three stroked `#000000` at 2. **`d` is 0.38 to 0.43 of `W`, never 1.0**: the depth is shortened even though the 45 degree angle is not. `H` is 0.89 to 1.00 of `W`. Face lightness runs top, then front, then side, across 16 points of the neutral ramp. **No hue on a cube, ever.**

### c-iso-cylinder

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

### Seating

**`y_base = y_plane_top + D/2`.** An object's base line sits at the vertical middle of its plane's depth band, verified to within 4px on every object in the source figure.

This is the whole trick. The depth band **brackets** the base, so the far half of the plane hides behind the object and the near half runs in front of it and stays visible below. A base on the back edge floats. A base on the front edge looks glued to the lip. Only the middle rests.

**Paint every object after every plane.** For `c-iso-cube`, `y_base` is `use.y + 122`, so `use.y = y_plane_top + D/2 - 122`. For a cylinder it is the lowest point of the bottom arc, `top_ellipse_centre + body + ry`.

### c-iso-grid

Units of capacity, tiled across a plane. Square ground cells, so `w = d`.

```xml
<path d="M704,1620 l-16,16 h16 l16,-16 z" fill="#fff3d9"
      stroke="#e8822a" stroke-width="1" stroke-linejoin="round"/>
<path d="M720,1620 l-16,16 h16 l16,-16 z" fill="#fff3d9"
      stroke="#e8822a" stroke-width="1" stroke-linejoin="round"/>
<path d="M688,1636 l-16,16 h16 l16,-16 z" fill="#ffffff"
      stroke="#b4bdc8" stroke-width="1" stroke-linejoin="round"/>
```

The back-left corner of cell `(i,j)` is at **`(X + w x i - w x j, Y + w x j)`**, where `i` runs along the width axis and `j` along the depth axis. Cells tile exactly: the right edge of `(i,j)` is the left edge of `(i+1,j)`, and the front edge of `(i,j)` is the back edge of `(i,j+1)`.

Cell side 16 for a grid that reads at slide size; an `n x n` grid then occupies `2n x 16` wide by `(n+1) x 16` tall. Stroke at 1, not 2: the cells are small and 2 turns the grid into a solid mesh. Free cells white with a `#b4bdc8` outline, used cells in the accent pale with the accent mid outline. The 4:1 slab ratio does not apply here, because a cell is a tile and not a surface.

Count in the label, below the front edge, not by making the reader count cells.

---

## State

### c-disabled

Superseded, inactive, or removed by the change being argued.

```xml
<rect x="40" y="1786" width="160" height="56" rx="6" fill="#f2f3f5"
      stroke="#b4bdc8" stroke-width="2" stroke-dasharray="2 2"
      stroke-linejoin="round"/>
<text x="120" y="1814" font-size="17.78" font-weight="700" fill="#979ea8"
      text-anchor="middle" dominant-baseline="central">legacy path</text>
```

Grey plus dotted: fill `#f2f3f5`, stroke `#b4bdc8`, dash `2 2`, label `#979ea8`. Weight stays 2 and the geometry stays identical to the live version, which is what lets a before/after pair keep pixel-identical panels.

**One conflict to watch.** Dotted also means telemetry. If your figure already uses a dotted line for telemetry, this part is ambiguous; use `c-strikethrough` instead, or drop the dash and rely on grey alone.

### c-strikethrough

A component that is being replaced, where the reader still needs to read its name.

```xml
<path d="M278,1814 H362" fill="none" stroke="#7d8998" stroke-width="1"/>
<text x="320" y="1814" font-size="17.78" font-weight="700" fill="#7d8998"
      text-anchor="middle" dominant-baseline="central">old queue</text>
```

Explicit line rather than `text-decoration`, so the weight is 1 and the colour is `#7d8998` regardless of renderer. Emit the line before the text. Span it from the label width formula plus 4 either side: at 17.78, `width = 17.78 x 0.55 x chars`. The box outline goes to `#979ea8` too; the label alone struck through inside a black box reads as a mistake.

### c-ellipsis-h and c-ellipsis-v

Elision. Three columns plus a literal `…` rather than drawing all N; `⋮` for elided rows.

```xml
<text x="676" y="1814" font-size="26.67" font-weight="700" fill="#000000"
      text-anchor="middle" dominant-baseline="central">…</text>
<text x="804" y="1824" font-size="26.67" font-weight="700" fill="#000000"
      text-anchor="middle" dominant-baseline="central">⋮</text>
```

26.67 bold in `#000000`, on the row's centre line, at the same pitch the real items use. **This is the only licensed use of 26.67** and it costs you a rung of the four-size budget, so count it. `writing-shortform.md` bans `…` meaning "and so on" in a label; this is different, it is a drawn element standing in for items, not punctuation.

---

## Checking your figure

```bash
python3 .claude/skills/diagram/scripts/lint-svg.py <file.svg>
node .claude/skills/diagram/scripts/check-svg.js <file.svg>
.claude/skills/diagram/scripts/render-svg.sh <file.svg> /tmp/out.png 1400
```

`components.svg` itself fails `CANVAS` and warns `TEXT_BUDGET`. Both are expected: it is 1000 x 2028 and holds 35 captioned parts, so it is not a slide figure and never will be. Every other check passes, and a change that breaks one of them is a real defect.

Two things to watch when composing parts, because neither script catches them:

**Paint order.** Text last, always. A label emitted before an overlapping rect is invisible in the deck, and it is a real shipped defect in this repo. Within a part, emit shapes then labels; across parts, emit every label after every shape if you can.

**Register.** One file is all `rx=6` or all sharp. `lint-svg.py` fails on a mix, but it cannot tell you that a stadium among sharp rects carries no meaning at all, which is a worse problem than looking inconsistent.
