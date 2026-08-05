---
name: deck-plan
description: Phase 1 of the deck pipeline. Scaffolds a new deck or re-enters an existing one, then produces the grounding artifacts every later phase reads: synopsis.md, draft/outline.md, draft/decisions.md, draft/figures.md. Usage: /deck-plan <topic | pNNN>
argument-hint: "<topic | pNNN>"
---

@docs/deck-lifecycle.md

# Deck plan

Phase 1. Nothing downstream can be recovered from a session's memory, so this phase writes the deck's whole plan to disk: what it says, in what order, which figure carries which slide, and which choices are already settled.

This is a hands-on phase. It ends when the author agrees the plan holds, not when the files exist.

## Input

`$ARGUMENTS` is either:

- A **topic string**. Allocate a new deck: next free `pNNN`, scaffold the folder, append the `presentations/index.md` row.
- An **existing `pNNN`**. Re-enter that deck and continue planning it.

With neither, ask which.

## Precondition

This is phase 1. On an existing deck, before anything else:

```bash
engine/scripts/deck-status.sh --porcelain pNNN
```

`phase_num=0` is one below: proceed. `phase_num` of 1 or more means this deck already has a plan; name what exists and ask before rewriting it. `phase=legacy`: refuse, and say the deck predates the pipeline. The full rule is in `docs/deck-lifecycle.md`, Preconditions.

A new deck skips this: there is nothing on disk to read yet.

## Scaffold (new deck only)

1. Read `presentations/index.md`. The next ID is the highest `pNNN` plus one, zero-padded to three digits.
2. Create `presentations/pNNN/draft/` and `presentations/pNNN/research/`.
3. Append the index row: `| pNNN | YYYY-MM-<slug> | YYYY-MM |`. The slug is a short human-readable name; `index.md` is encrypted, so it may name the topic. Nothing else outside `presentations/` may.
4. Do not create `sections/`, `slides.md` or `output/`. Phase 2 writes the first, and the other two are build artifacts.

## Work

### 1. Sketch first, with no research

Write the rough shape from what is already in this conversation: the spine, the sections, roughly what each one covers. Do not search anything yet.

The point is to make the gaps visible. A sketch composed after research hides which parts were guessed.

### 2. Name every gap

List them explicitly. Every assumption, every number you do not have a source for, every "the audience probably knows X", every claim you believe but cannot cite. Decide per gap which of these resolves it:

- `codebase-researcher`, when the answer is in a repo (this one or a named project).
- `web-researcher`, when the answer is published.
- `/research <source>`, when the source is a specific document worth keeping in `research/`.
- The author, when it is a judgement only they can make.

A gap you paper over here becomes a confident wrong sentence on a slide. `writing-core.md`'s honesty bar is not negotiable at plan time either.

### 3. Dispatch research in parallel

Launch `codebase-researcher` and `web-researcher` instances in a single message, one focused question each. They return findings with citations; fold those into the plan and keep the citation with the claim.

Findings worth keeping past this session go into `research/rNN.md` via `/research`, which is what `<sup>[research:{id}]</sup>` markers later point at.

### 4. Compose the four artifacts

Their schemas are in `docs/deck-lifecycle.md`, imported above. Write them in this order, because each one constrains the next:

1. `synopsis.md`: the durable brief. Topic, audience, what the deck is for, the spine. Connected prose, not bullets.
2. `draft/decisions.md`: frontmatter first (`language`, `header`, `target_minutes`, `slide_budget`), then the numbered log of what is already settled and why, then `## Open`.
3. `draft/figures.md`: allocate every `fNN` the deck will need. This file is the only allocator; nothing else invents a figure name.
4. `draft/outline.md`: the slide inventory. One entry per slide, in presentation order, each with a slide ID and cue-level `content`.

Ask the author for `header:` if it is not already known. It is the event name, never the deck topic (`writing-shortform.md`).

`slide_budget` is a sanity check on the plan, never a target to generate against. If the outline lands well under it, that is the material being what it is; rule 12 governs.

### 5. Loop with the author

Follow the `grill` interview protocol: discovery pass, triage what research can answer, batch the rest to the author through `AskUserQuestion` in dependency order with a recommendation on every question. Record each answer as a numbered entry in `decisions.md`. Anything still unresolved goes under `## Open`.

Do not close the phase on a plan the author has not pushed back on at least once.

### 6. Grade the outline

`outline.md` carries the deck's full cue-level content, so slop caught here costs one file and slop caught after transcription costs forty.

```bash
engine/scripts/lint-text.sh presentations/pNNN/draft/outline.md
```

Then one `slop-grader` pass over it. Apply what the grader is right about; a grader finding is a reason to reread the line, not an order to change it.

One round. If the grader comes back with a long list, that is a signal about the plan, not a reason for a second automated pass.

## Done when

- All four artifacts exist.
- Every `outline.md` entry has a slide ID, and every non-divider entry has `content`.
- Every `figure:` reference names an `fNN` allocated in `figures.md`.
- `outline.md` has passed the linter and one grader round.
- The author has agreed the plan holds.

Print the next command:

```
Phase 1 done. Next: /deck-draft pNNN
```

## Voice

`synopsis.md` and `draft/outline.md` are connected prose under `presentations/`, so `writing-core.md` applies to every word, and the long-sentence rule (13) is anchored here now that speaker notes are fragments. Read `writing-ko.md` or `writing-en.md` for the deck's language before writing either file; do not work from memory.

`content` lines in `outline.md` are cues, not slide copy. One line per on-slide beat, naming the actual number or mechanism. A cue that could front any deck on any topic is not a cue.

## Privacy

Everything this phase writes lives under `presentations/`, which is encrypted, so it may name the topic freely. The `pNNN` id, and nothing else, is what leaves that folder. See CLAUDE.md, Privacy.

$ARGUMENTS
