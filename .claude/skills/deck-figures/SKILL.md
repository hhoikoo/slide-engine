---
name: deck-figures
description: Phase 4 of the deck pipeline. Turns every mock into a real figure through one agent per figure, fetches the fetched ones, repoints the slides and generates INDEX.md. Usage: /deck-figures [pNNN]
argument-hint: "[pNNN]"
---

@docs/deck-lifecycle.md

# Deck figures

Phase 4. Every reserved `fNN` becomes a real file. Diagrams go through one agent each, fetched images through `/fetch-image`, and the slides stop pointing at mocks.

## Input

`$ARGUMENTS` is the deck, as `pNNN` or a name from `presentations/index.md`. With none, use the deck from earlier in this conversation. With neither, ask.

## Precondition

```bash
engine/scripts/deck-status.sh --porcelain pNNN
```

This is phase 4. `phase_num=3` is one below: proceed. `phase_num=4` means figures already exist; name them and ask before redrawing. Anything lower: refuse and print the command from `next=`. `phase=legacy`: refuse.

## Open with the state

Print one row per `fNN` in `draft/figures.md` before dispatching anything: name, kind, archetype, the slides it serves, and whether it is unplanned, mocked, or built. The registry carries no status column because all three states are derivable, and this is where they get derived.

Skip anything already built unless the user asks for a redraw.

## Diagram figures

### Build the payload

For each `kind: diagram` row, the payload is the mock's **text projection**, not a rendered image:

```bash
node engine/scripts/mock-project.js presentations/pNNN/draft/mocks/fNN.excalidraw --payload
```

It comes back at well under a kilobyte and carries strictly more than a picture would: exact coordinates instead of eyeballed placement, `dashed` versus `dotted` as explicit tokens rather than a visual discrimination that renders differently per exporter, and brief text verbatim. It is also more faithful to what a mock means. A picture is the most traceable thing you can hand someone, which fights the anti-instruction directly.

**Rasterize nothing in this phase.** On the live test neither figure agent asked for an image.

The payload opens with a rule header, emitted by the script rather than written by you. Each rule answers something a figure agent got wrong or had to guess on the first real run:

- **Solid binds position, not extent.** A sketched region is routinely smaller than the real component. One agent's ingress stack needed roughly 200px of height for a label band plus three boxes where the mock allotted 94.
- **Dashed is a brief.** Read it, pick from the component library, draw the real object. Do not trace the sketch.
- **Dotted is read but never drawn.** "Not drawn" is not "not read": authors write "keep this box neutral" into a dotted box and expect it honoured.
- **A free-floating label belongs to no stroke class**, so it is an author note too.
- **The mock canvas is a proportion, not a viewBox.** Rescale to the house canvas.
- **Label text is a brief, not binding copy.** Mock labels arrive in the author's register and need rewriting into house register.

The script also splits out any note it cannot resolve on its own into an `UNRESOLVED, RAISE TO THE USER` block: a question mark, a request for a confirmation, or a hedge (`maybe`, `consider`, `not sure`), on a dotted box or on a free label. Read that block yourself before dispatching. If you can resolve an item from `decisions.md` or the slide, resolve it; otherwise it goes to the user with the VETOs at the end.

### Dispatch

One `figure-author` agent per figure. Each prompt carries:

- `deck`: the deck directory
- `name`: the reserved `fNN`, with **do not allocate**
- `goal`: one sentence on what the figure must communicate
- `archetype`: from the `figures.md` row
- `slot`: the slide's figure slot class, which is the figure's scale budget
- the payload from `mock-project.js --payload`

Write the goal sentence carefully. It is the only constraint the grader sees, so anything wrong in it comes back as a defect on a correct figure. State what the figure must communicate at the cardinality it actually uses, and leave every styling decision out.

**Four figures per batch.** Each figure agent spawns graders of its own, so an unbounded fan-out nests badly. Print a table after every batch: `fNN | RESULT | rounds | file or reason`.

**Never give the agent the mock as context for grading.** The `diagram-grader` never sees a mock. Its value is arriving without the drafting context, and a mock is drafting context.

## Fetched images

`kind: fetched` rows do not go through an agent. Run `/fetch-image` for each, constrained to its reserved `fNN`. The extension is resolved at fetch time, and `/fetch-image` fixes the slide's extensionless reference.

A fetch that fails is one visible broken image, not a phase-wide regression. Report it and move on.

## Repoint the slides

Once the batches are done, rewrite each `kind: diagram` reference in `sections/`:

```
images/mocks/fNN.svg  ->  images/figures/fNN.svg
```

This is a path swap and nothing else. It touches `kind: diagram` rows only, which is what keeps it mechanical. Do not rewrite a reference whose figure came back `VETO` or `FAILED`; leaving it pointing at the mock is the honest state, and it keeps `deck-status.sh` reporting the phase as unfinished.

## Surface the vetoes

**After the last batch, before anything else is called done.** Every `VETO` goes to the user with its reason, and so does every unresolved note.

A Gate 0 veto means the diagram skill refused to draw because the figure carries no structure that prose cannot. That is a real finding about the plan, not a failure to route around. Nothing gets silently rewritten, and no figure gets drawn anyway to fill the slot.

## Generate INDEX.md

Last. Write `images/figures/INDEX.md` from `draft/figures.md`, in the three-column shape:

```markdown
| File | Status | Description |
|---|---|---|
| `f00.svg` | built | the read path from client to cache tier |
| `f01.png` | built | vendor block diagram from the product page |
```

It is generated, never appended to. `/diagram` and `/fetch-image` no longer touch it, which is why it can be regenerated wholesale without losing anything.

## Done when

- No `images/mocks/` reference remains in `sections/`.
- Every referenced image file exists.
- `images/figures/INDEX.md` has been generated from `figures.md`.

Rebuild and look at it: `make html DIR=presentations/pNNN`.

Print the next command:

```
Phase 4 done. Next: /deck-polish pNNN
```

## Privacy

The `fNN` and the deck id are the only things that leave the encrypted tree. Figure descriptions live in `figures.md` and `INDEX.md`, both encrypted. See CLAUDE.md, Privacy.

$ARGUMENTS
