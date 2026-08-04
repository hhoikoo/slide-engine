---
name: diagram
description: Author a hand-built SVG diagram in the house style, then lint, render and grade it until it passes the rubric. Usage: /diagram <what the diagram should show> [presentation-name]
argument-hint: "<what the diagram should show> [presentation-name]"
---

# Diagram

Author an SVG figure that meets the house standard. A script and a fresh-eyes grader verify it before you ship it.

The default output of an unguided model is a diagram with too many words, no type hierarchy, colour that encodes nothing, and a title duplicating the slide headline. This skill exists to prevent that specific outcome. The rules are measured from a corpus of professionally-authored diagrams, not invented.

## Input

`$ARGUMENTS` is `<what the diagram should show> [presentation-name]`. The first part is the communicative goal in the author's words. A trailing presentation ID or name is optional.

## Resolve presentation

Use the presentation from earlier in this conversation. If none established, ask the user. Accepts opaque ID or human-readable name via `presentations/index.md`.

## Before drawing anything

**Read these three files. Do not skip them and do not work from memory.**

- `.claude/skills/diagram/references/tokens.md`: the fixed vocabulary
- `.claude/skills/diagram/references/archetypes.md`: the compositions
- `.claude/skills/diagram/references/rubric.md`: what it will be graded against

Two libraries save you from re-deriving shapes by hand. Both are pasted into the figure, never referenced across files: the engine scopes ids, so a cross-file `<use>` does not resolve.

- `references/components.md` and `components-sheet.png`: **read this before drawing any shape.** 35 composite parts at diagram scale, covering every shape the token spec describes in prose. Boundaries, bands, swimlanes, stadium, cylinder, diamond, note, parallelogram, card stack, ghost column, rounded elbows, leaders, brackets, block arrow, port stubs, plot axes, threshold lines, scale strips, bus bars, the oblique plane set, and the disabled and elision forms. Four are `<symbol>`s; the rest are templates you size to your contents. Hand-authoring a cylinder or an elbow when the library has one is how geometry drifts between figures.
- `references/icons.md` and `icons-sheet.png`: 63 house-style 24x24 glyphs in `icons.svg`, for labelling what a box *is*. Use them sparingly. The reference corpus contains roughly fifteen distinct icons across all 53 files, because the style carries meaning through labelled boxes and the shape vocabulary rather than through iconography. An icon in every box is the Gate 5 tell. Never hand-draw a glyph the library already has, and never paste one in from another icon set. If the concept genuinely has no icon, follow the on-demand procedure in `icons.md` and author it into the library, so the next figure inherits it.

Then look at two or three exemplars in `.claude/skills/diagram/references/exemplars/` that are closest to what you're about to draw. Render them and look at them:

```bash
.claude/skills/diagram/scripts/render-svg.sh <exemplar.svg> /tmp/ex.png 1400
```

Reading a spec is not the same as seeing what it produces.

## Workflow

### 1. Decide whether it should exist

State in one sentence what structure the diagram carries that prose cannot. If you cannot, say so and stop. Recommend a sentence on the slide instead.

Two boxes and one arrow is a sentence rendered as geometry. The existing repo is full of them. This is Gate 0 of the rubric and it is the most common failure; the grader will reject on it.

### 2. Pick an archetype

Choose one from `archetypes.md` using its selection table. Name it explicitly.

**If nothing fits, say so rather than bending the content into the nearest shape.** Forcing a mechanism into a request-flow layout produces a worse diagram than admitting the shape is new. Follow the "When nothing fits" procedure in `archetypes.md`: name the archetypes you rejected and why, re-check Gate 0, then compose deliberately. Every token rule still binds. A new composition is never a licence for new styling.

If the composition works and the question it answers will recur, **harvest it**: add an entry to `archetypes.md` in the same shape as the others, and a row to its selection table. Describe the shape, never the deck content that occasioned it. That is how the archetype list grows: extracted from real work rather than invented up front. Don't add one-offs.

### 3. Declare the encoding, in writing

Before emitting any markup, write down:

- **Name the variable colour encodes**, in one word. *Ownership, tenant, layer, novelty, state.* If you cannot name it, use no colour beyond the neutral ramp.
- **Two or three hues.** Four or more only for a genuinely categorical set, one hue per member.
- **What line weight encodes**, if you use more than one. One uniform weight is preferred.
- **What dashing means**, out of boundary, logical, telemetry, or not-taken.
- **What shape encodes**, if anything beyond "component".

A channel with no job gets removed, not decorated.

### 4. Lay out on a grid, then emit

