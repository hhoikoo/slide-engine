# Slide Pipeline

> Status: Planned
> Depends on: MVP, research system, writing rules, content assets
> Grilled: 2026-08-05, two passes

## Context

Deck creation today is a loose set of skills with no defined order and no persisted state between them. `/generate-slides` does planning, writing and figure marking in one pass, which means a long deck is written by a session that has already spent its context on research.

The phases already exist in practice. `presentations/p008/consolidated.md` is a hand-built plan document feeding slide generation. `presentations/p009/draft/` holds a slide-level outline, an open-questions ledger and a diagram inventory. `presentations/p010/draft/` holds per-part content drafts. Three decks, three ad-hoc versions of the same four artifacts, none of them readable by a skill.

This plan makes the order explicit, gives each phase its own skill and its own session, and puts every phase's output on disk so the next session can pick up from a cold start.

## Principles

1. State lives on disk. Each phase reconstructs where the deck is by reading committed artifacts, never by remembering.
2. One layout authority. `docs/deck-lifecycle.md` owns the per-deck folder shape and every skill `@`-imports it rather than restating it.
3. Every phase ends at a user gate. Nothing auto-advances; each skill prints the next command.
4. Each loop has a fresh-eyes grader and a cap. This is the shape `/diagram` already proves: author, mechanical lint, grader that never saw the drafting, revise.
5. One representation of everything. No parallel content document that drifts from `sections/`.
6. Every skill is scoped to the deck it was invoked for. No skill reads, checks or edits another deck.

## Deck layout

```
presentations/pNNN/
  synopsis.md                  # durable brief: topic, audience, spine
  draft/
    outline.md                 # slide inventory, order and cue-level content
    decisions.md               # numbered settled choices, machine-readable frontmatter, live Open section
    figures.md                 # figure registry and sole fNN allocator
    mocks/fNN.excalidraw       # mock source of truth, committed, hand-editable in VS Code
  research/rNN.md              # unchanged
  sections/NN.md               # slide markdown
  images/mocks/fNN.svg         # mock export, committed
  images/figures/fNN.svg       # final figure
  output/                      # gitignored
```

`draft/PLAN.md` is deliberately absent. The brief, the inventory and the decision log are three files with three jobs; a fourth document that summarizes all three is the thing that goes stale.

No **intermediate** rasterization is committed, and phase 4 rasterizes nothing at all: its payload is the text projection of the mock. Encrypted binaries do not delta-compress, so a render intermediate never enters a deck folder. Source assets are a different case and already tracked: `presentations/p002/images/figures/f00.png` is a fetched image, and the pre-rendered exemplar sheets under `.claude/skills/diagram/references/` are tooling.

## Identity

**Slide identity** is an author-assigned `<section>.<n>` string, the shape `presentations/p010/draft/part1.md` already uses. The second component is an integer, or the literal `div` for a divider and `cover` for the cover slide. It appears in `outline.md`, in a `<!-- _slide: 1.2 -->` marker in the section file, in mock element labels, and in polish notes.

It is author-assigned because a section-file index is a position, and a position is a poor name for a thing an author refers to across four phases and three artifacts. (The earlier justification, that `generate-citation-map.js` shifts every index after the file it injects, is wrong: `generate-citation-map.js:150` computes `Math.max(...sectionNums) + 1` and always appends last, shifting nothing.)

Markers are **advisory after phase 2**. `outline.md` is not maintained past the phase-2 gate, `deck-status.sh` stops matching IDs to markers past phase 2, and a slide that phase 5 splits needs no new ID. The marker's job is to let phases 2 through 5 refer to a slide by name; it is not a permanent registry.

`assemble-sections.sh` strips every `<!-- _slide: -->` line while writing `slides.md`. Marp does not ignore an unknown local directive: it folds the comment into the slide's presenter notes, so an unstripped marker gives every marked slide a phantom note reading `_slide: 1.1`, including slides that carry no note at all. Stripping at assembly fixes the HTML note pane, the PDF presenter notes and any future notes consumer at one point. It also means Marp never sees the marker, so `<!-- _class: -->` remains the first line Marp reads and the `marp-authoring.md` placement rule holds unchanged.

