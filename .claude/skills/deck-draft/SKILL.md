---
name: deck-draft
description: Phase 2 of the deck pipeline. Writes sections/NN.md from draft/outline.md, including every structural layout decision, then runs the de-slop loop until the gate passes. Usage: /deck-draft [pNNN]
argument-hint: "[pNNN]"
---

@docs/deck-lifecycle.md

# Deck draft

Phase 2. The outline becomes slides. One session, hands-on, because this is where the deck's voice gets steered and a deck is 6 to 11 section files, not 40.

## Input

`$ARGUMENTS` is the deck, as `pNNN` or a name from `presentations/index.md`. With none, use the deck from earlier in this conversation. With neither, ask.

## Precondition

```bash
engine/scripts/deck-status.sh --porcelain pNNN
```

This is phase 2. `phase_num=1` is one below: proceed. `phase_num` of 2 or more means sections already exist; name them and ask before rewriting. `phase_num=0`: refuse and print `/deck-plan pNNN`. `phase=legacy`: refuse.

## Read first

- `presentations/pNNN/draft/outline.md`: the content. Every slide comes from an entry here.
- `presentations/pNNN/draft/decisions.md`: `language:` picks the writing rule file, `header:` goes into `sections/00.md` verbatim.
- `presentations/pNNN/draft/figures.md`: which `fNN` serves which slide, and whether each is `diagram` or `fetched`.
- `docs/guide.md`: the layout classes. Do not invent one, and do not author CSS to get a layout that already exists.
- `.claude/rules/writing-core.md`, then `writing-ko.md` or `writing-en.md` for the deck's language, then `writing-shortform.md` if the deck carries figures or tables.

## Work

### 1. Write the section files

`sections/00.md` first: the frontmatter, with `header:` copied verbatim from `decisions.md`. Rewrite it from `decisions.md` on every run so the two cannot drift. A deck-specific `<style>` block belongs here too, and only when the look is genuinely deck-specific; a layout that exists in the theme is not.

Then `sections/01.md` onward, in outline order. Multiple slides per file, separated by `---`.

Every slide opens with its marker:

```markdown
<!-- _slide: 1.2 -->
<!-- _class: two-col -->

## Slide title
```

The marker carries the outline's slide ID verbatim. `assemble-sections.sh` strips it before Marp sees the file, so `_class` stays the first directive Marp reads.

### 2. Make every structural call here

Phase 2 owns **all** structural layout, not just the obvious ones:

- `title`, `toc`, `divider`, `appendix`, and the body layouts (`two-col`, `three-col`, `highlight-boxes`, `timeline`, `focus`, `four-box`, `big-numbers`).
- The figure slot class, `figure-center` or `diagram-top`. This is not cosmetic: phase 4 reads the slot class to know its scale budget before it draws. A figure with no slot decided is a figure drawn to no size.
- Two-column structure, including which column carries which half.

Structure follows from the outline, so it is an inventory decision, not a rendering one. Phase 5 adjusts; it does not decide.

### 3. Point figure slots at the right path

- `kind: diagram`: `![alt](images/mocks/fNN.svg)`. The file does not exist yet and the image renders broken until phase 3. That is correct and expected.
- `kind: fetched`: `![alt](images/figures/fNN)`. No extension; `/fetch-image` resolves it in phase 4.

Alt text is a noun phrase naming what the figure shows, never "a diagram showing" (`writing-shortform.md`).

### 4. De-slop

Loop until the gate passes:

```bash
engine/scripts/lint-text.sh presentations/pNNN
```

Then one `slop-grader` pass per section file, told the deck's language and phase and nothing else. Then apply through `/revise`, which knows this phase's rules.

### 5. Citations

If the deck cites research, every claim that came from a research doc carries `<sup>[research:{id}]</sup>` where it is made. Then:

```bash
node engine/scripts/generate-citation-map.js presentations/pNNN
```

It assigns numbers by first appearance, rewrites the markers in place, writes `research/citation-map.md`, and generates `sections/NN-references.md`, splitting into further slides above 12 entries. It is safe to re-run: numbers already assigned are recovered from the citation map and kept.

A trailing "출처" slide naming where the whole deck came from is not a citation. Cite the specific claim where you make it.

## Gate

```bash
engine/scripts/lint-text.sh --gate presentations/pNNN
```

Exit non-zero on provenance, punctuation and SVG-label classes only. Those are decidable by a machine and every hit is a defect.

Every other class reports as a count for you and the grader to judge. Hard-gating a judgement class is what makes a model delete real content to get a green light, so do not treat a KO or EN warning count as a number to drive to zero. Read the line, decide, move on.

## Change-rate gates

`/revise`'s 30% and 50% change-rate gates are **suspended** inside this phase. They exist to stop a model rewriting a human's voice out of a deck, and at this point the text is model-written and minutes old. Tell `/revise` it is running from phase 2.

They stay fully active for a standalone `/revise` and for phases 3 through 5.

## Done when

- Every slide ID in `outline.md` has a matching marker in `sections/`.
- `make html DIR=presentations/pNNN` succeeds.
- `lint-text.sh --gate` exits 0.

`outline.md` is frozen at this gate. Markers are advisory from here on: a slide phase 5 splits needs no new ID.

## Author gate

The checks above say the sections are well formed. Whether the deck says the right thing is a judgement only the author makes, so the phase does not close on a green linter.

Summarize what you wrote, slide count and the layout class chosen for each non-default slide, then call `AskUserQuestion` and stop. Ask whether the section text and the structural calls hold, with options for accepting them, naming slides to rewrite, and changing a layout choice. Print the next command after the answer.

Each phase is its own session so the author reads the output cold. A session that runs on into phase 3 has skipped that reading however clean the artifacts are, which is why the stop is a tool call and not a line of prose.

Print the next command:

```
Phase 2 done. Next: /deck-mock pNNN
```

## Content bar

Less is more, on both surfaces.

**Speaker notes: none by default.** A note exists only for something that genuinely cannot be slide content or a figure and still has to be said aloud. When one exists it is bullet fragments, never connected prose. Genuine uncertainty is a licensed reason for a note.

Notes used to carry weight for two reasons: slop filling space, and no grounding document holding the deck's full content. `draft/outline.md` is that document now.

**Slide bodies: no walls of text.** Same bar, same reason. The linter's density counters report and never gate; the judgement is yours.

## Privacy

Never name the deck's subject in anything that could land in a commit message. See CLAUDE.md, Privacy.

$ARGUMENTS
