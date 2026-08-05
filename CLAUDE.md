# Slide Engine

Marp-based presentation generation system with theme support, sectioned slide authoring, and Claude Code integration.

## Layout

```
slide-engine/
├── CLAUDE.md
├── .gitattributes            # git-crypt filter rules
├── .github/workflows/
│   └── deploy-pages.yml      # Deploy public/ to GitHub Pages
├── Makefile                  # make html/pdf DIR=... THEME=...
├── package.json              # marp-cli + markdown-it-cjk-friendly
├── presentations/            # git-crypt encrypted (private source content)
│   ├── index.md              # ID-to-name mapping (encrypted)
│   └── p{NNN}/               # Opaque presentation ID; see docs/deck-lifecycle.md
├── public/                   # Deployed HTML + PDF (served by GitHub Pages)
├── docs/
│   ├── deck-lifecycle.md     # Deck folder shape, slide/figure identity, artifact schemas
│   └── guide.md              # Layout class reference
├── engine/
│   ├── marp.config.js        # Marp engine config
│   └── scripts/              # assemble, cite, mermaid, variant, theme merge, postprocess, lint-text, mocks, deck-status
├── themes/bai-flat/          # CSS theme + assets
└── .claude/                  # Skills, agents, rules, output style
```

`docs/deck-lifecycle.md` is the single authority on what a deck folder contains and what each artifact means. Nothing else restates it.

## Encryption

Presentation source content (`presentations/`) is encrypted via git-crypt. On GitHub the files appear as encrypted blobs. Locally, after `git-crypt unlock`, they are plaintext.

- git-crypt encrypts file **contents only, never paths**. Directory and file *names* under `presentations/` are visible in cleartext on GitHub. So every filename must itself be opaque (see Privacy below).
- `public/` is NOT encrypted (intentionally public artifacts; folder names there may reveal topic and that is acceptable)
- To set up on a new machine: `make setup` (installs git-crypt, gnupg, fswatch, npm deps), then import the GPG key and `git-crypt unlock`
- Backup symmetric key is at `~/.gnupg/slide-engine-git-crypt.key`

## Privacy (CRITICAL)

The git-crypt encryption is meaningless if the topic leaks through unencrypted surfaces. **Never write what a deck is about anywhere outside `presentations/` and `public/`.**

Unencrypted surfaces that MUST stay opaque:

- **Commit messages**: refer to decks by opaque ID only (`p007`), never by topic. Bad: `Add p007: CXL KVCache offload benchmark deck`. Good: `Add p007` or `Update p007 sections`.
- **Branch names**: use IDs or generic verbs (`p007-edits`, `fix-build`), never topic keywords.
- **PR titles and bodies**: same rule. Topic words belong inside the encrypted files only.
- **File names outside `presentations/`**: scripts, configs, issues should not embed topic strings.
- **File names INSIDE `presentations/`**: git-crypt does not encrypt paths, so these leak too. Use opaque names only: `sections/00.md`, `research/r00.md`, `images/figures/f00.svg`. Never name a figure `microwave-vs-fiber.svg` or `kvcache-arch.png`.
- **Tags, release notes, anything pushed to the remote**: opaque IDs only.

The `/commit` skill and any commit message you author MUST follow this. If unsure whether a word leaks the topic, omit it.

Opaque names are allocated and recorded through the deck's own registry, not by picking a filename. See `docs/deck-lifecycle.md`, Figure identity.

## Build

```bash
make html    DIR=presentations/{name} THEME=bai-flat
make pdf     DIR=presentations/{name} THEME=bai-flat
make html-wl DIR=presentations/{name} THEME=bai-flat  # whitelabel
make pdf-wl  DIR=presentations/{name} THEME=bai-flat  # whitelabel
make lint    DIR=presentations/{name}                 # check text against .claude/rules/
make mocks   DIR=presentations/{name}                 # render draft/mocks/ to images/mocks/
make watch   DIR=presentations/{name}                 # rebuild HTML on every source change
```

`make html` runs the text linter in warn-only mode first. `make lint` exits non-zero on hits. The script is `engine/scripts/lint-text.sh`; run it directly for a single file, with `-a` to include research and draft notes, or with `--gate` to fail only on the machine-decidable classes (provenance, punctuation, SVG labels).

`engine/scripts/deck-status.sh [--porcelain] [pNNN]` reports which pipeline phase each deck is at, derived from what is on disk.

## Skills

A deck is built in five phases, one skill each, each in its own fresh session. Every phase writes its output to disk and ends at a user gate, so the process is recoverable from a cold start. `docs/deck-lifecycle.md` is the authority on what each phase produces; `engine/scripts/deck-status.sh` says where a deck currently is.

| Phase | Skill | Produces |
|---|---|---|
| 1 | `/deck-plan <topic \| pNNN>` | `synopsis.md`, `draft/outline.md`, `draft/decisions.md`, `draft/figures.md` |
| 2 | `/deck-draft [pNNN]` | `sections/NN.md` with all structural layout |
| 3 | `/deck-mock [pNNN]` | `draft/mocks/fNN.excalidraw`, `images/mocks/fNN.svg` |
| 4 | `/deck-figures [pNNN]` | `images/figures/fNN.*`, `images/figures/INDEX.md` |
| 5 | `/deck-polish [pNNN]` | fine-tuning against the render |

Standalone:

| Skill | Usage |
|-------|-------|
| `/list-presentations` | Every deck with its phase, next command and deploy status |
| `/build [format] [name]` | Compile slides |
| `/research <source>` | Add research docs |
| `/diagram <what to show>` | Author, lint and grade one hand-built SVG figure |
| `/fetch-image <url>` | Download an image into the `fNN` reserved for it |
| `/revise [name]` | Voice pass: run the linter, then the manual checks |
| `/inspect [slide] [name]` | Visual screenshot + analysis |
| `/deploy [name]` | Build + push HTML (+ optional PDF) to Pages |
| `/commit` | Git commit |

Decks written before the pipeline report `phase=legacy`. They are frozen: not retrofitted, not migrated, and no `/deck-*` skill will touch one.

## Writing rules

Writing or revising slide text means following the active rules in `.claude/rules/`, not approximating them from memory.

| File | Loads | Owns |
|---|---|---|
| `writing-core.md` | **at launch, always** | register table, honesty bar, the twenty always-on rules, deck structure, worked exemplars |
| `writing-en.md` | on reading a `.md` | English long tail, two-column do/instead tables |
| `writing-ko.md` | on reading a `.md` | Korean long tail, split by register (bullets vs notes) |
| `writing-shortform.md` | on reading `.svg`, `INDEX.md`, `.yaml`, a deck `.md` | diagram labels, box headers, table cells, alt text |
| `text-syntax.md` | on any file | all punctuation and dashes, encoding, provenance blocklist |

Only `writing-core.md` has no `paths:` frontmatter, so it is the one file guaranteed to be in context at generation time and after `/compact`. The others are path-scoped and lazy.

Enforcement is `engine/scripts/lint-text.sh` (mechanical, ~80% of the corpus) plus `/revise` (the rest).

## Output style

This project uses the `concise` output style (`.claude/output-styles/concise.md`). It owns chat response shape only; content voice lives in `.claude/rules/`. Output styles never reach subagents and an `@`-import in an agent definition does not load, so every agent opens with a `Read first` list: `concise.md` for all of them, plus the relevant writing rule for any agent that reads or writes prose. See `.claude/rules/prompt-engineering.md`.

## Delegation policy

When a skill or agent exists for a task, delegate to it.
