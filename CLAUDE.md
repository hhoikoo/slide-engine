# Presentation Generation Harness

Marp-based presentation generation system with theme support, sectioned slide authoring, and Claude Code integration.

## Layout

```
template-gen/
├── CLAUDE.md
├── .env.example              # PRESENTATIONS_DIR template
├── .env                      # Local config (gitignored)
├── .gitignore
├── Makefile                  # Top-level build: make html DIR=... THEME=...
├── package.json              # marp-cli + markdown-it-cjk-friendly
├── package-lock.json
├── README.md
├── guide.md                  # Layout class reference
├── starter.md                # Starter template with all layout examples
├── engine/
│   ├── marp.config.js        # Marp engine config (image paths, SVG inlining, auto-shrink, CJK plugin)
│   └── scripts/
│       ├── assemble-sections.sh   # Concatenate sections/*.md into slides.md
│       ├── merge-theme.js         # Combine base theme + local overrides
│       └── marp-postprocess.js    # HTML post-processing (asset inlining)
├── themes/
│   └── bai-flat/
│       ├── theme.css         # Marp CSS theme
│       ├── image-style.md    # Default image gen style prompts
│       └── assets/           # logo/, partner/, customer/, common/
├── .claude/                  # Skills, agents, rules
├── plan/                     # Plan documents
└── research/                 # Repo-level research (tool evaluations)
```

### Presentation layout

Presentations live outside this repo, configured via `PRESENTATIONS_DIR` in `.env`. Each presentation is a subfolder:

```
{PRESENTATIONS_DIR}/
└── 2026-04-my-talk/
    ├── synopsis.md               # Content brief for LLM generation
    ├── sections/                 # Slide content (multi-file authoring)
    │   ├── 00-frontmatter.md     # YAML frontmatter only
    │   ├── 01-title.md
    │   ├── 02-background.md
    │   ├── 03-problem.md
    │   └── ...
    ├── slides.md                 # Assembled from sections/ (build artifact, not hand-edited)
    ├── theme.css                 # Optional per-presentation style overrides
    ├── research/                 # Per-presentation knowledge base
    ├── images/
    │   ├── figures/              # Hand-made or sourced diagrams
    │   └── generated/            # AI-generated images
    └── output/                   # Build output (gitignored)
        ├── slides.html
        └── slides.pdf
```

## Build

```bash
make setup                                          # npm install
make html DIR=/path/to/presentation THEME=bai-flat  # Build HTML
make pdf  DIR=/path/to/presentation THEME=bai-flat  # Build PDF
make clean DIR=/path/to/presentation                # Remove output/ and slides.md
```

`DIR` must be an absolute path or a path relative to the current working directory (not relative to the Makefile).

Fallback (direct marp-cli, without theme merging or post-processing):
```bash
npx marp --html --allow-local-files slides.md -o output/slides.html
```

## Engine Gotchas

- **Two-column `<div>` blank lines:** Marp requires blank lines around `<div>` tags inside slides for markdown to render inside them.
- **Four-box `<b>` syntax:** The four-box layout uses `<b>Title</b>` tags for box headers, not `**bold**`.
- **Image path conventions:** Local images use relative paths (`figures/arch.svg`). Theme assets use the `/assets/...` prefix (resolved to `THEME_DIR/assets/` by the engine).
- **Layout class directive placement:** `<!-- _class: layout-name -->` must be the first line after the slide separator.
- **Speaker notes:** Use `<!-- ... -->` HTML comments. Must appear after all slide content on the slide.
- **Emoji rendering:** Marp uses twemoji, which converts Unicode emoji to `<img>` elements that break inline layout. Avoid Unicode emoji in slides.
- **CJK bold:** Handled by the `markdown-it-cjk-friendly` plugin (no `<b>` workaround needed).

## Section File Format

Presentations use multi-file sectioned authoring under `sections/`.

`00-frontmatter.md` contains only the YAML frontmatter block:
```markdown
---
marp: true
theme: bai-flat
paginate: true
html: true
header: "Talk Title"
---
```

Other section files contain one or more slides separated by `---`:
```markdown
## Slide Title

- Point one
- Point two

<!--
Speaker notes for this slide.
-->

---

## Next Slide

Content here.
```

Rules:
- No leading `---` at the start of section files (the assembler handles joins between files).
- The first file must use a `00-` prefix (assembler convention for frontmatter detection).
- `slides.md` is a build artifact assembled from `sections/` by `assemble-sections.sh`. Do not edit it directly.

## Skills

| Skill | Usage |
|-------|-------|
| `/new-presentation <topic>` | Scaffold new presentation directory |
| `/generate-slides [synopsis]` | Generate slides from brief |
| `/build [html\|pdf]` | Compile slides |
| `/generate-image <prompt>` | Generate image via Gemini CLI |
| `/inspect [slide-number]` | Visual screenshot + analysis |
| `/export-notes` | Extract speaker notes |
| `/commit` | Git commit |

## Agents

| Agent | Use for |
|-------|---------|
| `claude-code-guide` | Claude Code docs/features lookup |
| `web-researcher` | Online research (sonnet) |
| `cross-project-researcher` | Explore sibling projects in ~/Developer/ |

## Delegation Policy

When a skill or agent exists for a task, delegate to it. Check before performing any non-trivial action inline.

## Writing Rules

Anti-AI writing rules are in `.claude/rules/writing-ko.md` and `.claude/rules/writing-en.md`. Key points:
- No slop words, no meta-commentary, no rigged comparisons
- No em dash abuse, no summary endings
- Bold markers: colons inside bold (`**text:**`), space before Korean particles (`**text** 로`)
- Speaker notes for every content slide

## Implementation Status

### TODO
- [x] Phase 1: Engine extraction and setup (themes, Makefile, marp.config.js, scripts, package.json)
- [ ] Phase 2: Skills update, demo presentation, CLAUDE.md update
- [ ] Phase 3: Research / knowledge base (plan/02)
- [ ] Phase 4: Writing rules enhancement (plan/03)
- [ ] Phase 5: Cleanup (delete samples/, final verification)
