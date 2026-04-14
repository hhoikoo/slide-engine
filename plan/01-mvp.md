# Presentation Generation Harness -- MVP Plan

> Status: Draft, iterating
> Last updated: 2026-04-14

## What This Is

A Marp-based presentation generation system where Claude Code helps author slide content and build final output. The system separates the **engine + themes** (this repo, potentially public) from **presentation content** (separate folders, private).

MVP capabilities:
- Self-contained theme (bai-flat) with asset isolation
- Multi-file sectioned slide authoring
- Local marp-cli managed via package.json (no global install)
- Build pipeline: assemble sections -> merge theme -> marp -> post-process
- Skills for scaffolding, generating, and building presentations
- CJK bold rendering fix (`markdown-it-cjk-friendly`)

Deferred to separate plan docs:
- Research/knowledge base system (plan/02)
- Writing rules enhancement (plan/03)
- Build variants / whitelabel (plan/04)
- GitHub Pages deployment (plan/05)
- Gemini image generation (plan/91)
- Slidev integration (plan/92)

---

## Directory Structure

### This repo: `template-gen/` (engine + themes)

```
template-gen/
├── CLAUDE.md
├── .env.example                              # PRESENTATIONS_DIR=~/Documents/Presentation/presentations
├── .env                                      # PRESENTATIONS_DIR (gitignored, local only)
├── .gitignore                                # includes .env, node_modules/
├── Makefile                                  # Top-level: make html DIR=... THEME=...
├── package.json                              # marp-cli + markdown-it-cjk-friendly as devDependencies
├── package-lock.json
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   ├── skills/
│   │   ├── new-presentation/SKILL.md
│   │   ├── generate-slides/SKILL.md
│   │   ├── build/SKILL.md
│   │   ├── generate-image/SKILL.md
│   │   ├── inspect/SKILL.md
│   │   ├── export-notes/SKILL.md
│   │   └── commit/SKILL.md
│   ├── agents/
│   │   ├── claude-code-guide.md
│   │   ├── web-researcher.md
│   │   └── cross-project-researcher.md
│   └── rules/
│       ├── writing-ko.md
│       ├── writing-en.md
│       ├── text-semantics.md
│       ├── text-syntax.md
│       ├── prompt-engineering.md
│       ├── verify-before-assuming.md
│       ├── code-conventions.md
│       └── shell-scripts.md
├── engine/
│   ├── marp.config.js                        # Marp engine (image path resolution, SVG inlining, auto-shrink, progress bar, CJK plugin)
│   └── scripts/
│       ├── marp-postprocess.js               # HTML post-processing (asset inlining)
│       ├── merge-theme.js                    # Node.js theme CSS merger (handles path resolution)
│       └── assemble-sections.sh              # Concatenate sections/*.md into slides.md (at presentation root)
├── themes/
│   ├── bai-flat/
│   │   ├── theme.css                         # 1774-line CSS with layout classes
│   │   ├── image-style.md                    # Default image gen style/negative prompts
│   │   └── assets/
│   │       ├── logo/
│   │       ├── partner/
│   │       ├── customer/
│   │       └── common/
│   └── personal/                             # TBD
├── guide.md                                  # Layout class reference
├── starter.md                                # Starter template with all layout examples
├── plan/                                     # Plan documents
└── research/                                 # Repo-level research (tool evaluations)
```

### Presentation content: `~/Documents/Presentation/presentations/`

Configured via `.env` file (`PRESENTATIONS_DIR`). Each presentation is a subfolder:

```
presentations/
└── 2026-04-gpu-pooling/
    ├── sections/                              # Slide content (multi-file)
    │   ├── 00-frontmatter.md                  # YAML frontmatter only
    │   ├── 01-title.md                        # Title slide
    │   ├── 02-background.md                   # Multiple slides
    │   ├── 03-problem.md
    │   ├── 04-solution.md
    │   ├── 05-architecture.md
    │   ├── 06-closing.md
    │   └── 99-appendix.md
    ├── research/                              # Per-presentation knowledge base (see plan/02)
    ├── images/
    │   ├── figures/                           # Hand-made or sourced diagrams
    │   └── generated/                         # AI-generated images
    ├── slides.md                              # Assembled from sections/ (build artifact, gitignored)
    ├── theme.css                              # Optional per-presentation style overrides
    ├── image-style.md                         # Optional per-presentation image gen style
    └── output/                                # Build output (gitignored)
        ├── slides.html
        └── slides.pdf
```