**Figure identity** is `fNN`, allocated in `draft/figures.md`. The extension is not allocated, because a fetched image's type is unknown until it is fetched.

**Path progression** carries a `kind: diagram` figure through the phases:

| Phase | Slide markdown points at | File on disk |
|---|---|---|
| 2 | `images/mocks/fNN.svg` | nothing yet, image is broken |
| 3 | `images/mocks/fNN.svg` | mock export lands, deck renders |
| 4 | `images/figures/fNN.svg` | real figure lands, one mechanical rewrite |

`kind: fetched` rows stay out of this progression entirely. Phase 2 points them straight at `images/figures/fNN`, and `/fetch-image` resolves the extension in phase 4. That keeps phase 4's rewrite genuinely mechanical, since it only ever touches `kind: diagram` rows, and it makes a failed fetch one visible broken image instead of a phase-wide status regression.

Phase 4's rewrite is a path swap, not a content decision. It also gives `deck-status.sh` its cleanest signal: phase 4 is done when no `images/mocks/` reference remains in `sections/`.

## Phases

### 1. `/deck-plan <topic | pNNN>`

Absorbs `/new-presentation`: with a topic it allocates the next ID, scaffolds the folder and appends the `presentations/index.md` row, the way autocode's `design-plan` allocates its own id.

Work: rough sketch from conversation context first, with no research, so gaps are visible. Then an explicit gap list, every assumption and every unknown named. Then parallel dispatch of `codebase-researcher` and `web-researcher`, one focused question each. Then compose. Then loop with the user until the plan holds, using the `grill` interview protocol for anything only the author can answer.

Output: `synopsis.md`, `draft/outline.md`, `draft/decisions.md`, `draft/figures.md`.

`outline.md` carries the deck's full cue-level content, so it is the one `draft/` file inside the default lint scope and it gets one `slop-grader` pass before the phase closes. Catching slop in the grounding document costs one file; catching it after transcription costs forty.

Done when: all four exist, every outline entry has a slide ID, and `outline.md` has passed the linter and one grader round.

### 2. `/deck-draft [pNNN]`

Single session, hands-on. Decks run 6 to 11 section files, not 40, and this is the phase where voice gets steered.

Work: write `sections/NN.md` directly, including **all structural layout**: `title`, `toc`, `divider`, the figure-slot class, and two-column structure. Structure is an inventory decision that follows from `outline.md`, and phase 4 needs the slot class to know its scale budget before it draws. Every slide opens with its `<!-- _slide: X.Y -->` marker. Figure slots point at `images/mocks/fNN.svg` for diagrams and `images/figures/fNN` for fetched images. `/deck-draft` writes `decisions.md`'s `header:` verbatim into `sections/00.md`.

Then the de-slop loop: `lint-text.sh`, then the `slop-grader` agent per section file, then `/revise` to apply. Then `generate-citation-map.js` if the deck cites research.

Gate: `lint-text.sh --gate` hard-fails on provenance and punctuation only. Every other class reports as a count for the grader and the author to judge. A hard gate on judgement classes turns into the model deleting real content to get a green light.

`/revise`'s 30% and 50% change-rate gates are suspended inside this phase. They exist to stop a model rewriting a human's voice out of a deck, and at this point the text is model-written and minutes old. They stay fully active for standalone `/revise` and for phases 3 to 5.

Done when: every slide ID in `outline.md` has a matching marker in `sections/`, the build succeeds, and the gate passes. `outline.md` is frozen at this gate.

### 3. `/deck-mock [pNNN]`

The skill draws and proposes. Hand-editing at excalidraw.com is an escape hatch, not the path.

A mock is a placement and intent spec, never a low-fidelity draft of the picture. Three stroke states:

| Border | Meaning | What phase 4 does |
|---|---|---|
| solid | literal: this box is drawn, here, at this size, with this label | places it, does not re-decide |
| dashed | a brief: the box reserves a region, its text describes what belongs there | reads the brief, picks from the component library, draws the real object |
| dotted | author note | not drawn at all |

