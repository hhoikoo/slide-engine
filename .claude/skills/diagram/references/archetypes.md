# Diagram archetypes

Thirteen compositions found in the reference corpus. Pick one before drawing anything. Most bad diagrams are bad because no archetype was chosen and boxes were placed as they came to mind.

Each entry gives what it is for, the layout recipe, and the failure mode it prevents. Read the entry you pick, not the whole set.

## The archetypes

| # | Archetype | What it is for |
|---|---|---|
| 1 | [Nested-container architecture](archetypes/nested-container-architecture.md) | what runs inside what. |
| 2 | [Request flow](archetypes/request-flow.md) | the path of one request through a system. |
| 3 | [Layered stack](archetypes/layered-stack.md) | abstraction levels. |
| 4 | [Comparison matrix](archetypes/comparison-matrix.md) | N options against M attributes. |
| 5 | [Before / after](archetypes/before-after.md) | one change, argued. |
| 6 | [Phase progression](archetypes/phase-progression.md) | three or more states over time. |
| 7 | [Roll-up convergence](archetypes/roll-up-convergence.md) | many things feeding one thing. |
| 8 | [Quadrant map](archetypes/quadrant-map.md) | positioning across two continuous dimensions. |
| 9 | [Whiteboard mechanism](archetypes/whiteboard-mechanism.md) | how an algorithm or protocol actually works. |
| 10 | [Network topology](archetypes/network-topology.md) | physical or logical connectivity, fabrics, planes. |
| 11 | [Closed-loop control](archetypes/closed-loop-control.md) | feedback systems. |
| 12 | [Oblique layer stack](archetypes/oblique-layer-stack.md) | what one node is wired into at once, drawn as stacked planes. Commonly called isometric. |
| 13 | [Paired-value scale](archetypes/paired-value-scale.md) | where each item sits on one scale and how big each gap is. Commonly called a dumbbell or lollipop chart. |

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
| where does each of these sit on one scale, and how big is each gap? | paired-value scale |

## When nothing fits

The thirteen above are what the reference corpus happened to contain. They are not a ceiling.

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

Write the entry in the same shape as the others: **what it is for**, **the layout recipe**, **the failure mode it prevents**. Add a row to the selection table. Keep the description free of the deck's subject matter. Describe the *shape*, never the content that occasioned it. If it is worth an exemplar, author one on invented generic content and add it to `exemplars/`.

Deliberately do not add an entry for a one-off. A registry of thirty archetypes where nine recur is worse than thirteen that all earn their place.

## Inline plots

Several archetypes benefit from a small embedded chart. Keep it minimal: two axis lines, no box frame, **no gridlines**, one or two data lines, a dashed accent line for any threshold, axis labels italic grey at the ends. Label data series in place at the end of the line rather than in a legend. Do not add tick marks unless a reader needs to read values off them.