### Section file format

`00-frontmatter.md` contains only the YAML frontmatter block:
```markdown
---
marp: true
theme: bai-flat
paginate: true
html: true
header: "GPU Pooling System"
---
```

All other section files contain one or more slides separated by `---`. Each file is responsible for including its own slide separators:

```markdown
<!-- 02-background.md -->

## Background: GPU Compute Landscape

- Point one
- Point two

<!--
Speaker notes for this slide.
-->

---

## Market Data

| Metric | Value |
|--------|-------|
| Total GPUs deployed | **45,000** |

<!--
Talk about the market growth here.
-->
```

Section files do NOT need a leading `---` at the top (assemble-sections.sh handles the join between files). They DO need `---` between slides within the same file.

### assemble-sections.sh

Concatenates `sections/*.md` in sort order into `slides.md` at the presentation root (not inside `output/`). This is critical: marp resolves image paths relative to the source file, so `slides.md` must sit next to `images/` and other assets. The assembled file is a build artifact (gitignored).

Inserts a single `---` separator between files, except after `00-frontmatter.md` (where the YAML closing `---` already serves as the first slide separator).

The first section file MUST be named with a `00-` prefix (convention: `00-frontmatter.md`). This is how the assembler knows not to insert an extra `---` after the YAML block.

```bash
#!/bin/bash
set -euo pipefail
SECTIONS_DIR="$1/sections"
OUTPUT="$1/slides.md"

count=0
first=true
is_frontmatter=true
for f in "$SECTIONS_DIR"/*.md; do
    count=$((count + 1))
    if [ "$first" = true ]; then
        cat "$f" > "$OUTPUT"
        first=false
        # 00-frontmatter.md ends with --- which is the YAML close
        # The next file's content follows directly (no extra --- needed)
        [[ "$(basename "$f")" == 00-* ]] && is_frontmatter=true || is_frontmatter=false
    else
        if [ "$is_frontmatter" = true ]; then
            # After frontmatter: just append with a blank line (no ---)
            printf "\n" >> "$OUTPUT"
            cat "$f" >> "$OUTPUT"
            is_frontmatter=false
        else
            # Between content sections: insert --- separator
            printf "\n---\n\n" >> "$OUTPUT"
            cat "$f" >> "$OUTPUT"
        fi
    fi
done

if [ "$count" -le 1 ]; then
    echo "Warning: no content sections found in $SECTIONS_DIR (only frontmatter)" >&2
fi
```

**Naming convention:** The first section file MUST use a `00-` prefix (e.g., `00-frontmatter.md`). The assembler uses this to detect the frontmatter file and avoid inserting a spurious `---` after the YAML block. If the frontmatter file has a different prefix, a blank slide will appear between the frontmatter and the first content slide.

Claude Code writes the section files and is responsible for correct `---` placement within each file. The assembler only handles the join between files.

---

## Theme System

### Self-contained themes

Each theme is a complete, portable folder under `themes/`:

```
themes/bai-flat/
├── theme.css          # Marp CSS theme (/* @theme bai-flat */ directive)
├── image-style.md     # Default style direction for AI image generation
└── assets/
    ├── logo/          # Brand logos (SVG/PNG)
    ├── partner/       # Partner logos
    ├── customer/      # Customer logos
    └── common/        # Cover images, shared illustrations
```

The CSS references assets with relative paths from the theme directory:
```css
--asset-logo-horizontal: url("assets/logo/lablup-horizontal.svg");
--asset-cover-illust: url("assets/common/cover-illust.jpg");
```

No shared assets between themes. If two themes need the same logo, copy it into both.

### image-style.md

Per-theme defaults for AI image generation. Presentation-level `image-style.md` overrides theme-level. Details in plan/91.

---

## Engine / Build System

### Dependencies

The repo uses a top-level `package.json` to manage build dependencies locally:

