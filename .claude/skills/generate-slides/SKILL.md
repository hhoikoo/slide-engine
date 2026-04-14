---
name: generate-slides
description: Generate complete Marp slides from a synopsis or topic. Reads guide.md for layout reference and follows writing rules. Usage: /generate-slides [topic or path to synopsis.md]
argument-hint: "[topic or synopsis path]"
---

# Generate Slides

Generate a complete Marp presentation as sectioned markdown files.

## Input

`$ARGUMENTS` is either:
- A topic string (e.g., "WebAssembly for Backend Engineers")
- A path to a synopsis.md file
- Empty (reads synopsis.md from current directory)

## Workflow

1. **Read context**: Read `guide.md` (at template-gen repo root) for available layout classes. Read the writing rules from `.claude/rules/writing-*.md`.
2. **Read synopsis**: If a synopsis.md path is given or exists in cwd, read it. Otherwise use $ARGUMENTS as the topic.
3. **Plan structure**: Outline the slide deck: title, TOC, section dividers, content slides, closing. Choose appropriate layout classes for each slide. Plan which sections go in which file.
4. **Generate section files** in `sections/`:
   - `00-frontmatter.md`: YAML frontmatter only (`marp: true`, `theme: bai-flat`, `paginate: true`, `html: true`, `header:`)
   - `01-title.md`: Title slide
   - `02-*.md`, `03-*.md`, ...: Content sections (multiple slides per file, separated by `---`)
   - Final file: closing/divider slide
   - Each content slide gets speaker notes (in `<!-- ... -->` comments)
   - Insert `<!-- img-needed: "description" -->` markers where images would help
5. **Build**: Run `/build html` to compile and verify.
6. **Report**: List the section files generated and the output path.

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
