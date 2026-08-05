---
name: deck-mock
description: Phase 3 of the deck pipeline. Draws a placement-and-intent mock for every diagram figure the deck reserved, renders it into the deck, and reviews it in place. Usage: /deck-mock [pNNN]
argument-hint: "[pNNN]"
---

@docs/deck-lifecycle.md

# Deck mock

Phase 3. Every `kind: diagram` figure gets a mock: where the objects sit, and what each region is for. The mock is reviewed against the real slide text, real neighbours and the real slot class, because that is the only place a placement decision means anything.

The skill draws and proposes. Hand-editing is a first-class step, not an escape hatch.

## Input

`$ARGUMENTS` is the deck, as `pNNN` or a name from `presentations/index.md`. With none, use the deck from earlier in this conversation. With neither, ask.

## Precondition

```bash
engine/scripts/deck-status.sh --porcelain pNNN
```

This is phase 3. `phase_num=2` is one below: proceed. `phase_num` of 3 or more means mocks already exist; name them and ask before redrawing. `phase_num` of 1 or 0: refuse and print the command from `next=`. `phase=legacy`: refuse.

## What a mock is

**A placement and intent spec, never a low-fidelity draft of the picture.** Phase 4 draws the real figure from it, and a mock that looks like a small version of the answer gets traced instead of read.

Three stroke states, and they are the whole language:

| Border | Meaning | What phase 4 does |
|---|---|---|
| solid | literal: this box is drawn, here, at this size, with this label | places it, does not re-decide |
| dashed | a brief: the box reserves a region, its text says what belongs there | reads the brief, picks from the component library, draws the real object |
| dotted | author note | not drawn at all, but read and acted on |

Arrows split the same way. Between two solid boxes an arrow is literal. Touching a dashed region it means "connects here, resolve the geometry when you draw it".

A free-floating label belongs to no stroke class, so it is an author note.

## Rules that decide whether the figure comes out good

**Write briefs loose and boxes sparse.** This is measured, not a preference. Two mocks went through the same pipeline: the looser brief produced a 24-node figure that passed its grader, and the mock that pinned down four boxes produced a 9-node figure the grader called thin. Over-specifying leaves the figure author nothing to build, and it will not invent content to pad the result.

A mock's job is to fix placement and name the object. It never enumerates the object's contents.

**Name components, not free prose.** A brief resolves to a known part when it names one from `.claude/skills/diagram/references/`. Read `archetypes.md` for the figure's archetype (already chosen in `figures.md`) and the `components.md` entries the brief will name; do not read either file end to end.

A good brief: `c-bus-bar: three vertical spines, colour = tenant, left edge fans into the ingress stack`. A bad one: `the network layer`.

**Name the variable colour encodes, once, and check it covers every element.** "colour = tenant" broke live on a fourth spine that had no tenant, and two agents resolved it differently: one went neutral, the other spent a fourth hue and quietly redefined the variable. If one element falls outside the encoding, either the encoding is wrong or that element does not belong.

**Author on the house canvas.** 1000 wide, at most 560 tall, from `tokens.md`. `mock-compile.js` enforces the cap and warns on the width. An 820x460 mock forces the figure author to rescale every coordinate, at which point "solid is binding" means nothing, and 460 scaled to house width lands at 561, one pixel over the cap.

**Notes that need a human are escalated, not written into the mock as hedges.** `mock-project.js --payload` splits any note carrying a question mark, a request for a confirmation, or a hedge (`maybe`, `consider`, `not sure`) into an `UNRESOLVED, RAISE TO THE USER` block, on a dotted box and on a free label alike, because a hedged note can otherwise instruct the figure agent to contradict the goal it is graded against. That happened live: "maybe add another ingress stack" conflicted with a goal naming a shared ingress stack. Better to resolve it here.

## Work

For each `kind: diagram` row in `draft/figures.md` that has no mock yet:

### 1. Write a spec

The spec is a write-time projection. It is not committed and it is not the source of truth.

```yaml
name: f03
canvas: [1000, 500]
boxes:
  - id: ingress
    at: [60, 120]
    size: [180, 90]
    stroke: solid
    label: Ingress stack
  - id: spine
    at: [420, 90]
    size: [260, 340]
    stroke: dashed
    label: "c-bus-bar: three vertical spines, colour = tenant"
arrows:
  - from: ingress
    to: spine
labels:
  - at: [60, 40]
    text: keep the right edge clear for the callout
```

Read the slide the figure serves before placing anything. The slot class decides the shape: `figure-center` gets the full content height, `diagram-top` gets 60% of it and wants a wide, low figure.

### 2. Compile and export

```bash
node engine/scripts/mock-compile.js /tmp/fNN.yaml presentations/pNNN/draft/mocks/fNN.excalidraw
make mocks DIR=presentations/pNNN
```

`mock-compile.js` generates every boilerplate key and both halves of every binding, so a container/label or arrow/box pair cannot half-break. Act on its warnings: an out-of-canvas element widens the export and changes the figure's aspect ratio, and an arrow with no shaft means two boxes are nearly touching.

### 3. Review it in the deck

```bash
make html DIR=presentations/pNNN
```

The deck now renders mocks in place. Look at the slide, not the mock. Wrong size against the real text, colliding with the real neighbour, or a region that turns out to have nothing to say are all things only visible here.

### 4. Change it

Two ways, and neither is editing the JSON.

**By hand**: open `draft/mocks/fNN.excalidraw` in VS Code with the `pomdtr.excalidraw-editor` custom editor. It opens straight from the repo, no container, no browser, no upload. Then re-run `make mocks`.

**By script**: re-derive the spec from the **current** file, edit that, recompile.

```bash
node engine/scripts/mock-project.js presentations/pNNN/draft/mocks/fNN.excalidraw --spec > /tmp/fNN.yaml
```

**Nobody hand-edits the JSON, not the author and not the model.** Bindings are maintained by the editor and by the compiler, not by whoever last changed a coordinate. Editing coordinates directly leaves bound labels and arrows pointing at where things used to be; this was reproduced (an arrow overshot its moved target, a label fell onto its box border) and the spec round trip repaired both.

To read a mock without opening the JSON, project it:

```bash
node engine/scripts/mock-project.js presentations/pNNN/draft/mocks/fNN.excalidraw
```

A hand edit measured 84 added lines of raw JSON, of which the semantic diff extracted 2. Excalidraw rewrites `version`, `versionNonce` and `updated` on every element it touches, so the projection is what makes a mock reviewable at all.

## Done when

Every `kind: diagram` row in `draft/figures.md` has both `draft/mocks/fNN.excalidraw` and `images/mocks/fNN.svg`, and the deck builds with every mock in place.

`kind: fetched` rows are not mocked. They go straight to `/fetch-image` in phase 4.

Print the next command:

```
Phase 3 done. Next: /deck-figures pNNN
```

## Voice

Mock labels are briefs, not shipping copy: phase 4 rewrites them into house register. They still follow `writing-shortform.md` where they name a real object, because a mock label that says `Data Processing Layer` proposes a box that says nothing.

Mocks are excluded from the linter's SVG scope on purpose: a dashed brief is prose by design and would grade as a shipped label.

$ARGUMENTS