```json
{
  "private": true,
  "devDependencies": {
    "@marp-team/marp-cli": "^4.x",
    "markdown-it-cjk-friendly": "^1.x"
  }
}
```

`marp-cli` is invoked via `npx marp` from the Makefile. No global install required.

**Important:** Do NOT set `"type": "module"` in `package.json`. The engine config and scripts use CommonJS (`require()`, `module.exports`). If ESM is set, `require('markdown-it-cjk-friendly')` in `marp.config.js` will fail. If ESM is ever needed, rename the config to `marp.config.cjs`.

### Setup

```bash
make setup    # runs npm install
```

### Makefile

The Makefile lives at the repo root. Invoked with:

```bash
make html DIR=/path/to/presentations/my-talk THEME=bai-flat
```

Key parameters:
- `DIR` -- presentation directory (required)
- `THEME` -- theme name (default: `bai-flat`)
- `TEMPLATE_DIR` -- path to template-gen repo (auto-detected from Makefile location)

Derived paths (computed from TEMPLATE_DIR and THEME):
- `THEME_DIR` = `$(TEMPLATE_DIR)/themes/$(THEME)` -- the theme folder
- `THEME_CSS` = `$(THEME_DIR)/theme.css`

Build targets:
- `setup` -- `npm install`
- `html` -- assemble sections, merge theme, build HTML, post-process
- `pdf` -- assemble sections, merge theme, build PDF
- `clean` -- remove output/ and slides.md
- `images` -- export per-slide PNGs (for /inspect)
- `notes` -- extract speaker notes

Key Makefile skeleton (showing variable wiring):
```makefile
TEMPLATE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
THEME        ?= bai-flat
THEME_DIR    := $(TEMPLATE_DIR)themes/$(THEME)
CONFIG       := $(TEMPLATE_DIR)engine/marp.config.js
SCRIPTS      := $(TEMPLATE_DIR)engine/scripts
SLIDES       := $(DIR)/slides.md
OUTPUT_DIR   := $(DIR)/output
LOCAL_THEME  := $(DIR)/theme.css
MERGED_THEME := $(OUTPUT_DIR)/.merged-theme.css

html: check-dir
	@bash "$(SCRIPTS)/assemble-sections.sh" "$(DIR)"
	@node "$(SCRIPTS)/merge-theme.js" \
		--base "$(THEME_DIR)/theme.css" \
		--local "$(LOCAL_THEME)" \
		--theme-dir "$(THEME_DIR)" \
		--slides-dir "$(abspath $(DIR))" \
		--output "$(MERGED_THEME)"
	THEME_DIR="$(THEME_DIR)" npx marp --no-stdin \
		--config "$(CONFIG)" \
		--theme-set "$(MERGED_THEME)" \
		--html --allow-local-files \
		--output "$(OUTPUT_DIR)/slides.html" \
		"$(SLIDES)"
	@node "$(SCRIPTS)/marp-postprocess.js" \
		"$(OUTPUT_DIR)/slides.html" --theme-dir "$(THEME_DIR)"
```

The `html` and `pdf` targets:
1. Run `assemble-sections.sh` to concatenate `sections/*.md` into `slides.md` at the presentation root (marp resolves image paths relative to this file, so it must sit next to `images/`)
2. Run `merge-theme.js` to combine base theme + local `theme.css` override (if present)
3. Invoke marp with `THEME_DIR` env var: `THEME_DIR=$(THEME_DIR) npx marp --no-stdin --config "$(CONFIG)" --theme-set "$(MERGED_THEME)" --html --allow-local-files --output "$(OUTPUT_DIR)/slides.html" "$(DIR)/slides.md"`
4. (HTML only) Run `marp-postprocess.js --theme-dir "$(THEME_DIR)"` to inline assets

### marp.config.js

Adapted from the gpu-pooling sample. Key change: asset path resolution uses `THEME_DIR` environment variable instead of a hardcoded sibling `assets/` directory.

```javascript
const THEME_DIR = process.env.THEME_DIR
  || path.resolve(__dirname, "../themes/bai-flat");
const THEME_ASSETS_DIR = path.join(THEME_DIR, "assets");
```

