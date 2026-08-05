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

| Part | What it is |
|---|---|
| [`c-boundary`](components/c-boundary.md) | A logical boundary, zone, plane or trust perimeter. |
| [`c-band`](components/c-band.md) | A solid neutral grouping band. |
| [`c-swimlane`](components/c-swimlane.md) | One band of a layered stack, with its label outside on the left. |

## Nodes

| Part | What it is |
|---|---|
| [`c-box`](components/c-box.md) | The standard component. |
| [`c-box-sharp`](components/c-box-sharp.md) | The whiteboard-register box. |
| [`c-cell`](components/c-cell.md) | A sharp rect used as a data row or table cell. |
| [`c-stadium`](components/c-stadium.md) | External system or endpoint. |
| [`c-cylinder`](components/c-cylinder.md) | Datastore. |
| [`c-diamond`](components/c-diamond.md) | A routing decision. |
| [`c-note`](components/c-note.md) | A request, a document, a message. |
| [`c-parallelogram`](components/c-parallelogram.md) | A job or workload: something that runs and finishes, as against a component that sits there. |
| [`c-cloud`](components/c-cloud.md) | The internet, or anything outside the system you are drawing. |
| [`c-card-stack`](components/c-card-stack.md) | "N of these", where the N things are identical and their sameness is the point. |
| [`c-ghost-column`](components/c-ghost-column.md) | The other form of "N of these": one real column plus empty placeholders. |

## Connectors and annotation

| Part | What it is |
|---|---|
| [`c-elbow`](components/c-elbow.md) | The orthogonal connector. |
| [`c-arrowhead`](components/c-arrowhead.md) | One triangle everywhere. |
| [`c-block-arrow`](components/c-block-arrow.md) | The before/after transition. |
| [`c-leader`](components/c-leader.md) | The house's answer to a legend: label the element in place, on a hairline curved leader. |
| [`c-bracket`](components/c-bracket.md) | Marks a span across a row: "these three are one shard", "this range is the budget". |
| [`c-port-stub`](components/c-port-stub.md) | A port or slot on a box edge. |
| [`c-ghost-route`](components/c-ghost-route.md) | The path not taken. |
| [`c-arrow-label`](components/c-arrow-label.md) | What an arrow carries. |
| [`c-panel-label`](components/c-panel-label.md) | The only text licensed to look like a title, and only on a genuine multi-panel comparison. |

## Data display

| Part | What it is |
|---|---|
| [`c-axes`](components/c-axes.md) | Two lines. |
| [`c-threshold`](components/c-threshold.md) | A ceiling, a budget, a setpoint. |
| [`c-scale-strip`](components/c-scale-strip.md) | An ordered ramp shown in place. |
| [`c-bus-bar`](components/c-bus-bar.md) | A network fabric. |

## Isometric

A separate visual system. Read `tokens.md`, "The oblique plane", before using any of it. Every constant in these entries is from that section; nothing is derived.

Read [the projection](components/projection.md) and [seating](components/seating.md) before drawing any of these. The isometric group is neither register and must not be mixed with flat boxes in the same figure.

| Part | What it is |
|---|---|
| [`c-iso-plane`](components/c-iso-plane.md) | The unit of an isometric layer stack: a fabric, a zone, a tier, drawn as a surface rather than a box. |
| [`c-iso-cube`](components/c-iso-cube.md) | A container, pod or session inside an isometric scene. |
| [`c-iso-cylinder`](components/c-iso-cylinder.md) | A cylinder in this projection is not projected. |
| [`c-iso-grid`](components/c-iso-grid.md) | Units of capacity, tiled across a plane. |

## State

| Part | What it is |
|---|---|
| [`c-disabled`](components/c-disabled.md) | Superseded, inactive, or removed by the change being argued. |
| [`c-strikethrough`](components/c-strikethrough.md) | A component that is being replaced, where the reader still needs to read its name. |
| [`c-ellipsis-h`, `c-ellipsis-v`](components/c-ellipsis.md) | Elision: a drawn stand-in for items you did not draw. |

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