Models are measurably worse at diagrams when they compute coordinates while writing markup. Build a layout table first: every element with its x, y, width, height. Snap all values to multiples of 4, then emit markup from the table.

**Emission order matters and is not stylistic.** SVG has no z-index; paint order is document order, and a label emitted before an overlapping rect is invisible in the deck. This is a real defect in a shipped figure here.

1. background rect (full-bleed white)
2. `<defs>`: markers
3. containers and grouping bands
4. boxes
5. connectors
6. **all text, last**

Canvas is `viewBox="0 0 1000 H"` with **H <= 560**. At that size the render is exactly 1:1, so authored font-size equals rendered px. Above it everything scales down and the type scale stops being true.

Size boxes with the width formula in `tokens.md`.
SVG text does not wrap; a box that is too narrow produces text spilling out of it.

### 5. Lint

```bash
python3 .claude/skills/diagram/scripts/lint-svg.py <file.svg>
node .claude/skills/diagram/scripts/check-svg.js <file.svg>
```

`lint-svg.py` checks the countable rules: palette, font sizes, weights, word budget, banned punctuation, viewBox, arrowhead caps, and forbidden effects. `check-svg.js` loads the file in a real DOM and finds geometric failures: text overflow, occlusion, text sitting on a stroke, collision, clipping, font fallback.

Fix everything they report before going further. Do not proceed to grading with known failures; you will waste a round.

### 6. Render and grade

```bash
.claude/skills/diagram/scripts/render-svg.sh <file.svg> <out.png> 1400
```

Look at the PNG yourself first. Then dispatch the `diagram-grader` agent with the SVG path, the PNG path, and one sentence on what the diagram should communicate.

**Do not tell the grader what you intended stylistically or how you drew it.** Its entire value is that it arrives without your assumptions. Give it the goal and the artifact, nothing else.

### 7. Revise, up to three rounds

Apply the grader's defects. Re-lint, re-render, dispatch a **fresh** grader. A new agent each round, never a continuation, so each round gets genuinely fresh eyes.

Stop when the grader returns PASS, or after three rounds. If three rounds elapse without a pass, **stop and report what still fails.** Do not keep going silently and do not claim it passed. A diagram that needed four rounds usually has a Gate 0 problem that restyling cannot fix.

If the grader returns REJECT, do not restyle. Take the rejection to the user with its reasoning.

### 8. Save and record

Allocate the next opaque name: scan existing `fNN.*` in `images/figures/`, take the highest `NN`, add 1, zero-padded to two digits. First file is `f00`.

Save to `presentations/{id}/images/figures/f{NN}.svg` and append a row to that folder's
`INDEX.md` (create from the standard header if missing):

```
| `f{NN}.svg` | {description} |
```

Print the reference: `![alt](images/figures/f{NN}.svg)`

## Text in diagrams

Diagram labels are their own register: not prose, not slide bullets. `.claude/rules/writing-shortform.md`
owns the full rules. The short version:

- **2-4 words per label**, ~30 characters
- **Noun phrases for nodes, plain present verbs for arrows.** Not gerunds, no `Managing X`
- **Sentence case**, never Title Case
- **No terminal periods.** No em dash, no en dash except numeric ranges, no middle dot, no emoji
- **No title.** The slide headline is the title. Only multi-panel comparisons get short panel labels
- **No legend.** Label the element in place with an italic grey label on a hairline leader
- **No caption** restating the slide
- **No vague head-nouns** doing no work: Layer, Engine, Platform, Service, Manager, Handler
- Korean: drop 조사, no 종결어미 inside a box, keep compounds closed

## Privacy

git-crypt encrypts file contents but **not paths**. Figure filenames are visible in cleartext on GitHub, so the filename is always the next free `fNN`, never accept or invent a topic-revealing name. The real description lives in the encrypted `INDEX.md`.

Never write deck subject matter into anything outside `presentations/`. That includes commit messages, and it includes anything you add to this skill's own reference files.

## Notes

- Hand-authored SVG over mermaid, per `.claude/rules/marp-authoring.md`. Mermaid is for throwaway drafts only.
- Deployed HTML is Safari-exposed and Safari has not shipped `context-stroke`. For published decks, define one marker per colour rather than relying on it.
- `D2Coding` is not installed on the build machine. If you need monospace, use `ui-monospace, Menlo, monospace` and budget width at `font-size * 0.60` per character.
- There is no dark mode in this deck. Diagrams only need to work on white.
- In a `side-by-side` layout a figure renders at 0.566 scale. Author something simpler for that slot, or size type accordingly.