The Makefile sets `THEME_DIR` env var when invoking marp. Both `resolveImagePaths` (for markdown `/assets/...` image paths) and the CSS asset system use `THEME_ASSETS_DIR` derived from `THEME_DIR`. The original code hardcodes `TEMPLATE_ASSETS_DIR = path.resolve(__dirname, "assets")` -- this must be changed to read from `THEME_DIR`.

Engine features (all from existing gpu-pooling marp.config.js):
- Image path resolution (relative -> absolute based on source file dir, `/assets/...` -> `THEME_DIR/assets/`)
- SVG inlining with viewBox normalization, style scoping, ID scoping
- Progress bar injection
- Auto-shrink (CSS zoom for overflowing content, binary search, min 65%)
- Marpit fragment plugin disabled
- CJK-friendly markdown-it plugin loaded

### merge-theme.js

Based on the gpu-pooling sample (Node.js version, not the sed-based one from marp-template). Needs one fix: the original `resolveBaseUrls` only matches `url("../...")` paths. After restructuring (assets inside theme folder), paths become `url("assets/...")`. The function must be generalized to resolve ALL relative `url()` paths against the theme directory, matching how `resolveLocalUrls` already works for the slides dir.

The `--template-dir` flag is renamed to `--theme-dir` to reflect what it actually points to.

Handles:
- Base theme `url()` path resolution (any relative path resolved against theme dir)
- Local theme override `url()` path resolution (slides dir relative -> absolute)
- Concatenation: base CSS + local override CSS

### marp-postprocess.js

Based on the samples. Post-processes the final HTML to:
- Inline CSS `url()` referenced images as data URIs
- Inline `<img src="...">` local files as data URIs

This makes the built HTML fully self-contained and portable.

**Required fix:** The default `themeDir` fallback (line 35 of the sample) resolves to `path.resolve(__dirname, '..', 'bai-flat')`. After moving to `engine/scripts/`, this resolves to `engine/bai-flat/` which doesn't exist. Fix: update to `path.resolve(__dirname, '../../themes/bai-flat')`, or better, make `--theme-dir` a required argument since the Makefile always passes it.

---

## CJK Bold Rendering Fix

markdown-it uses word-boundary detection for emphasis parsing. CJK characters have no word boundaries, so `**bold text**` renders with literal asterisks.

**Fix:** Install `markdown-it-cjk-friendly` plugin and load it in `marp.config.js`:

```javascript
engine: ({ marp }) => {
  const cjkFriendly = require('markdown-it-cjk-friendly')
  marp.use(cjkFriendly)
  // ... rest of engine setup
  return marp
}
```

This is included in Phase 1 (engine setup) so that standard `**bold**` works for CJK from the start. No `<b>` tag workaround needed.

### Emoji rendering bug

Marp uses twemoji, converting Unicode emoji to `<img>` elements that break inline layout. Workaround: don't use Unicode emoji in slides, use text alternatives. This is documented in CLAUDE.md and writing rules.

---

## Marp Engine Gotchas (from agent-briefing.md)

These are absorbed into CLAUDE.md during Phase 1:

- **Two-column `<div>` blank lines:** Marp requires blank lines around `<div>` tags inside slides for markdown to render inside them
- **Four-box `<b>` syntax:** The four-box layout uses `<b>Title</b>` tags for box headers, not `**bold**`
- **Image path conventions:** Local images use relative paths (`figures/arch.svg`), theme assets use `/assets/...` prefix
- **Layout class directive placement:** `<!-- _class: layout-name -->` must be the first line after the slide separator
- **Speaker notes:** Use `<!-- ... -->` HTML comments. Must appear after all slide content.

---

## Claude Code Skills

### Skills included in MVP

| Skill | Status | MVP Changes |
|-------|--------|-------------|
| `/new-presentation` | Exists, needs update | Use `PRESENTATIONS_DIR` from .env, create `sections/`, `research/`, `images/`, `output/` dirs, create `sections/00-frontmatter.md` |
| `/generate-slides` | Exists, needs update | Write to `sections/*.md` instead of single slides.md. Plan section structure first, then generate each file. |
| `/build` | Exists, needs update | Run assemble + Makefile. Detect presentation dir from cwd. |
| `/inspect` | Exists, needs update | Must build first (to produce `slides.md`), then use `marp --images png` on assembled file |
| `/export-notes` | Exists, needs update | Parse `sections/*.md` directly, or require build first to work from assembled `slides.md` |
| `/commit` | Exists, works as-is | Standard git commit |

