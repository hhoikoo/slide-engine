# Diagram archetypes

Twelve compositions found in the reference corpus. Pick one before drawing anything. Most bad diagrams are bad because no archetype was chosen and boxes were placed as they came to mind.

Each entry gives what it is for, the layout recipe, and the failure mode it prevents.

## 1. Nested-container architecture

**For**: what runs inside what. Deployment topology, process boundaries, ownership.

**Recipe**: outer dashed rect per boundary (zone, node, cluster) with an italic grey label top-left in a ~38px band. Components as `rx=6` boxes inside, inset 12-16px. Nest two or three levels deep. Sub-components sit literally inside their parent box. No arrow is needed to say "part of". Connectors only for genuine runtime relationships.

**Prevents**: the flat row of sibling boxes with "contains" arrows between them.

## 2. Request flow

**For**: the path of one request through a system.

**Recipe**: left-to-right. Entry point as a stadium or notched rect on the left. Orthogonal connectors, solid for the actual path. Arrow labels bold 17.78px above the line, 2-4 words. Where the path branches, a diamond. Where it fans out, three targets plus `…`. Use a second line weight only if there are genuinely two flow classes (control vs data). Then thin grey for control, thick black for data.

**Prevents**: bidirectional-arrow soup where no path is traceable.

## 3. Layered stack

**For**: abstraction levels. Only when layers genuinely stack.

**Recipe**: full-width horizontal bands, 8-16px gutter between them, italic grey label to the left of each band (outside it, not inside). Components sit within their band. Do not draw arrows between adjacent layers; adjacency already says "sits on".

**Prevents**: the seven-layer stack where layers 3-5 are invented to make it look substantial.

## 4. Comparison matrix

**For**: N options against M attributes.

**Recipe**: overlapping grouping frames. Solid grey column frames crossed with dashed row frames. **No cell borders, no header rules, no zebra striping.** Column headers italic. Where the cell value is categorical, make the cell *fill* the value and drop the text entirely.

**Prevents**: a spreadsheet with rounded corners.

## 5. Before / after

**For**: one change, argued.

**Recipe**: two panels with **pixel-identical internal geometry** so the difference is the only thing that moves. Panel labels bold small top-left (`AS-IS` / `TO-BE`). A chunky filled block arrow between them. Never a line arrow. Grey out or strike through what the change removes; apply the accent hue only to what it adds.

**Prevents**: two unrelated diagrams side by side, where the reader has to find the diff.

## 6. Phase progression

**For**: three or more states over time. The generalisation of before/after.

**Recipe**: as above with N panels, identical geometry, a small italic phase tag above each (`<Phase 1>`). Accumulate rather than replace: each panel adds to the last, so the reader tracks one moving part.

**Prevents**: three diagrams that share no visual anchor.

## 7. Roll-up convergence

**For**: many things feeding one thing. Aggregation, collection, scheduling.

**Recipe**: sources as a column of small identical boxes on the left. Three plus `⋮`, never all N. Thin connectors converging on a single larger box. Keep the sources visually identical; their sameness is the point.

**Prevents**: drawing all twelve sources and running out of canvas.

## 8. Quadrant map

**For**: positioning across two continuous dimensions.

**Recipe**: two axis lines, no box frame, no gridlines. Axis labels italic grey at the ends. Items as small marks with labels on hairline leaders. Never label the quadrants themselves.

**Prevents**: the 2x2 with four tinted cells and a paragraph in each.

## 9. Whiteboard mechanism

**For**: how an algorithm or protocol actually works. The whiteboard register.

**Recipe**: sharp corners, white fills, black lines. Sequence rows showing state at each step, identical geometry per row, `⋮` for elided steps. Inline symbols (`✓`, `↺`, `→`) as compact annotations. Small multiples doing the heavy lifting.

**Prevents**: an architecture diagram pretending to explain a mechanism.

## 10. Network topology

**For**: physical or logical connectivity, fabrics, planes.

**Recipe**: coloured vertical bus-bars (5-7px) as the fabrics; nodes connect with 2px lines in the fabric's colour. Colour here encodes *fabric identity*. That is the one case where a higher hue count is legitimate. Node groups as dashed containers.

**Prevents**: a mesh of crossing lines with no organising spine.

## 11. Closed-loop control

**For**: feedback systems. Autoscaling, retries, reconciliation.

**Recipe**: a genuine cycle, laid out as a rectangle rather than a circle so connectors stay orthogonal. Label each edge with the signal it carries. Mark the setpoint or threshold with a dashed line in the accent hue. Pair with a small inline plot if the behaviour over time is the actual point.

**Prevents**: a ring of arrows where the loop's mechanism is invisible.

## 12. Oblique layer stack

