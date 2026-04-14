---
name: generate-slides
description: Generate complete Marp slides from a synopsis or topic. Reads docs/guide.md for layout reference and follows writing rules. Usage: /generate-slides [topic or presentation-name]
argument-hint: "[topic or presentation-name]"
---

# Generate Slides

Generate a complete Marp presentation as sectioned markdown files.

## Input

`$ARGUMENTS` is either:
- A presentation name matching an existing worktree (e.g., `2026-04-build-demo`)
- A topic string for a new presentation (e.g., "WebAssembly for Backend Engineers")
- Empty (use presentation from earlier in this conversation)

## Resolve Presentation Directory

1. If `$ARGUMENTS` matches an existing worktree at `$PRESENTATIONS_DIR/.worktrees/{name}/`, use that.
2. If not given, use the presentation directory from earlier in this conversation (e.g., from `/new-presentation`).
3. If `$ARGUMENTS` is a topic string that doesn't match a worktree, look for a synopsis.md in the resolved presentation directory, or use the topic to generate content from scratch.
4. If no presentation can be resolved, ask the user.
5. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.

## Workflow

1. **Read context**: Read `docs/guide.md` (at template-gen repo root) for available layout classes. Read the writing rules from `.claude/rules/writing-*.md`.
2. **Read synopsis**: Read `synopsis.md` from the presentation directory. If none exists, use `$ARGUMENTS` as the topic.
3. **Read research** (if available): If a `research/` directory exists with `.md` files, read all research docs. Note their IDs, key data points, and relevance sections.
4. **Plan structure**: Outline the slide deck: title, TOC, section dividers, content slides, closing. Choose appropriate layout classes for each slide. Plan which sections go in which file. When research docs exist, plan where to incorporate specific data points.
5. **Generate section files** in `sections/`:
   - `00-frontmatter.md`: YAML frontmatter only (`marp: true`, `theme: bai-flat`, `paginate: true`, `html: true`, `header:`)
   - `01-title.md`: Title slide
   - `02-*.md`, `03-*.md`, ...: Content sections (multiple slides per file, separated by `---`)
   - Final file: closing/divider slide
   - Each content slide gets speaker notes (in `<!-- ... -->` comments)
   - Insert `<!-- img-needed: "description" -->` markers where images would help
   - When using data from research docs, insert `<sup>[research:{id}]</sup>` citation markers (the id from the research doc's frontmatter)
6. **Run citation map** (if citations exist): Run `node engine/scripts/generate-citation-map.js <presentation-dir>` to assign citation numbers and generate the references slide.
7. **Build**: Run `/build html` to compile and verify.
8. **Report**: List the section files generated and the output path.

## Section File Rules

- First file MUST be named with `00-` prefix (frontmatter detection by assembler)
- Files are concatenated in sort order by `assemble-sections.sh`
- `---` between slides within a file is the author's responsibility
- Do NOT put `---` at the start of section files (the assembler handles joins)
- Do NOT invoke `/generate-image` -- just leave `<!-- img-needed -->` markers

## Content Guidelines

- One key message per slide
- 3-5 bullets max, avoid deep nesting
- Bold key numbers: "**80%**", "**3x faster**"
- Use varied layouts -- title, toc, two-col, highlight-boxes, timeline, focus, etc.
- Start with title slide, include TOC, use dividers between sections
- End with a divider slide ("Thank You" / "Q&A")
- Always generate speaker notes