### Skills deferred

| Skill | Plan doc |
|-------|----------|
| `/generate-image` | plan/91 |
| `/research` | plan/02 |

### Skill update details

**`/new-presentation`**: Read `PRESENTATIONS_DIR` from `.env`. Create:
```
{PRESENTATIONS_DIR}/{date}-{slug}/
  synopsis.md             # content brief (audience, key messages, structure)
  sections/
    00-frontmatter.md     # pre-filled with theme, paginate, html, header
  research/
  images/figures/
  images/generated/
  output/
```
No longer creates `slides.md` directly -- that is now a build artifact assembled from `sections/`. The skill suggests running `/generate-slides` after editing `synopsis.md`.

**`/generate-slides`**: Instead of writing one `slides.md`, write multiple `sections/*.md` files:
1. Read `guide.md` for layout class reference
2. Read writing rules from `.claude/rules/`
3. Plan the section structure (which sections, how many slides each)
4. Generate each section file with correct `---` separators between slides within the file
5. Each content slide gets speaker notes
6. Insert `<!-- img-needed: "description" -->` markers where images would help (for later `/generate-image` runs, deferred to plan/91). Do NOT invoke `/generate-image` in MVP.
7. Run `/build html` to verify

**`/build`**: 
1. Detect presentation directory (look for `sections/` in cwd or parent)
2. Run: `make -C "$TEMPLATE_DIR" $FORMAT DIR="$PRESENTATION_DIR" THEME="${THEME:-bai-flat}"`
3. Fallback if engine not set up: `cat sections/*.md > slides.md && npx marp --html --allow-local-files slides.md -o output/slides.html` (crude assembly + direct marp invocation)

**`/inspect`**: Run `/build` first to ensure `slides.md` exists, then run `npx marp --images png` on the assembled file. Update path detection to use `slides.md` at presentation root.

**`/export-notes`**: Parse `sections/*.md` directly (extract `<!-- ... -->` comment blocks that follow slide content). No need for an assembled file since speaker notes are in the section sources.

---

## What Happens to Existing Files

### Delete (Phase 5, after extraction verified)
- `samples/` -- engine, theme, and scripts extracted into `engine/` and `themes/`. Agent-briefing and writing-signs content absorbed into `.claude/rules/` and `CLAUDE.md`. Original repo URLs noted in CLAUDE.md for reference.

### Keep
- `research/` -- repo-level research about the harness itself (Marp, Slidev, tools, architecture patterns)
- `.claude/` -- skills, agents, rules. Update paths and content.
- `CLAUDE.md` -- update with new directory structure and conventions
- `plan/` -- plan documents

### Create
- `Makefile` -- at repo root
- `engine/` -- marp.config.js, scripts/
- `themes/bai-flat/` -- theme.css + assets/
- `package.json` -- marp-cli + markdown-it-cjk-friendly
- `.env.example` -- template for PRESENTATIONS_DIR
- `.gitignore` -- .env, node_modules/, output/
- `guide.md`, `starter.md` -- copied from samples

---

## Implementation Phases

### Phase 1: Engine extraction and setup

Extract and set up the build infrastructure. After this phase, you can build a presentation from sections.

1. Create `package.json` at repo root with `@marp-team/marp-cli` and `markdown-it-cjk-friendly` as devDependencies
2. Create `Makefile` at repo root (based on gpu-pooling sample):
   - Adapt for new layout: THEME param, THEME_DIR derived from `themes/$(THEME)`, section assembly step
   - Use `npx marp` instead of bare `marp`
   - Add `setup` target (`npm install`)
   - Config path points to `engine/marp.config.js`
   - Scripts path points to `engine/scripts/`
