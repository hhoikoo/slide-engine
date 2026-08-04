---
paths:
  - "**/*.svg"
  - "**/INDEX.md"
  - "**/*.yaml"
  - "**/*.yml"
  - "presentations/**/*.md"
---
# Short-form text

Diagram labels, box headers, axis labels, legend entries, table cells, `header:` strings, divider subtitles, image alt text, `INDEX.md` descriptions, `variants.yaml` terms.

A label is not a sentence. Most prose rules do not transfer: a 1-4 word fragment has no paragraph, no 종결어미, no hedging tail. What survives compression is punctuation, casing, and vague nouns. Things banned in prose are **correct** here: verbless fragments, dropped articles, dropped Korean 조사, abbreviations.

## Shape

- **Sentence case.** First word and proper nouns only. Title Case in a diagram is the single most visible generated-deck texture. Microsoft, Google, Material 3, and IBM Carbon all mandate sentence case for labels; Apple is the lone split, and its operative rule is still consistency per surface. After a colon, capitalize the next word.
- **1-4 words, under ~30 characters.** No vendor publishes a cap for diagram nodes; the nearest hard number is VA.gov's 35-character button guidance. If a label needs more, the box is doing two jobs.
- **Nodes are things: noun phrases.** `Managing requests` -> `Request queue`. `Handling failures` -> `Retry path`.
- **Arrows are actions: plain present verbs.** `writes`, `evicts`, `fetches`. Never `writing`, `evicting`. Google: "avoid using -ing verb forms as the first word in any heading or title... they increase character count in limited spaces."
- Beware over-correction. `Request management` is no better than `Managing requests`; both are abstractions. Name the actual thing.
- One register per figure. Pick imperative or noun for numbered steps and hold it.
- No `**Label**: value` shape inside a legend.
- **Rule of three in box form**: three boxes for a two-stage system is the same padding tell. If one box's label is the vaguest of the set, that box is the padding. Draw the number of stages the system has.

## Punctuation in labels

| Do not write | Write instead |
|---|---|
| `Scheduler — GPU aware` (em dash) | second line, a colon, or two boxes |
| `Scheduler -- GPU aware` | same |
| `Writes to disk.` (trailing period on a fragment) | `Writes to disk` |
| `Build & Deploy` | `Build and deploy` |
| `Ingest/Transform` | pick one, or two boxes (`and/or` only when genuinely cramped) |
| `Retry, backoff…` | name the items or drop the ellipsis |
| `🚀 Fast path` | `Fast path` |
| `“hot” tier` (curly quotes) | `"hot" tier` (straight) |
| `Cache – hot tier` (en dash) | `Cache: hot tier` |

En dash survives for numeric and date ranges only (`2023–2025`, `0–100`). Colon: max **one per figure**. `Main: subtitle` is fine once in a figure title, but colon-subtitles in box labels are a known model tell. Parentheses are for a genuine qualifier (`Cache (LRU)`), never an aside (`Cache (this is where hot objects live)`).

## Vague head-nouns

Filler nouns that any box in any architecture diagram could take:

> Layer, Engine, Platform, Service, Manager, Handler, Framework, Solution, Ecosystem, Module, Component, System, Infrastructure, Core, Hub, Abstraction, Stack, Orchestration. Plus Gateway / Pipeline / Interface when nothing is actually gated, flowing, or interfaced.

The word is not the problem. `Scheduler` is right when the box **is** a scheduler. Three diagnostic shapes:

1. Suffix on a self-naming noun: `Cache Layer` -> `Cache`; `Scheduler Component` -> `Scheduler`.
2. Used alone: a box labeled just `Platform` names nothing.
3. Redundant against the figure title: a figure titled "Storage architecture" whose boxes read `Storage Layer`, `Storage Engine`, `Storage Manager`.

**Attribution, honestly:** no C4 or Simon Brown source publishes a banned-word list. C4's guidance is structural (every diagram needs a title, a legend, and unambiguous labelling of what each box is). The nearest real citation is Robert C. Martin's *Clean Code* naming chapter: "avoid words like Manager, Processor, Data, or Info in the name of a class... often hint at a class having too many responsibilities." Code-naming advice repurposed for labels. Do not attribute it to C4.

## Korean labels

- **조사 생략.** Drop 은/는/이/가/을/를. `데이터를 수집` -> `데이터 수집`. Keeping the particle in a two-word label is translated-from-English texture.
- **No 종결어미 in a box.** `~합니다`, `~됩니다`, `~할 수 있습니다` inside a label is an immediate tell. Labels are noun-final: `자동 회수`, not `자동으로 회수합니다`.
- **`~적` is filler at label length.** `구조적 개선` -> `구조 개선`.
- **Keep compounds closed.** Machine translation over-spaces: `스케줄 러`, `데이터 베이스` -> `스케줄러`, `데이터베이스`.
- **One script per term per figure.** `Scheduler` in one box and `스케줄러` in another is the strongest mixed-script tell.
- **가운뎃점 (`·`) is banned in labels.** Correct Korean orthography in prose (`text-syntax.md`), but in a diagram it hides a decision you did not make: line break, comma, or separate boxes.
- Toss calls filler words **잡초** ("넣든 빼든 의사 전달에 영향이 없는 단어") and makes 잡초 뽑기 explicit practice, because users scan labels rather than read them.

## Non-diagram short forms

- **Table cells**: noun fragments, sentence case, no bold, no trailing period. A cell needing a full sentence belongs in the speaker notes.
- **Image alt text**: what the figure shows, not that it is a figure. `Retry path with exponential backoff`, never `A diagram illustrating the architecture`.
- **`header:` frontmatter string**: the event name. Never the deck topic (CLAUDE.md, Privacy).
- **`INDEX.md` descriptions**: one plain line naming what the figure is. Encrypted, so be concrete. It is the only record of what `fNN` means.
- **`variants.yaml` terms**: substitution pairs only. No commentary.
