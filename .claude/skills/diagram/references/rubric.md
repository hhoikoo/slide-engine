# Diagram grading rubric

Used by the `diagram-grader` agent and by anyone reviewing a diagram by eye.

The scripts already check everything countable. This rubric covers what only a viewer can judge: whether the diagram is worth looking at.

**Grade from the rendered PNG, not the source.** Read the source only to explain a defect you already saw.

## Gate 0: does this diagram deserve to exist?

Ask before anything else. A failure here cannot be fixed by restyling.

- [ ] **Does it show structure that prose cannot carry?** Two boxes and one arrow is a sentence rendered as geometry. If the diagram could be replaced by its own caption with no loss, it should be.
- [ ] **Is there enough content?** The corpus carries 30-80 text nodes of real structure per figure. Three nodes on a full canvas is not a diagram, it is a decoration.
- [ ] **Does it reward a second look?** Good diagrams have a first read (the shape) and a second read (the detail). If everything is apparent in one glance and there is nothing underneath, the figure is thin.

**A diagram that fails Gate 0 gets rejected outright.** Say so plainly and recommend cutting the figure or merging it with a neighbour. Do not restyle a diagram that shouldn't exist. That is the single most common failure mode in the existing corpus.

## Gate 1: legibility

Any unchecked box is a blocking defect.

- [ ] No text overlaps other text
- [ ] No text is painted over by a shape (check the source emission order if unsure; text must be emitted last)
- [ ] No text sits **on** a line drawn underneath it. Emitting text last does not save a label that a cylinder's cap arc or a connector runs straight through
- [ ] No text overflows its box
- [ ] Nothing is clipped by the viewBox
- [ ] All text is readable at slide size: remember 1 SVG unit = 1 CSS px, so a 13px label is 13px on screen, and 0.566 of that in a side-by-side layout
- [ ] Arrowheads reach their targets and don't overlap box borders
- [ ] No two elements collide or overlap unintentionally

## Gate 2: the encoding

This is where AI-generated diagrams actually fail. Be strict.

- [ ] **Name the variable colour encodes, in one word.** *Ownership? Tenant? Layer? Novelty? State?* If you cannot name it, the diagram has no colour system. Colour used for "emphasis" or "making the important one stand out" is a **fail**.
- [ ] **Is each hue used for exactly one meaning, and each meaning given exactly one hue?** Look for the same colour doing two jobs, or two colours doing one job.
- [ ] **Is saturation spent on small elements?** Strokes and single words, not large fills. Saturated area should be under 20% of the canvas; typical is 5%.
- [ ] **Does shape encode anything?** If every node is the same rounded rect, the shape channel is unused. That is acceptable, but check whether a shape distinction would carry real meaning that is currently being carried by a label instead.
- [ ] **If two line weights are present, do they mean different things?** A second weight with no semantic job is noise. One uniform weight is correct and preferred.
- [ ] **Does dashing mean something specific?** Boundary, logical, telemetry, or not-taken. Decorative dashing is a fail.
- [ ] **Does nesting mean containment?** A box inside a box should be a part-of relationship, not a layout convenience.

## Gate 3: hierarchy

- [ ] **Three distinct font sizes, four maximum.** Count them in the render.
- [ ] **No two sizes within 1px of each other.** 13 vs 13.5 vs 14 is the signature of generated output; 98 of 111 existing repo figures do this.
- [ ] **Is hierarchy carried by weight, colour and italic rather than size?** The reference corpus has a title-to-body ratio of 1.18. A big-title-small-body diagram is wrong.
- [ ] **Is bold used for structural rank, not emphasis?**
- [ ] **Is italic used for roles, zones and annotations (text *about* the picture) rather than for naming components?**
- [ ] **Is size used for emphasis anywhere?** It should never be.

## Gate 4: text

- [ ] **2-4 words per label.** Count the longest.
- [ ] **Noun phrases for nodes, plain present verbs for arrows.** No gerunds as the first word.
- [ ] **No sentences.** At most one, and only as a deliberate defect or side note at the smallest size in the figure.
- [ ] **No terminal periods on fragments**
- [ ] **No in-canvas title.** The slide headline is the title. Exception: short panel labels on a genuine multi-panel comparison.
- [ ] **No caption line restating the slide**
- [ ] **No legend.** Labels belong in place, on hairline leaders.
- [ ] **All-lowercase labels.** House style, and what every exemplar does: `api gateway`, `load balancer`, `data tier`. Capitalise only proper nouns, acronyms and literal identifiers that carry their own case (`CDN`, `PostgreSQL`, `RestartPolicy`). A label that merely capitalises its first word is **not** a defect worth reporting, but Title Case is
- [ ] **No em dash, no en dash except numeric ranges, no middle dot, no emoji**
- [ ] **No vague head-nouns** doing no work: Layer, Engine, Platform, Service, Manager, Handler, Framework, Solution, Ecosystem, Module, Core, Hub. **Exception: none of these is a defect when it is part of the literal name of a real component or product** (`Redis Sentinel`, `systemd-resolved`, a Java `ServiceLoader`). Flag the word only where it is standing in for a name the author did not choose
- [ ] Korean labels: 조사 dropped, no 종결어미 in a box, compounds kept closed

## Gate 5: the AI tells

Each of these is an immediate flag.

- [ ] Left-border accent stripe on a box
- [ ] Top accent band on a box
- [ ] **Tinted rounded callout aside**: present in 71% of the existing repo figures, the single most common tic
- [ ] Gradient fill
- [ ] Drop shadow or glow
- [ ] Badge or pill chip that isn't a stadium meaning "external system"
- [ ] Emoji
- [ ] Every box a different colour
- [ ] A colour that encodes nothing
- [ ] Purple-blue gradient anywhere
- [ ] Icon-in-a-pastel-rounded-square, repeated per box
- [ ] Everything centred
- [ ] Decorative element that encodes nothing
- [ ] True grey instead of the blue-tinted neutral ramp
- [ ] Two-line bold-plus-muted text in every box (present in 48 of 111 existing figures)

## Gate 6: craft

- [ ] Consistent corner radius. One register per file: either all `rx=6` or all sharp
- [ ] One arrowhead geometry throughout
- [ ] Orthogonal routing with rounded elbows; elbow radius matches box radius
- [ ] Repeated siblings share identical width and pitch to the pixel
- [ ] Dimensions in multiples of 4
- [ ] Tight crop, ~8px margin, no dead space
- [ ] Alignment is deliberate. Things line up because they relate, not by accident
- [ ] `viewBox` is `0 0 1000 H` with H <= 560

## Scoring

Report a verdict, not a number:

| verdict | when | what to say |
|---|---|---|
| `REJECT` | fails Gate 0 | the diagram should not exist in this form. Say what to do instead |
| `BLOCK` | fails Gate 1 or Gate 2 | specific defects, each with the element and the fix |
| `REVISE` | passes 0 to 2, fails elsewhere | list every failure with its location |
| `PASS` | all gates | say so plainly, and note anything you would still improve as optional |

For every failure, give: **what** is wrong, **where** it is (coordinates or a description of the element), and **the specific fix**. "Improve visual hierarchy" is useless. "The three container labels are 13px, 13.5px and 14px; set all three to 15.56px italic `#6f7681`" is actionable.

## Calibration

Do not grade generously. The existing repo corpus would fail this rubric almost universally, and that is the correct outcome; it is why the rubric exists. A first draft passing every gate is unlikely; if you are about to return PASS on a first draft, re-read Gate 0 and Gate 2 before you do.

Equally, do not invent defects to seem rigorous. If a gate passes, say it passes. A grader that always finds something is as useless as one that never does.