3. Extract engine files from gpu-pooling sample into `engine/`:
   - `marp.config.js` -- two changes: (a) replace hardcoded `TEMPLATE_ASSETS_DIR = path.resolve(__dirname, "assets")` with `THEME_ASSETS_DIR = path.join(process.env.THEME_DIR || path.resolve(__dirname, "../themes/bai-flat"), "assets")` -- this affects BOTH `resolveImagePaths` (markdown `/assets/...` paths) and CSS asset references; (b) add `markdown-it-cjk-friendly` plugin: `marp.use(require('markdown-it-cjk-friendly'))`
   - `scripts/marp-postprocess.js` -- copy, then update default `themeDir` fallback from `path.resolve(__dirname, '..', 'bai-flat')` to `path.resolve(__dirname, '../../themes/bai-flat')` (or make `--theme-dir` required)
   - `scripts/merge-theme.js` -- copy, then fix `resolveBaseUrls` to resolve ALL relative `url()` paths against theme dir (not just `../` prefixed ones). Rename `--template-dir` flag to `--theme-dir`. Keep `--slides-dir` for local theme overrides.
   - `scripts/assemble-sections.sh` -- new script (see spec above), outputs to presentation root (not output/)
4. Extract bai-flat theme into `themes/bai-flat/`:
   - `theme.css` -- copy from sample, fix `url()` paths from `url("../assets/...")` to `url("assets/...")`
   - `assets/` -- copy entire assets directory tree from sample
   - `image-style.md` -- create with style direction for bai-flat
5. Copy `guide.md` and `starter.md` from samples to repo root
6. Create `.env.example` with `PRESENTATIONS_DIR=~/Documents/Presentation/presentations`
7. Create `.env` at repo root (gitignored) with actual local path
8. Add `.env`, `node_modules/`, `**/output/` to `.gitignore`. Note: `slides.md` (assembled build artifact) lives in the external presentations dir, not in this repo. The `clean` target should remove it along with `output/`. If presentations are ever git-tracked separately, their `.gitignore` should include `slides.md` and `output/`.
9. Absorb engine-specific gotchas from `samples/marp-template/demo/research/agent-briefing.md` into CLAUDE.md (two-col div blank lines, four-box syntax, image paths, layout directive placement)
10. Run `npm install`
11. **Verify:** Create a minimal test presentation with 3 sections, build to HTML, confirm it renders correctly with theme assets

### Phase 2: Skills and demo presentation

Update skills for the new structure and validate with a real presentation.

1. Update `/new-presentation` skill: `.env` reading, `sections/` structure, `00-frontmatter.md` + `synopsis.md` creation, no direct `slides.md`
2. Update `/generate-slides` skill: multi-section output, section planning step, correct `---` handling, remove `/generate-image` invocation (deferred to plan/91), keep `<!-- img-needed -->` markers
3. Update `/build` skill: `make -C "$TEMPLATE_DIR"` invocation (NOT `make -f engine/Makefile`), fallback with crude cat-based assembly
4. Update `/inspect` skill: ensure `/build` runs first, reference `slides.md` at presentation root
5. Update `/export-notes` skill: parse `sections/*.md` directly for speaker notes
6. Create a demo presentation using `/new-presentation` + `/generate-slides` to validate the full pipeline
7. Update CLAUDE.md:
   - Remove `presentations/` from repo directory tree (presentations are external via `.env`)
   - Move Makefile out of `engine/` description (it is at repo root)
   - Update build examples to use `make html DIR=...` (not `make -f engine/Makefile`)
   - Add engine gotchas section
   - Update skill table with new statuses

### Phase 3: Research / knowledge base

See plan/02-research-system.md.

### Phase 4: Writing rules enhancement

See plan/03-writing-rules-enhancement.md. Includes:
- Expand Korean and English writing rules with anti-AI patterns from demo/research/
- Add cross-language rules
- Add self-check checklist
- Absorb remaining agent-briefing.md content into rules files
- Before/after examples in rules

### Phase 5: Cleanup

1. Delete `samples/` directory (after verifying all content has been extracted or absorbed)
2. Final CLAUDE.md update with all conventions
3. Verify all skills work end-to-end
4. Note original sample repo URLs in CLAUDE.md for historical reference

---

## Plan File Index

Plan files are numbered by implementation order for the MVP (01-05), with 91+ reserved for far-future items:

