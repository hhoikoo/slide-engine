---
name: deck-polish
description: Phase 5 of the deck pipeline. Fine-tunes the built deck against what it actually renders as, using /inspect for perception and make watch for the live loop. Usage: /deck-polish [pNNN]
argument-hint: "[pNNN]"
---

@docs/deck-lifecycle.md

# Deck polish

Phase 5. The deck is complete and the question is now what it looks like. Density, spacing, splits, image sizing.

Terminal phase. There is no derivable done marker, and `deck-status.sh` says so rather than inventing one. It ends when the author says it ends.

## Input

`$ARGUMENTS` is the deck, as `pNNN` or a name from `presentations/index.md`. With none, use the deck from earlier in this conversation. With neither, ask.

## Precondition

```bash
engine/scripts/deck-status.sh --porcelain pNNN
```

`phase_num=4` is one below: proceed. Anything lower: refuse and print the command from `next=`. `phase=legacy`: refuse.

There is no "at or above" case here, because phase 5 never completes. Re-running is the normal way to use this skill.

## Both channels run

**Your perception is `/inspect`.** Build, render PNGs at 2x, read them, report per slide. You cannot see the deck any other way, and reasoning about layout from markdown is how a slide ships with text running off the bottom.

**The author's is `make watch`.**

```bash
make watch DIR=presentations/pNNN THEME=bai-flat
```

An fswatch loop over `sections/`, `images/` and `draft/mocks/`, re-running `make mocks` then `make html`, so the browser shows the change on refresh. Suggest it at the start of the session and leave it to the author to run; it does not terminate.

`draft/mocks/` is in the watch set on purpose: without it a hand-edit in the Excalidraw editor leaves the deck rendering a stale export. `output/` and `slides.md` are out of it on purpose too: the build writes both inside the deck directory, so watching them retriggers forever.

## Work

Fine-tuning, slide by slide, against the render:

- **Density.** A slide the linter's counters flag and the render confirms is overfull. Split it, or cut.
- **Spacing and overflow.** Auto-shrink is a safety net, not a layout. A slide that only fits because it shrank to 65% is a slide to split.
- **Image sizing.** A figure that reads at 1400px and not at slide scale needs a simpler figure, not a bigger box.
- **Splits.** A two-column slide whose columns have very different density is two slides.
- **The slot classes.** `figure-center` and `diagram-top` are the two figure slots; check the chosen one against what actually rendered.

Phase 2 already made the structural calls, so most of this is adjustment. You stay authorized to make a structural change where the rendered result demands one or the author asks for one; when you do, say so rather than folding it into a spacing tweak.

A slide split here needs no new slide ID. Markers are advisory after phase 2.

## What does not happen here

- No new claims, no new figures, no new sections. Content questions go back to `/deck-plan` or `/deck-draft`.
- No voice pass. That is `/revise`, and its change-rate gates are fully active at this phase.
- No touching another deck.

Uncertainty raised here goes under `## Open` in `draft/decisions.md`, which is the one part of `draft/` still live at this point.

## Report

Per slide changed: what the render showed, what you changed, whether it was structural. Never name the deck's subject matter in anything that could land in a commit message. See CLAUDE.md, Privacy.

$ARGUMENTS
