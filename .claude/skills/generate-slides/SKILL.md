---
name: generate-slides
description: Generate complete Marp slides from a synopsis or topic. Reads docs/guide.md for layout reference and follows writing rules. Usage: /generate-slides [topic or presentation-name]
argument-hint: "[topic or presentation-name]"
---

# Generate Slides

Generate a complete Marp presentation as sectioned markdown files.

## Input

`$ARGUMENTS` is either:
- A presentation identifier: opaque ID (`p002`) or human-readable name (`k8s-backendai`)
- A topic string for a new presentation (e.g., "WebAssembly for Backend Engineers")
- Empty (use presentation from earlier in this conversation)

## Resolve presentation

1. If `$ARGUMENTS` matches a directory in `presentations/` directly, or matches an entry in `presentations/index.md` by substring, use that.
2. If not given, use the presentation from earlier in this conversation.
3. If `$ARGUMENTS` is a topic string that doesn't match, look for synopsis.md in the resolved presentation, or use the topic to generate from scratch.
4. If no presentation can be resolved, ask the user.

## Workflow

1. **Read context**: Read `docs/guide.md` for available layout classes. Read `.claude/rules/writing-core.md`, then `writing-ko.md` or `writing-en.md` for the deck's language, then `writing-shortform.md` if the deck will carry figures or tables.
2. **Read synopsis**: Read `synopsis.md` from the presentation directory. If none exists, use `$ARGUMENTS` as the topic.
3. **Read research and plan docs** (if available): If a `research/` directory exists with `.md` files, read all research docs. Also look for existing plan or content documents and read them thoroughly.
4. **Ask for event name**: The `header:` field in frontmatter should be the event name (e.g., "Lablup Seminar Day Q2 2026"), not the presentation topic. If the user hasn't provided an event name, ask.
5. **Plan structure**: Outline the slide deck: title, TOC, **motivation/framing section**, section dividers, content slides, closing. Choose appropriate layout classes for each slide.
5. **Generate section files** in `sections/` using numeric names only (`00.md`, `01.md`, `02.md`, ...):
   - `00.md`: YAML frontmatter only
   - `01.md`: Title slide
   - `02.md`, `03.md`, ...: Content sections (multiple slides per file, separated by `---`)
   - Final file: closing/divider slide
   - Each content slide gets speaker notes (in `<!-- ... -->` comments)
   - Insert `<!-- img-needed: "description" -->` markers where images would help
   - When using data from research docs, insert `<sup>[research:{id}]</sup>` citation markers
6. **Run citation map** (if citations exist): Run `node engine/scripts/generate-citation-map.js presentations/{id}` to assign citation numbers and generate the references slide.
7. **Lint**: Run `engine/scripts/lint-text.sh presentations/{id}` and fix every hit. Provenance hits are defects, not style calls.
8. **Build**: Run `/build html` to compile and verify.
9. **Revise**: Run `/revise {id}` as a separate pass. Generation-time compliance and review-time compliance are different problems.
10. **Report**: List the section files generated and the output path.

## Voice

The rules in `.claude/rules/` are active for every word on every slide and in every speaker note. Follow them; do not approximate them from memory. `writing-core.md` loads at launch, but read the language file and `writing-shortform.md` explicitly before writing.

The register differs by surface, and getting this wrong is the most common failure:

- **Slide bullets**: terse fragments, one idea each. Korean bullets are noun-final 개조식, never 해요체 or 합니다체.
- **Speaker notes**: conversational connected prose, mixed endings.
- **Figure labels, box headers, table cells**: noun phrases, sentence case, 1-4 words, no trailing period.

The honesty bar in `writing-core.md` is not a style preference. No invented numbers, no unsourced benchmarks, no smoothing over a gap with confident generic prose. Uncertainty goes in the speaker notes in the speaker's voice.

## Section file rules

- First file MUST be `00.md` (frontmatter detection by assembler)
- Files are concatenated in sort order by `assemble-sections.sh`
- `---` between slides within a file is the author's responsibility
- Do NOT put `---` at the start of section files (the assembler handles joins)
- Use numeric names only (`00.md`, `01.md`) to avoid leaking topics via filenames

## Content guidelines

- One key message per slide
- 3-5 bullets max, avoid deep nesting
- Bold key numbers: "**80%**", "**3x faster**"
- Use varied layouts: title, toc, two-col, highlight-boxes, timeline, focus, etc.
- Start with title slide, include TOC, use dividers between sections
- End with a divider slide ("Thank You" / "Q&A")
- Always generate speaker notes **in bullet-point format** (not prose scripts)
- Include a motivation/framing section early in the deck (after TOC)
- When a two-col slide has very different column density, consider splitting into two slides
- When multiple short topics each get their own slide, consider combining into a two-col or highlight-boxes slide
