# Deck lifecycle

The authority on what a deck folder contains, what each artifact means, and how a slide or figure keeps its name across phases. Every pipeline skill `@`-imports this file rather than restating it.

A deck moves through five phases, each its own skill and its own session. Nothing auto-advances: every phase ends at a user gate and prints the next command.

| Phase | Skill | Produces |
|---|---|---|
| 1 | `/deck-plan <topic \| pNNN>` | `synopsis.md`, `draft/outline.md`, `draft/decisions.md`, `draft/figures.md` |
| 2 | `/deck-draft [pNNN]` | `sections/NN.md`, all structural layout, slide markers |
| 3 | `/deck-mock [pNNN]` | `draft/mocks/fNN.excalidraw`, `images/mocks/fNN.svg` |
| 4 | `/deck-figures [pNNN]` | `images/figures/fNN.*`, `images/figures/INDEX.md` |
| 5 | `/deck-polish [pNNN]` | fine-tuning, no new artifact |

`engine/scripts/deck-status.sh` derives the current phase from what is on disk. State lives on disk, never in a session's memory.

## Folder layout

```
presentations/pNNN/
  synopsis.md                  # durable brief: topic, audience, spine
  draft/
    outline.md                 # slide inventory, order and cue-level content
    decisions.md               # numbered settled choices, machine-readable frontmatter, live Open section
    figures.md                 # figure registry and sole fNN allocator
    mocks/fNN.excalidraw       # mock source of truth, committed, hand-editable in VS Code
  research/rNN.md              # research docs, one per source
  sections/NN.md               # slide markdown, 00.md is frontmatter
  images/mocks/fNN.svg         # mock export, committed
  images/figures/fNN.<ext>     # final figure
  images/figures/INDEX.md      # opaque name to description, generated at the end of phase 4
  output/                      # gitignored build artifacts
```

There is no `draft/PLAN.md`. The brief, the inventory and the decision log are three files with three jobs, and a fourth document summarizing all three is the one that goes stale.

No intermediate rasterization is committed. Encrypted binaries do not delta-compress, so a render intermediate never enters a deck folder. Source assets are a different case and are tracked normally: a fetched PNG under `images/figures/` is content, not an intermediate.

## Privacy

git-crypt encrypts file contents, never paths. Every filename under `presentations/` is public on GitHub, which is why all of them are opaque: `pNNN`, `NN.md`, `rNN.md`, `fNN.<ext>`. The real descriptions live inside the encrypted files. See CLAUDE.md, Privacy, for the full rule and its reach into commit messages and branch names.

## Slide identity

A slide ID is an author-assigned `<section>.<n>` string. `<section>` is an integer. `<n>` is an integer, or the literal `div` for a divider and `cover` for the cover slide.

The ID appears in four places: the `outline.md` entry heading, a `<!-- _slide: S.n -->` marker as the first line of the slide in its section file, mock element labels, and polish notes. It is author-assigned because a section-file index is a position, and a position is a poor name for something referred to across four phases.

`assemble-sections.sh` strips every `<!-- _slide: -->` line while writing `slides.md`. Marp does not ignore an unknown local directive: it folds the comment into the slide's presenter notes, so an unstripped marker gives the slide a phantom note reading `_slide: 1.1`. Because the marker never reaches Marp, `<!-- _class: -->` remains the first line Marp reads and the placement rule in `.claude/rules/marp-authoring.md` holds unchanged.

**Markers are advisory after phase 2.** `outline.md` is frozen at the phase-2 gate and is not maintained past it, `deck-status.sh` stops matching IDs to markers past phase 2, and a slide that phase 5 splits needs no new ID. The marker lets phases 2 through 5 refer to a slide by name; it is not a permanent registry.

## Figure identity

A figure ID is `fNN`, allocated in `draft/figures.md` and nowhere else. The extension is not allocated, because a fetched image's type is unknown until it is fetched.

`/diagram` and `/fetch-image` write the `fNN` they are handed. Neither scans a directory for the next free index, and neither appends to `INDEX.md`. Invoked standalone, they append a row to `figures.md` and take the name from there.

`images/figures/INDEX.md` is generated from `figures.md` at the end of phase 4, in the three-column shape `File | Status | Description`. It is git-crypt encrypted, so descriptions in it are safe and should be concrete.

### Path progression

A `kind: diagram` figure changes path once, in phase 4:

| Phase | Slide markdown points at | File on disk |
|---|---|---|
| 2 | `images/mocks/fNN.svg` | nothing yet, image is broken |
| 3 | `images/mocks/fNN.svg` | mock export lands, deck renders |
| 4 | `images/figures/fNN.svg` | real figure lands, one mechanical rewrite |

`kind: fetched` rows stay out of this progression. Phase 2 points them straight at `images/figures/fNN`, and `/fetch-image` resolves the extension in phase 4. Phase 4's rewrite therefore only ever touches `kind: diagram` rows, which keeps it mechanical, and a failed fetch shows up as one broken image instead of a phase-wide status regression.

Phase 4 is done when no `images/mocks/` reference remains in `sections/`.

## Artifact schemas

### `draft/outline.md`

A preamble paragraph, then one entry per slide in presentation order.

```markdown
## S - <section title>

### S.n - <slide title>
- content: <cue-level, one line per on-slide beat>
- source: rNN[, rNN]                 # optional
- figure: fNN                        # optional
- note: <one line for the author>    # optional
```

`content` is required on every non-divider entry. `figure` must name an `fNN` already allocated in `figures.md`; `figures.md` stays the authority on what the figure shows and `outline.md` only points at it.

Fixed field names on their own lines are what make `deck-status.sh` a grep instead of a parser.

`outline.md` carries the deck's full cue-level content, so it is the one file under `draft/` inside the default lint scope, and it gets one `slop-grader` pass before phase 1 closes. It is frozen at the phase-2 gate.

### `draft/decisions.md`

Frontmatter, then a numbered log, then a live `## Open` section.

```yaml
---
language: ko                          # /deck-draft, /revise, slop-grader: picks writing-ko vs writing-en
header: "Lablup Seminar Day Q3 2026"  # /deck-draft writes this verbatim into sections/00.md
target_minutes: 30                    # human only, informs pacing at phase 1
slide_budget: 42                      # human only, a phase-1 sanity check
---
```

Every frontmatter field has a named consumer. `decisions.md` is the source for `header:` and `sections/00.md` is the copy, rewritten from it on every `/deck-draft` run so the two cannot drift. `slide_budget` is a sanity check and never a generation target; `writing-core.md` rule 12 governs actual length.

Each numbered log entry names the choice, the rationale and the rejected alternative. `## Open` is the one part of `draft/` that stays live past phase 2, so uncertainty raised in phases 3 through 5 has somewhere to go.

### `draft/figures.md`

The figure registry and the sole allocator of `fNN`. A markdown table, five columns in this order:

```markdown
| fNN | slides | kind | archetype | description |
|---|---|---|---|---|
| `f00` | 2.1 | diagram | request-flow | the read path from client to cache tier |
| `f01` | 3.2, 3.3 | fetched | - | vendor block diagram from the product page |
```

| Column | Meaning |
|---|---|
| `fNN` | opaque identity, allocated here and nowhere else |
| slides | one or more slide IDs; one figure can serve several slides |
| kind | `diagram` or `fetched` |
| archetype | a name from `.claude/skills/diagram/references/archetypes.md`, or `-` for a fetched image |
| description | what it actually shows; safe here, the folder is encrypted |

`deck-status.sh` reads the first and third columns, so keep the column order.

No status column. All three states are derivable: unplanned figures have neither file, `mocked` means `images/mocks/fNN.svg` exists, `built` means `images/figures/fNN.*` exists. A hand-written status column is the artifact `deck-status.sh` exists to replace.

## Preconditions

Every `/deck-*` skill opens by running `engine/scripts/deck-status.sh --porcelain <deck>` on its own deck and comparing the reported `phase_num` against its own phase number.

| Deck state | What the skill does |
|---|---|
| exactly one phase below | proceed |
| at or above this phase | name what already exists and ask before re-running |
| two or more below | refuse, and print the command for the phase the deck is actually at |
| `phase=legacy` | refuse |

Refusing on a gap while merely asking on a re-run separates "you skipped work" from "you want to redo this". A `phase_num` of `-1` is legacy; `0` means nothing has been planned yet.

`/diagram` and `/fetch-image` are not `/deck-*` skills and this rule does not reach them. Ad-hoc figure work on a shipped deck keeps working.

## Scope

Every pipeline skill is scoped to the deck it was invoked for. No skill reads, checks or edits another deck.

Decks authored before this pipeline report `phase=legacy` and are frozen. They are not retrofitted and not migrated. `phase=legacy` exists so a skill can refuse, not so it can go fix something.
