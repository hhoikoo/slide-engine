# Presentation Generation Harness

Marp-based presentation generation system with multiple theme support, Claude Code integration, and Gemini CLI image generation.

## Layout

```
engine/                     # Shared build infrastructure (Makefile, marp.config.js, scripts/)
themes/                     # Self-contained themes (each has theme.css + assets/)
  bai-flat/                 # Lablup corporate theme
  personal/                 # Personal theme (TBD)
presentations/              # Slide content (can also live externally)
  {date}-{slug}/            # Each presentation is a directory
    slides.md               # Marp markdown source
    synopsis.md             # Content brief for LLM generation
    images/generated/       # AI-generated images
    output/                 # Build output (gitignored)
guide.md                    # Layout class reference
starter.md                  # Starter template with all layout examples
research/                   # Research documents
samples/                    # Reference implementations (original repos)
```

## Build

```bash
# From engine/ or using TEMPLATE_DIR:
make html DIR=presentations/my-talk THEME=bai-flat
make pdf  DIR=presentations/my-talk THEME=bai-flat
```

Fallback (direct marp-cli):
```bash
marp --html --allow-local-files slides.md -o output/slides.html
```

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

Phase 1 (theme restructuring) and Phase 2 (content storage, engine setup) are not yet complete. Skills that depend on `engine/Makefile` will fall back to direct marp-cli invocation until then.

### TODO
- [ ] Phase 1: Restructure themes (self-contained folders with assets)
- [ ] Phase 2: Set up engine/, promote guide.md + starter.md, create demo presentation
- [ ] Phase 3: Finalize skills (most are stubbed out, need engine/ to work)
- [ ] Phase 4: Gemini CLI image generation integration
- [ ] Phase 5: Presenter notes / export-notes support
- [ ] GitHub Pages deployment skill + GitHub Actions workflow
