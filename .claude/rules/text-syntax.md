---
paths:
  - "**/*"
---
# Text syntax

Sole home for punctuation, dashes, encoding, and provenance artifacts. No other rule file restates these.

## Dashes

**No em dash, no en dash, and no ASCII `--` as prose punctuation, in any language.** Not a sentence break, not a definition separator, not a parenthetical, not a bullet marker. Restructure with a period, comma, colon, or parentheses.

Allowed:
- `--` as a CLI long-flag prefix, inside code, file paths, or an external quotation.
- En dash between digits for a numeric or date range (`2023–2025`, `0–100`). Nowhere else.
- ASCII `->` for causality and sequence. That is the house arrow.
- A dash **already present in someone else's text** you are editing. It is evidence of a human author. Preserve it.

**[measured]** Em-dash prevalence in medRxiv Discussion sections: 4.23% pre-ChatGPT to 20.30% in 2025 across 69,632 preprints. Space-padded dashes are flagged specifically as the model-characteristic form.

국립국어원 licenses Korean 줄표 only for a **paired** parenthetical restatement or self-correction, or one-sided for quotation attribution. The AI pattern is the English habit bleeding through: one unpaired dash per sentence where Korean wants a comma, parentheses, or a new sentence. This repo does not use 줄표 at all.

## 가운뎃점 (·)

Two rules, because the surfaces differ.

- **Diagram labels and any short form: banned.** See `writing-shortform.md`. In a box it hides a decision you did not make.
- **Korean prose: licensed for exactly three jobs**, per 국립국어원 「문장 부호 해설」 (2014): grouping enumerated items (`상·중·하위권`, `금·은·동메달`), joining paired terms (`한(韓)·이(伊) 양국`), and abbreviating a shared component. `수집·정제·학습` is idiomatic and correct. **Banned as a generic category separator** where a comma, a line break, or two items belong (`장점·단점·개선방안` as a heading). Ration to one or two per document.

## Other marks

| Do not write | Write instead |
|---|---|
| `“curly” ‘quotes’` | `"straight" 'quotes'` |
| `&` between words | `and` (exception: literal UI or code strings) |
| `/` between alternatives | pick one, or split (`and/or` only when genuinely cramped) |
| `…` meaning "and so on" | name the items, or drop |
| emoji, ✅, 🚀, ⚠️ | nothing. Also breaks Marp's twemoji inline layout |
| `→` `✓` `•` and other decorative Unicode | `->`, `-`, a real list |
| `**Label**: value` as a bullet or legend shape | lead with the content |
| quote marks used for emphasis | italics, or nothing. Max ~5 per Korean document |
| `:` subtitle in a heading | noun phrase. Max 1 per document, 1 per figure |

Korean quotes: 큰따옴표 for direct quotation and titles, 작은따옴표 for emphasis and concepts. Straight vs curly is typography, not a 국어원 rule; this repo uses straight.

## Encoding

- **ASCII only** in code, comments, docstrings, commit messages, and configuration files. Use `--`, `->`, `-` rather than Unicode punctuation.
- **Exceptions**: tree-drawing characters in diagrams, author names, and internationalized user-facing strings (Korean slide content, SVG label text).

## Formatting

### No line wrapping, ever

**Hard rule. A markdown paragraph is one line, however long.** No wrapping at 80, 90, 100, or any other column. Same for docstrings, comments, config files, and commit bodies. Write the line and let the renderer wrap it.

A newline inside a paragraph is a semantic signal in markdown, and using it for visual width throws that signal away. It also makes every later edit produce a reflow diff that buries the actual change.

The only newlines in prose are structural: between paragraphs, between list items, between table rows, and inside fenced code blocks where the line breaks are the content.

This applies to every `.md` in the repo except `presentations/**`, where slide content has its own line semantics.

`engine/scripts/lint-text.sh` checks it (`FMT-04`). `engine/scripts/unwrap-md.py` fixes it.
- No thematic break (`---`, `***`) immediately before a heading.
- Sequential heading levels. No `##` jumping to `####`.

## Provenance artifacts

Zero tolerance, no judgement call. Not style tells: proof that text was pasted out of a chat window. Any hit is a defect.

```
oaicite            oai_citation       contentReference
citeturn         turn0search        turn0image
utm_source=chatgpt.com
[cite:             start_span         end_span
grok-card          grok_render_citation
ppl-ai-file-upload [attached_file:    [web:
【 ... †            (lenticular-bracket citations)
As an AI language model
as of my last knowledge update
[Your Name]        2025-XX-XX
```

Same treatment: invalid DOI or ISBN checksums, DOIs resolving to an unrelated paper, dead links absent from web archives, book citations with no page numbers, any unfilled placeholder.

`engine/scripts/lint-text.sh` greps all of the above.