Arrows follow the same split. Between two solid boxes an arrow is literal; touching a dashed region it means "connects here, resolve the geometry when you draw it".

Briefs name components and archetypes from `.claude/skills/diagram/references/`, so a brief resolves to a known part instead of to free prose. A network spine becomes `c-bus-bar: three vertical spines, colour = tenant, left edge fans into the ingress stack`.

**Write briefs loose and boxes sparse.** The live test ran two mocks through the same pipeline: the looser brief produced a 24-node figure that passed, the mock that pinned down four boxes produced a 9-node figure its grader called thin. Over-specifying leaves the figure author nothing to build, and it will not invent content to pad the result. A mock's job is to fix placement and name the object, never to enumerate the object's contents.

Name the variable colour encodes, once, and make sure it covers every element. "colour = tenant" broke on a fourth spine that had no tenant, and the two agents resolved it differently: one went neutral, the other spent a fourth hue and quietly redefined the variable.

Mocks are authored on the **house canvas** from `tokens.md`, 1000 wide and at most 560 tall. `mock-compile.js` enforces it. An 820x460 mock forces the figure author to rescale every coordinate, at which point "solid is binding" means nothing, and 460 scaled to house width lands at 561, one pixel over the cap.

Output: `draft/mocks/fNN.excalidraw` plus `images/mocks/fNN.svg`. The deck now renders mocks in place, so placement is reviewed against real slide text, real neighbours and the real slot class.

Done when: every `kind: diagram` row in `figures.md` has both files.

### 4. `/deck-figures [pNNN]`

One thin agent per figure, whose instruction is to invoke `/diagram` with a grounding payload. The diagram method is not duplicated anywhere.

Agent frontmatter carries `tools` including `Skill` and `Agent`. `Agent` is load-bearing: `/diagram` dispatches `diagram-grader` itself, so omitting it silently breaks the grading loop.

**The payload is the text projection, not a rendered image.** `mock-project.js --payload` emits 684 bytes for a real mock, against roughly 1.1 to 1.6k tokens for a PNG, and it carries strictly more: exact coordinates instead of eyeballed placement, `dashed` versus `dotted` as explicit tokens rather than a visual discrimination that renders differently per exporter, and brief text verbatim. It is also more faithful to what a mock means. A picture is the most traceable thing you can hand someone, which fights the anti-instruction directly.

Phase 4 therefore rasterizes nothing. On the live test, neither figure agent asked for an image.

Payload: `deck`, `name` (the reserved `fNN`, with "do not allocate"), the one-sentence communicative goal, `archetype`, the slot class, the projection, and the anti-instruction:

> The mock is a spec, not a draft. Do not trace it and do not restyle it. Solid binds position and relative order, not extent. Dashed regions are briefs: read the brief, pick from the component library, draw the real object. Dotted regions are author notes: read them and act on them, never draw them.

Five rules in that header each answer something a figure agent got wrong or had to guess on the first live run, so `mock-project.js --payload` emits them rather than leaving them to the caller:

- **Solid binds position, not extent.** A sketched region is routinely smaller than the real component. One agent's ingress stack needed roughly 200px of height for a label band plus three boxes where the mock allotted 94.
- **Dotted is read but never drawn.** "Not drawn" is not "not read": authors write "keep this box neutral" into a dotted box and expect it honoured.
- **The mock canvas is a proportion, not a viewBox.** Rescale to the house canvas.
- **Label text is a brief, not binding copy.** Mock labels arrive in the author's register and need rewriting into house register.
- **A free-floating label belongs to no stroke class**, so it is an author note.

`--payload` also splits out any note phrased as a question or asking for a confirmation into an **UNRESOLVED, RAISE TO THE USER** block. A hedged note can otherwise instruct the agent to contradict the goal it is graded against, which happened live: "maybe add another ingress stack" conflicted with a goal naming a *shared* ingress stack, and the agent only declined because it happened to notice.