| # | File | Status | Depends on |
|---|------|--------|------------|
| 01 | MVP (this file) | Draft | -- |
| 02 | Research system | Draft | 01 Phase 1-2 |
| 03 | Writing rules enhancement | Ready | Independent |
| 04 | Content assets (image fetch, Mermaid) | TODO | 01 Phase 1-2 |
| 05 | Build variants (vendor/whitelabel) | Deferred | 01 Phase 1-2 |
| 06 | GitHub Pages deployment | TODO | 01 Phase 1-2 |
| 91 | Gemini image generation | Blocked | 01 Phase 1-2 |
| 92 | Slidev integration | Deferred | 01 |

Implementation order: MVP Phase 1 -> MVP Phase 2 -> (plan docs 02-05 can proceed independently after Phase 2) -> MVP Phase 4 (writing rules) -> MVP Phase 5 (cleanup, must be last).

---

## Resolved Items

- **Section frontmatter**: Separate `00-frontmatter.md` file containing only the YAML block. Keeps frontmatter out of title slide content and simplifies assembly.
- **Separator handling in sections**: Claude Code writes the `---` separators within section files. `assemble-sections.sh` only handles the join between files.
- **marp-cli install**: Local devDependency via package.json, invoked with `npx marp`. No global install needed. `make setup` runs `npm install`.
- **CJK bold rendering**: Fixed with `markdown-it-cjk-friendly` plugin in Phase 1 (not deferred). No `<b>` tag workaround needed.
- **Asset path resolution**: `marp.config.js` reads `THEME_DIR` from env, resolves `/assets/...` to `THEME_DIR/assets/`. Makefile sets `THEME_DIR` based on `THEME` parameter.
- **Build variants**: Deferred to plan/04. Not needed for MVP.
- **Gemini CLI image gen**: Deferred to plan/91. MVP uses manually sourced images or Mermaid diagrams.
- **Research system**: Deferred to plan/02. MVP `/generate-slides` works without research docs.
- **`samples/` deletion**: After extraction is verified in Phase 5. Agent-briefing and writing-signs content absorbed into rules and CLAUDE.md first.
- **CSS `url()` path rewriting**: The original `merge-theme.js` `resolveBaseUrls` only matches `url("../...")`. After restructuring (assets inside theme dir), paths become `url("assets/...")`. Fix: generalize `resolveBaseUrls` to resolve ALL relative urls against the theme dir, same pattern as `resolveLocalUrls`. Rename `--template-dir` to `--theme-dir`.
- **Makefile location**: Repo root, not `engine/`. `package.json` is also at repo root. No `cd` gymnastics needed for `make setup`.
- **`.env` location**: Repo root (gitignored). `.env.example` committed as template.
- **`package-lock.json`**: Committed for reproducible builds.
- **Assembled `slides.md` location**: Presentation root (next to `images/`, `sections/`), NOT inside `output/`. Marp resolves image paths relative to the source file. If `slides.md` were in `output/`, all relative image paths would break. The `clean` target removes both `output/` and `slides.md`.
- **`resolveImagePaths` in marp.config.js**: Also uses `THEME_ASSETS_DIR` (for `/assets/...` markdown images), not just CSS. Must be updated alongside the CSS asset path changes.
- **`marp-postprocess.js` fallback path**: Default `themeDir` resolves wrong after file relocation. Updated to `../../themes/bai-flat` or made a required argument.
- **Section naming convention**: First file must use `00-` prefix for the assembler to detect frontmatter correctly. Documented in the assemble-sections.sh spec.
- **`/inspect` and `/export-notes`**: Both need updates for the new structure (no `slides.md` in presentation root until build runs). Not "works as-is" as originally stated.
- **`/generate-slides` image generation**: `/generate-image` invocation removed for MVP. Skill inserts `<!-- img-needed -->` markers instead.
- **`/new-presentation` synopsis.md**: Still created. `slides.md` is no longer created directly (it's a build artifact).
- **`/build` fallback**: Updated to do crude cat-based section assembly before calling marp directly.
- **CommonJS requirement**: `package.json` must not set `"type": "module"` because engine scripts use `require()`.
- **THEME_DIR env var passthrough**: Makefile explicitly sets `THEME_DIR=$(THEME_DIR)` in the marp invocation line. Neither sample Makefile does this -- it's new.