Commonly called isometric, and that is what to search for, but the projection is a 45 degree cavalier oblique: the reference corpus measures `|dx/dy|` at exactly 1.0000 across all 52 slabs with no foreshortening on either axis. Building it as a true isometric, with 30 degree axes and foreshortened depth, produces a visibly different and wrong result.

**For**: one machine or one site that sits on several fabrics or planes at once, where the reader has to see both *what runs on it* and *what it is wired into*. The case that layered stack cannot take: the layers are not abstraction levels, they are simultaneous memberships, and objects rest on them.

**Recipe**: draw each plane as a 45 degree oblique slab, `M{X},{Y} l{-D},{D} h{W} l{D},{-D} z`, with W:D between 4:1 and 5:1. Stack them by pure vertical translation; paint the top slab first and the bottom slab last. Fill each with its own hue at `fill-opacity` 0.16-0.21 for a full-size slab, and outline it 2px in the same hue's dark stop, which is what keeps the stack readable where the fills blend. Three slabs maximum.

Seat objects with their base line at `y_plane_top + D/2` so the slab's depth band brackets the base, and paint every object after every plane. Cubes for workloads, the flat datastore cylinder for storage; both drawn from the neutral ramp, never coloured. **Pick the pitch from the seating, not from the look**: if objects sit on different slabs, the base line must clear every slab edge by 12px or the object reads as standing on the wrong plane. `tokens.md` gives the inequality.

Right of the stack, one 7px vertical bar per plane, in the plane's mid stop, its y-extent covering the plane it serves. One 2px connector per plane leaves the slab's slanted right edge at the same `y_plane_top + D/2` and runs dead horizontal to its bar, in the dark stop. No arrowheads: an attachment is not a flow. A connector may cross a bar of another hue, never one of its own.

**Colour is the whole encoding**: one hue per fabric, held identical across the slab fill, the slab outline, the connector, the bar and the fabric's own label. Declare `<!-- categorical: N -->` past three. Every label stays horizontal; nothing follows the 45 degree axis. Full projection constants in `tokens.md`, "The oblique plane".

**Prevents**: the decorative 3D diagram, where perspective is applied to boxes that had no depth to show. If the planes are not simultaneous and objects do not rest on them, use layered stack and stay flat.

## Choosing

| the question the slide asks | archetype |
|---|---|
| what runs where? | nested-container |
| what happens when a request arrives? | request flow |
| what sits on top of what? | layered stack |
| which should we pick? | comparison matrix |
| what changes? | before/after |
| how do we get from here to there? | phase progression |
| where does it all end up? | roll-up convergence |
| how do these compare on two axes? | quadrant map |
| how does it actually work? | whiteboard mechanism |
| what connects to what, physically? | network topology |
| how does it self-correct? | closed-loop control |
| what is one node wired into at once? | oblique layer stack |

## When nothing fits

The twelve above are what the reference corpus happened to contain. They are not a ceiling.

If the slide's question isn't in the table, **say so explicitly**. Do not silently bend the content into the nearest archetype. Forcing a mechanism into a request-flow shape produces a worse diagram than admitting the shape is new.

When nothing fits:

1. **Say which archetypes you considered and why each fails.** One line each. This is the check against lazily declaring novelty to avoid the discipline.
2. **Confirm it still needs a diagram at all.** Not fitting an archetype is weak evidence that the content is prose. Re-run Gate 0.
3. **Compose from the shared conventions anyway.** Every rule in `tokens.md` still binds: canvas, type scale, colour budget, one-variable encoding, connector semantics, text budget, emission order. A new archetype is a new *composition*, never a licence for new styling.
4. **Design the layout deliberately** and write down its recipe as you go: what goes where, what the reading order is, what carries the meaning.

### Harvesting a new archetype

If the composition worked and the underlying question is one that will recur, add it here. That is how this file grows: extracted from real work, not invented up front.

Add it when **both** hold:
- The diagram passed the grader
- The question it answers is general, not specific to one deck. *"How does a request traverse the system?"* generalises. *"What did we ship in Q3?"* does not.

Write the entry in the same shape as the twelve above: **what it is for**, **the layout recipe**, **the failure mode it prevents**. Add a row to the selection table. Keep the description free of the deck's subject matter. Describe the *shape*, never the content that occasioned it. If it is worth an exemplar, author one on invented generic content and add it to `exemplars/`.

Deliberately do not add an entry for a one-off. A registry of thirty archetypes where nine recur is worse than twelve that all earn their place.

## Inline plots

Several archetypes benefit from a small embedded chart. Keep it minimal: two axis lines, no box frame, **no gridlines**, one or two data lines, a dashed accent line for any threshold, axis labels italic grey at the ends. Label data series in place at the end of the line rather than in a legend. Do not add tick marks unless a reader needs to read values off them.