Return opens with a machine-readable first line, mirroring `diagram-grader.md:61`, which already established that shape:

```
RESULT: BUILT | VETO | FAILED
file: presentations/pNNN/images/figures/fNN.svg    # BUILT only
rounds: 2                                          # grader rounds used
reason: <one sentence>                             # VETO / FAILED only
```

The main session runs **4 figures per batch** and prints a table after each. A 37-figure deck is a real fan-out: each figure agent spawns graders of its own, so an unbounded dispatch nests badly.

The `diagram-grader` never sees the mock. Its value is arriving without the drafting context, and a mock is drafting context.

A Gate 0 veto, where the diagram skill refuses to draw because the figure carries no structure prose cannot, is raised to the user. Every `VETO` is surfaced after the last batch, before anything touches `sections/`. Nothing is silently rewritten.

Fetched images (`kind: fetched`) go through `/fetch-image` instead, constrained to their reserved `fNN`.

Done when: no `images/mocks/` reference remains in `sections/`, every referenced image file exists, and `images/figures/INDEX.md` has been generated from `figures.md`.

### 5. `/deck-polish [pNNN]`

Both channels run. `/inspect` is the agent's perception: build, render PNGs at 2x, read them, report per slide. `make watch` is the author's: an fswatch or entr loop over `sections/` and `images/` re-running `make html`, so the browser shows the change on refresh.

Work: fine-tuning. Density classes, spacing, splits, image sizing. Phase 2 already made the structural calls, so phase 5 is mostly adjustment, and it stays authorized to make structural changes where the rendered result demands one or the user asks for one.

Terminal phase. There is no derivable done marker, and `deck-status.sh` says so rather than inventing one.

## Content bar

Less is more, on both surfaces. This is the author's standing preference and it changes what phases 1 and 2 produce.

**Speaker notes: none by default.** A note exists only for something that genuinely cannot be slide content or a figure and still must be said aloud. When one exists it is bullet fragments, never connected prose. Genuine uncertainty is a licensed reason for a note, so `slop-grader` accepts an uncertainty marker instead of flagging it as an unjustified note.

Notes previously carried weight for two reasons. One was AI slop filling space. The other was that no grounding document held the deck's full content, so the notes became it. `draft/outline.md` is that document now.

**Slide bodies: no walls of text.** Same bar, same reason.

Enforcement is judgement, backed by counts. `lint-text.sh` gains advisory counters (words per slide body, words per note block, note blocks per deck) that report and never gate. `slop-grader` gains a named check: justify every surviving note against the bar, and flag any note written as connected prose. Density is a judgement call, and hard-gating judgement classes is what makes a model delete real content.

Shipped decks were written against the old bar. p008 carries 82 note blocks and 5,563 words of notes, p009 50 and 3,023, p010 57 and 4,318. They are not migrated. `/revise` and `slop-grader` read `deck-status.sh`, and on a `phase=legacy` deck they skip the note-register and note-density checks and report them as informational only.

## Artifact schemas

### `draft/outline.md`

Preamble paragraph, then one entry per slide in presentation order.

```markdown
## S - <section title>

### S.n - <slide title>
- content: <cue-level, one line per on-slide beat>
- source: rNN[, rNN]                 # optional
- figure: fNN                        # optional
- note: <one line for the author>    # optional
```

`S` is an integer section number. `n` is an integer, or the literal `div` or `cover`. `S.n` is the slide ID and appears verbatim in the `<!-- _slide: S.n -->` marker. `content` is required on every non-divider entry. `figure` must name an `fNN` allocated in `figures.md`; `figures.md` stays the authority on what the figure shows, and `outline.md` only points at it.

Fixed field names on their own lines make `deck-status.sh` a grep instead of a parser. `presentations/p009/draft/outline.md` is a precursor, not the spec: it has 42 entries but only 34 carry `On-slide:`, and it buries most figure references mid-line inside `Source:`.

### `draft/decisions.md`

Frontmatter, every field with a named consumer:

```yaml
---
language: ko                          # /deck-draft, /revise, slop-grader: picks writing-ko vs writing-en
header: "Lablup Seminar Day Q3 2026"  # /deck-draft writes this verbatim into sections/00.md
target_minutes: 30                    # human only, informs pacing at phase 1
slide_budget: 42                      # human only, a phase-1 sanity check
---
```

`decisions.md` is the source for `header:` and `sections/00.md` is the copy, rewritten from it on every `/deck-draft` run so the two cannot drift. `slide_budget` is a sanity check and never a generation target; `writing-core.md` rule 12 governs actual length. `language:` gives `/revise` the source it currently lacks, since `revise/SKILL.md:19` today just infers "the deck's language".

Body is a numbered log, each entry naming the choice, the rationale and the rejected alternative, plus an `## Open` section. `Open` is the one part of `draft/` that stays live past phase 2, so uncertainty raised in phases 3 through 5 has somewhere to go. `presentations/p009/draft/open-questions.md` is the precursor for both halves.

### `draft/figures.md`

The figure registry and the sole allocator of `fNN`.

| Column | Meaning |
|---|---|
| `fNN` | opaque identity, allocated here and nowhere else |
| slides | one or more slide IDs; one figure can serve several slides |
| kind | `diagram` or `fetched` |
| archetype | a name from `archetypes.md`, decided at plan or mock time |
| description | what it actually shows; safe here, the folder is encrypted |

No status column. All three states are derivable: unplanned figures have neither file, `mocked` means `images/mocks/fNN.svg` exists, `built` means `images/figures/fNN.*` exists. A hand-written status column is exactly the artifact `deck-status.sh` exists to replace, and `/deck-figures` prints per-figure state at the start of its run.

`images/figures/INDEX.md` is generated from this file at the end of phase 4, pinned to the three-column `File | Status | Description` shape `presentations/p010` already uses. `/diagram` appends a two-column row today, which is the shape that goes away.

## Writing rule changes

The content bar changes rules that live outside this plan. All three files need edits at implementation time.

| File | Change |
|---|---|
| `writing-core.md` | register table's speaker-note row rewritten to the new bar. The Korean speaker-note exemplar is rewritten with it. Line 60's "genuine uncertainty goes in the speaker notes" becomes "notes or `decisions.md` Open". The new register governs decks authored under the pipeline. |
| `writing-ko.md` | the section titled "Register: speaker notes and prose" becomes "Register: connected prose", covering `synopsis.md`, `research/`, `draft/` and repo docs, with speaker notes dropped from its list. A short note-register block replaces them. |
| `writing-en.md` | "Speaker notes are conversational; bullets are not" amended to match. |

Rule 13's long-sentence tell survives the move. It was anchored to speaker notes, and prose now lives in `synopsis.md` (already in the default lint scope) and `draft/outline.md` (added to it).

## Skills and agents

**New**: `/deck-plan`, `/deck-draft`, `/deck-mock`, `/deck-figures`, `/deck-polish`.

**Retired**: `/generate-slides` (phase 2 in one shot, would drift), `/new-presentation` (absorbed by `/deck-plan`), `/export-notes` (its output was the fat speaker notes the content bar removes; `draft/outline.md` is what you read to prepare).

**Changed**:

| Skill or agent | Change |
|---|---|
| `/diagram` | writes the `fNN` it is handed; never scans, never allocates, never appends to `INDEX.md`. Standalone invocation appends a row to `figures.md` and takes its name from there. Reference reads narrowed to the named entries. |
| standalone on a legacy deck | `/diagram` and `/fetch-image` are not `/deck-*` skills, so the refuse-on-legacy rule does not reach them. On a deck with no `draft/figures.md` they create it and seed it once from the `fNN` already in `images/figures/`, then allocate from there. Ad-hoc figure work on a shipped deck keeps working, there is still exactly one allocator, and the deck's slides and existing figures stay untouched, so it is not a retrofit. |
| `/fetch-image` | same: allocates through `figures.md`, writes the `fNN` it is handed, never scans, never appends to `INDEX.md`. It still derives the extension from the URL or `Content-Type` (`fetch-image/SKILL.md:30`), since `figures.md` reserves the name and not the type. |
| `/revise` | step 3 rewritten to mirror the gate: fix every hit in the gated classes unconditionally, treat every other class as a count to judge. A judgement-class hit is a prompt to reread the line, not an order to change it. Report before and after counts, with no target. Change-rate gates suspended when invoked from phase 2. Skips note-register checks on a `phase=legacy` deck. |
| `/inspect` | becomes phase 5's perception step; unchanged mechanically. |
| `/list-presentations` | shells out to `deck-status.sh --porcelain`. |
| `diagram-grader` | one exhaustive pass returning every defect at once, then one verify pass. Max two rounds, early exit when the first is clean. |
| `web-researcher` | gains autocode's cross-check step and a conflicts-and-caveats block. |
| `cross-project-researcher` | replaced by `codebase-researcher`, which also resolves `gh:owner/repo` by shallow clone and cites `file:line` for every claim. |

**New agents**: `slop-grader` (fresh eyes on one section file against `writing-core.md`, mirroring `diagram-grader`: `model: sonnet`, read-only, `@`-importing `concise.md` and the writing rules, verdict-first output), the thin per-figure agent for phase 4, and `section-author` (ported from autocode, unused by default, available if a deck ever wants fan-out).

**Preconditions.** Every `/deck-*` skill opens by running `deck-status.sh --porcelain` on its own deck. One phase below: proceed. At or above: name what already exists and ask before re-running. Two or more below: refuse, and print the command for the phase the deck is actually at. `phase=legacy`: refuse. Refusing on a gap while merely asking on a re-run separates "you skipped work" from "you want to redo this".

## Engine changes

| Change | Why |
|---|---|
| `engine/scripts/deck-status.sh` | derives phase state from artifacts. Default output is a human table (`ID | phase | next | blockers`); `--porcelain` prints one KEY=VALUE line per deck (`id= phase= next= slides=38/42 figures=6/9 blocked=`). Phase is the highest whose predicate holds, but a deck failing a lower predicate while satisfying a higher one reports the **lower** phase and names the gap in `blocked=`. A deck with `sections/` and no `draft/outline.md` reports `phase=legacy`. |
| `lint-text.sh --gate` | exits non-zero on `PROV-01..04`, `PUNC-01..05` and `SVG-01..04` only. Exit 0 clean, 1 gate-class hit, 2 usage. Implies `-q`. |
| `lint-text.sh` scope | the SVG find at `lint-text.sh:62` gains the path exclusions `collect_dir` already applies to markdown, plus `! -path '*/images/mocks/*'`. `collect_dir` is markdown-only today, so the SVG list is collected with no exclusions at all and mocks would be graded as shipped figures, where a dashed brief is prose by design. `draft/outline.md` gains an explicit include; the rest of `draft/` stays excluded. |
| `lint-text.sh` counters | advisory density counts: words per slide body, words per note block, note blocks per deck. Report only, never gate. |
| `assemble-sections.sh` | strips `<!-- _slide: -->` lines while writing `slides.md`. |
| `engine/scripts/mock-{compile,project}.js`, `mock-export.sh`, `make mocks` | the mock toolchain. Built and tested. `@moona3k/excalidraw-export` and `js-yaml` are in `package.json`. |
| `themes/bai-flat/theme.css` | `figure-center` and `diagram-top` promoted into the theme and documented in `docs/guide.md`. They exist today only inside `presentations/p010/sections/00.md`'s `style:` block, so phase 2 cannot pick a slot class without authoring CSS. A per-deck `style:` block stays legal for a genuinely deck-specific look. |
| `generate-citation-map.js` | keeps the `-references.md` suffix. The planned rename to plain `NN.md` would have broken idempotency: the script finds its prior output by the filename regex at `:67`, which drives three skip guards and the delete-the-stale-copy branch. The suffix leaks no topic, so the rename bought only uniformity. Separately, the script splits into multiple `_class: references` slides above roughly 12 entries; it writes one bullet per citation with no pagination today. |
| `make watch` | fswatch or entr over `sections/`, `images/` and `draft/mocks/`. Without `draft/mocks/` a hand-edit in VS Code leaves the deck rendering a stale export. Scope matters: the build writes `slides.md` and `output/` inside the deck directory, so a naive watch on the whole folder retriggers itself forever. `theme.css` is dropped from the list; `Makefile:15` wires a per-deck `theme.css` that no deck has ever had, and real per-deck CSS lives in `sections/00.md`, already covered. marp's own `--watch` cannot serve this, because it would watch the generated `slides.md` and skipping `marp-postprocess.js` yields a different artifact than ships. |

