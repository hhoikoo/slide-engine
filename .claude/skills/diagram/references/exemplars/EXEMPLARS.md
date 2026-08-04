# Exemplars

Reference diagrams in the house style. Read the render, not just the source: `tokens.md` tells you the values, these show what the values produce.

```bash
.claude/skills/diagram/scripts/render-svg.sh <file.svg> /tmp/ex.png 1400
```

All content here is **invented and generic**. That is deliberate. These files live outside `presentations/`, so git-crypt does not encrypt them and they are readable on GitHub. No real product, customer, or deck subject matter appears in any of them, and none should be added. When a real diagram is worth keeping as reference, describe its *shape* in `archetypes.md` and build a generic exemplar. The real artwork stays inside the encrypted tree.

Every file below passes `lint-svg.py` and `check-svg.js` with zero findings.

| file | archetype | register | teaches |
|---|---|---|---|
| `01-nested-architecture.svg` | nested-container | product | boundaries, containment, card stacks, cylinders, leader annotation |
| `02-request-flow.svg` | request flow | product | branch encoding, two line weights, decision diamond, stadium endpoint |
| `03-before-after.svg` | before / after | product | pixel-identical panels, block arrow, novelty encoding, panel labels |
| `04-comparison-matrix.svg` | comparison matrix | product | borderless matrix, ordered ramp, fill-as-value, in-place scale strip |
| `05-whiteboard-mechanism.svg` | whiteboard mechanism | whiteboard | sharp register, small multiples, elision, inline plot |
| `06-phase-progression-ko.svg` | phase progression | product | Korean typography, accumulating panels, novelty encoding |
| `07-network-topology.svg` | network topology | product | categorical colour, bus-bars, abstract mark placement |
| `08-isometric-layers.svg` | isometric layer stack | product | 45 degree oblique projection, translucent slabs, seating objects, one hue across five surfaces |
| `09-config-surface.svg` | roll-up convergence, reversed | product | monospace for literals, measured mono widths, document glyph, mutability encoding |

## What each one is for

**01. nested-container architecture.** Three trust boundaries as dashed unfilled rects with italic grey labels; components nested inside them. Colour encodes *operational ownership* (amber self-operated, blue managed, white external) across two hues. Shows the card-stack device for "N of these", a cylinder datastore, and an italic annotation on a hairline curved leader. `viewBox 0 0 1000 400`.

**02. request flow.** Left-to-right traversal with a hit/miss branch. Colour encodes *branch*; line weight independently encodes *flow class* (4px traced request, 2px everything else). The two channels are orthogonal, which is the point: a neutral 4px segment is shared by both branches. Shape does real work too, with a stadium for external, a diamond for the decision, and a cylinder for the datastore. `viewBox 0 0 1000 320`.

**03. before / after.** Panel B is panel A with `+536` added to every x, so the only thing that moves is the change itself. Colour encodes *novelty*: one hue, applied to exactly what the change introduces. A chunky filled block arrow separates the panels, never a line arrow. Panel labels sit at 15.56 bold grey, small enough not to read as a title. `viewBox 0 0 1000 256`.

**04. comparison matrix.** Three options against four attributes with **no cell borders, no header rules, no zebra**. The grid is built from solid grey column frames crossed with dashed row frames, overhanging each other by 16px. Cells carry no text at all: the fill *is* the value, on a single blue hue in three ordered steps. The scale strip in the corner declares which end is "more" without being a legend. `viewBox 0 0 1000 400`.

**05. whiteboard mechanism.** The second register: sharp corners, white fills, black lines. Sequence rows with pixel-identical geometry show bucket state per tick, with `⋮` eliding the middle. An inline plot below follows the chart convention: two axis lines, no frame, no gridlines, a dashed accent line for the ceiling, series labelled in place at the end of the line. `viewBox 0 0 1000 520`.

**06. phase progression, Korean.** The only exemplar with Hangul, and the reference for how Korean is set. One superfamily covers both scripts, so `API 서버` is one font, one size, one weight, one baseline, with no fallback list and no size compensation between Korean and English. Boxes use stock English widths because Korean and English occupy the same width at the same size. Italic appears nowhere in the file: Pretendard ships no italic, so the annotation the house style would set in italic grey is set upright in the same grey instead, and the header comment says why. Three panels accumulate, each adding one part, with blue marking only what that panel introduces and reverting to black once carried forward. Panel 2 is panel 1 `+348`, panel 3 is `+696`, no exceptions. `viewBox 0 0 1000 308`.

**07. network topology.** Four fabrics as vertical coloured bus-bars, each a different hue, with 2px taps in the matching hue where a node group attaches. This is the one legitimate case for exceeding the 2 to 3 hue budget: colour is genuinely categorical, one hue per member of a set, so the file declares `<!-- categorical: 4 -->` to raise the linter's limit. The construction is load-bearing rather than decorative, because no line ever crosses a bar of its own hue, which lets a tap and a crossing be told apart without junction dots. Saturated fill area is 0 percent: every bit of colour is stroke. An invented abstract mark hangs outside the compute group's corner to show icon placement without using any vendor art. `viewBox 0 0 1000 520`.

**08. isometric layer stack.** The only exemplar with depth, and the reference for the 45 degree cavalier oblique: horizontal stays horizontal, vertical stays vertical, the depth axis recedes up and right with no foreshortening and no `transform` attribute anywhere. Three translucent slabs at `fill-opacity` 0.2 with a 2px same-hue-dark outline, because the outline and not the fill is what survives the overlap. Colour is categorical and runs across five surfaces per fabric: slab fill, slab outline, connector, bar and label, which is why a reader can match a bar to a slab with nothing else on the canvas to help. The load-bearing detail is seating: every object's base line sits at the middle of its slab's depth band, so the near half of the slab stays visible in front of it, and the stack pitch is chosen so no base line lands within 12px of another slab's edge. Get that wrong and the cubes sit on the wrong plane. Panel B is panel A shifted `+276` with one slab, one bar, one connector and one label deleted, so the missing fabric is the only thing that moves. `viewBox 0 0 1000 540`.

**09. config surface.** The only exemplar with monospace, and the reference for the `tokens.md` rule that mono is literal identifiers only. Four config keys and their values are the only mono runs in the file; every component name beside them is proportional, at the same size and the same weight, so the contrast between the two is what the reader sees rather than a size or colour difference doing the work. Mono is `D2Coding, monospace` at exactly 0.500 em per Latin character, and every run is sized as `font-size * 0.500 * characters` rather than estimated, which is why the value column starts at a single x for all four rows. The header comment records why D2Coding rather than a 0.6 em Menlo-class face: it is the only bundled monospace, so the advance is the same on the build machine and on a reader's, and it is the only one that covers Hangul (at 1.000 em). Composition is roll-up convergence run backwards, one document fanning out to the four runtime parts its keys govern, which keeps every connector a straight horizontal line and lets the runtime wiring live in its own lane on the right. Colour encodes *mutability*, amber for boot-only and teal for applied-live, held across the value text, the connector and the verb on it, and named in place by two hairline-leader annotations instead of a legend. The config file is a wavy-bottom document rather than a rect, because it is not a component. `viewBox 0 0 1000 408`.

## Adding one

Only when it teaches something the existing five do not. Author it on invented generic content, run it through the full skill workflow including the grader, and add a row above. An exemplar that duplicates an existing lesson makes the set slower to read without making it more useful.
