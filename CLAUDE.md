# Presentation Generation Harness

Marp-based presentation generation system with theme support, sectioned slide authoring, and Claude Code integration.

## Layout

```
template-gen/
├── CLAUDE.md
├── .env.example              # PRESENTATIONS_DIR template
├── .env                      # Local config (gitignored)
├── .gitignore
├── .github/workflows/
│   └── deploy-pages.yml      # GitHub Actions: deploy public/ to Pages
├── Makefile                  # Top-level build: make html DIR=... THEME=...
├── package.json              # marp-cli + markdown-it-cjk-friendly
├── package-lock.json
├── public/                   # Deployed presentation HTML (served by Pages)
├── README.md
├── engine/
│   ├── guide.md              # Layout class reference (read by /generate-slides)
│   ├── marp.config.js        # Marp engine config (image paths, SVG inlining, auto-shrink, CJK plugin)
│   └── scripts/
│       ├── assemble-sections.sh   # Concatenate sections/*.md into slides.md
│       ├── generate-citation-map.js  # Assign citation numbers, generate references slide
│       ├── build-variant.sh        # Vendor/whitelabel preprocessor
│       ├── merge-theme.js         # Combine base theme + local overrides
│       ├── marp-postprocess.js    # HTML post-processing (asset inlining)
│       └── render-mermaid.js      # Render ```mermaid blocks to SVG (requires mmdc)
├── themes/
│   └── bai-flat/
│       ├── theme.css         # Marp CSS theme
│       ├── image-style.md    # Default image gen style prompts
│       └── assets/           # logo/, partner/, customer/, common/
├── .claude/                  # Skills, agents, rules
└── plan/                     # Plan documents
```

### Presentations repository

Presentations live in a separate git repo configured via `PRESENTATIONS_DIR` in `.env`. Each presentation lives on its own branch, with worktrees enabling concurrent work.

```
~/Documents/Presentation/
├── template-gen/                          # engine repo (this repo, public as "slide-engine")
└── slides/                                # presentations repo (private)
    ├── .worktrees/                        # gitignored, holds worktree checkouts
    │   ├── 2026-04-gpu-pooling/
    │   └── 2026-05-webassembly/
    └── ...
```

- `main` branch: archive of all finalized presentations + repo config
- Presentation branches: ephemeral workspaces, named `{YYYY-MM}-{slug}`, merged into main via PR when done
- Worktrees: `$PRESENTATIONS_DIR/.worktrees/{branch-name}`

`PRESENTATIONS_DIR` points to the base repo checkout (main branch). Skills that manage branches/worktrees use this path. Skills that work on a specific presentation (build, generate-slides) detect the presentation from cwd.

### Deployment

Built HTML is deployed via `public/` on the main branch of this repo (slide-engine). A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) triggers on pushes to `public/` and deploys to GitHub Pages. The slides repo stays private.

`/deploy` builds HTML, copies it to `public/{presentation-name}/index.html`, regenerates the index, commits, and pushes. GitHub Actions handles the rest.

### Presentation directory structure

Each presentation branch contains its content in a directory matching the branch name:

```
{branch-name}/
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
make html    DIR=/path/to/presentation THEME=bai-flat  # Build HTML
make pdf     DIR=/path/to/presentation THEME=bai-flat  # Build PDF
make html-wl DIR=/path/to/presentation THEME=bai-flat  # Build whitelabel HTML
make pdf-wl  DIR=/path/to/presentation THEME=bai-flat  # Build whitelabel PDF
make clean   DIR=/path/to/presentation                  # Remove output/ and slides.md
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
- **Mermaid diagrams:** Use standard ```mermaid code blocks in section files. The build pipeline renders them to SVG via `mmdc` (mermaid-cli) before marp. If mmdc is not installed, mermaid blocks are left as-is. Install with `npm install -g @mermaid-js/mermaid-cli`.
- **Build variants:** Use `<!-- vendor-start -->` / `<!-- vendor-end -->` and `<!-- whitelabel-start -->` / `<!-- whitelabel-end -->` markers in slide content. The `html-wl`/`pdf-wl` targets strip vendor blocks and apply term substitutions from `variants.yaml`. The default `html`/`pdf` targets produce the vendor version with all content.

## Citation System

Slides can reference research docs via `<sup>[research:{id}]</sup>` markers where `{id}` is the research doc's frontmatter ID. Running `node engine/scripts/generate-citation-map.js <presentation-dir>` assigns `[1]`, `[2]`... by order of first appearance, rewrites the markers in-place, generates `research/citation-map.md`, and creates a `{NN}-references.md` section file. The script is idempotent.

The `/generate-slides` skill inserts citation markers when research docs exist and runs the citation map script before building.

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
| `/new-presentation <topic>` | Create branch + worktree + scaffold |
| `/list-presentations` | List all branches and active worktrees |
| `/open-presentation <name>` | Create worktree for existing branch |
| `/close-presentation <name>` | Remove worktree (keeps branch) |
| `/generate-slides [synopsis]` | Generate slides from brief |
| `/build [html\|pdf\|html-wl\|pdf-wl]` | Compile slides (with optional whitelabel variant) |
| `/research <url\|topic\|arxiv:ID\|code:path>` | Add research docs to knowledge base |
| `/fetch-image <url> [filename]` | Download image to images/figures/ |
| `/pr-presentation` | Create PR to merge presentation into main |
| `/deploy` | Build + commit + push for Pages |
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

Anti-AI writing rules are in `.claude/rules/writing-ko.md`, `.claude/rules/writing-en.md`, and `.claude/rules/writing-cross-language.md`. Key points:
- No slop words, no meta-commentary, no rigged comparisons
- No em dash abuse, no summary endings
- Bold markers: colons inside bold (`**text:**`), space before Korean particles (`**text** 로`)
- Speaker notes for every content slide

## Implementation Status

### Completed
- Phase 1: Engine extraction and setup (themes, Makefile, marp.config.js, scripts, package.json)
- Phase 2: Skills update, demo presentation, CLAUDE.md update
- Phase 3: Research / knowledge base -- superseded by Phase 7
- Phase 4: Writing rules enhancement (plan/03)
- Phase 5: Cleanup (delete samples/, final verification)
- Phase 6: Presentations repo + worktrees + Pages deployment (plan/06)
- Phase 7: Research / knowledge base (plan/02)
- Phase 8: Content assets (plan/04)
- Phase 9: Build variants (plan/05)