The citation path has never executed. No deck carries a `<sup>[research:N]</sup>` marker, no `research/citation-map.md` exists, and no section file carries `_class: references`. Phase 2 would be its first real run, so it gets verified against a throwaway fixture deck in a scratch directory before the pipeline depends on it. Citation coverage on a slide stays a `slop-grader` check, in line with judgement classes never hard-failing.

## Diagram loop cost

A figure currently costs a mandated read of roughly 626 lines before drawing, plus a live exemplar render, plus up to three grader rounds. `diagram-grader` is already `model: sonnet`, so the grader was never the cost. Three changes:

1. Split `components.md` (617 lines) and `archetypes.md` into an index plus per-entry sections, so an author loads only the entries its briefs name. Phase 3 already decided the archetype.
2. Pre-render the exemplar PNGs once and commit them, so the author reads an image instead of shelling out per figure.
3. Grader converges in one exhaustive pass plus one verify, instead of dribbling defects across three rounds.

## Excalidraw: settled

The spike ran. Five candidates against one hand-built reference mock carrying all three stroke styles, container-bound labels, a bound arrow and a frame.

| Candidate | Outcome |
|---|---|
| `@moona3k/excalidraw-export` | **chosen**. 4.3 MB, 8 packages, npm-only, no browser, offline, 0.054s. Matched real-Excalidraw ground truth on placement, bound-text centring and all three stroke states. |
| `excalidraw-cli` (Python) | works, emits a 46x smaller SVG, but drops frames and adds a venv to an npm-only repo. |
| `excalidraw-brute-export-cli` | Playwright driving excalidraw.com through real UI clicks. 4.67s per figure, needs network on every render, pins Excalidraw 0.15/0.17. Reference only. |
| `excalidraw_export` | eliminated: node-canvas needs a Homebrew pangocairo chain outside npm. |
| `excalidraw-to-svg` | eliminated: throws inside jsdom on modern Node; its `@excalidraw/utils@0.1.2` predates frames. |

MCP servers were considered and rejected. They are built around a live canvas the agent mutates, which puts diagram state in a running process instead of in a committed file, and cannot work in a session that only reads disk.

**Editing surface: the `pomdtr.excalidraw-editor` VS Code custom editor**, maintained under the excalidraw org. It opens `draft/mocks/fNN.excalidraw` straight from the repo, so hand-editing needs no container, no browser and no upload. Verified end to end: the file opened, all three stroke styles and the frame survived, and a hand edit round-tripped through the scripts below. Self-hosting Excalidraw was evaluated and rejected for this purpose: its boards live in browser localStorage rather than in files, so every mock would need a manual export and re-import.

This inverts the earlier phase-3 line. Hand-editing is a **first-class step**, not an escape hatch.

**Mock format: `.excalidraw` JSON is the single committed source.** A committed YAML source cannot survive bidirectional editing: the moment a human edits the drawing, the YAML it was generated from is stale and silently authoritative. YAML survives as an ephemeral projection, generated on read and never stored.

Three scripts carry it:

| Script | Job |
|---|---|
| `engine/scripts/mock-compile.js` | compact spec -> `.excalidraw`. Generates every boilerplate key and **both halves of every binding**, so a container/label or arrow/box pair cannot half-break. Enforces the house canvas and warns on out-of-canvas elements. |
| `engine/scripts/mock-project.js` | `.excalidraw` -> semantic form, `--spec` (recompilable), `--payload` (for `/diagram`). Renames Excalidraw's random ids to readable ones and splits out notes needing a human. |
| `engine/scripts/mock-export.sh` | deck-wide render to `images/mocks/`, skipping up-to-date files so it is watch-safe. `make mocks DIR=... [FORCE=1]`. |

**Nobody hand-edits the JSON, not the author and not the model.** The author edits through the real editor, which maintains bindings. The model edits by re-deriving the spec from the *current* file with `--spec`, changing the spec, and recompiling. Editing coordinates directly leaves bound labels and arrows pointing at where things used to be, which was reproduced: an arrow overshot its moved target and a label fell onto its box border, and the round trip repaired both.

Measured on the real loop: a hand edit produced **84 added lines of raw JSON, of which the semantic diff extracted 2**. Excalidraw rewrites `version`, `versionNonce` and `updated` on every element it touches, so the projection is what makes a mock reviewable at all.

## Documentation

`docs/deck-lifecycle.md` becomes the layout authority, and the overlapping text is cut from `CLAUDE.md`, `.claude/rules/marp-authoring.md`, `/diagram` and `/fetch-image`, which keep a pointer and `@`-import instead. Today the `fNN` allocation rule is stated three times.

The cut is scoped to layout text. The section-file assembly invariants and the Engine Gotchas stay in `marp-authoring.md`: the rule that `00.md` holds frontmatter only is enforced by `engine/scripts/assemble-sections.sh:16`, and after the retirements its only other surviving statement would be a shell comment. That rule gets one wording fix, from "only the YAML frontmatter block" to language that admits the `style:` payload, since `presentations/p010/sections/00.md` carries 53 lines of CSS inside it.

## Out of scope

Nothing from autocode's `impl/`, `pr/`, `issue/` or `git/` trees. No `--auto` flags, no Workflow launchers, no separate critique skill, no orchestrator skill. This is a hands-on cycle, and that machinery exists to run unattended.

Existing decks are frozen. p001 through p010 are not retrofitted, not migrated and not touched, including p009's section filenames. No skill in this pipeline reads or checks a deck other than the one it was invoked for; `phase=legacy` exists so a skill can refuse, not so it can go fix something.

## Open items

None. The Excalidraw spike is closed; see the section above.

## Implementation order

1. `docs/deck-lifecycle.md`, plus the cuts from `CLAUDE.md` and `marp-authoring.md`. The `/diagram` and `/fetch-image` cuts wait for step 7, where their replacement contract lands.
2. `lint-text.sh`: `--gate`, the scope fixes, the density counters. `assemble-sections.sh` marker stripping. The writing rule changes. Promote `figure-center` and `diagram-top` into the theme and `docs/guide.md`, ahead of the phase that picks them.
3. `/deck-plan`, `codebase-researcher`, the `web-researcher` upgrade. Retire `/new-presentation`.
4. `deck-status.sh`, written against the real artifact set the first `/deck-plan` run produces rather than against a fixture, plus the `/list-presentations` change and the precondition preambles.
5. `/deck-draft`, `slop-grader`, the `/revise` rewrite, the citation step and its fixture check. Retire `/generate-slides` and `/export-notes`.
6. `/deck-mock`. The exporter and the mock toolchain already exist, so this is the skill and its authoring guidance only.
7. `/deck-figures`, the per-figure agent, the `/diagram` and `/fetch-image` contract change, the reference split, the exemplar PNGs, the grader convergence change.
8. `/deck-polish` and `make watch`.
9. `CLAUDE.md` pipeline table.

Two ordering hazards this sequence avoids. `deck-status.sh` follows `/deck-plan` so it is written against real artifacts, since no deck on disk will ever carry the shapes it reads and the ten existing decks all report `legacy`. And the `/diagram` and `/fetch-image` documentation cuts wait for step 7, so those skills never spend five steps pointing at a `figures.md` allocator contract that does not exist yet.
