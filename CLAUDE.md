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
│   └── p{NNN}/               # Opaque presentation ID
│       ├── sections/         # Slide files (00.md, 01.md, ...)
│       ├── research/         # Research docs (r00.md, r01.md, ...)
│       ├── images/figures/   # Figures (f00.svg, f01.png, ...) + INDEX.md
│       └── synopsis.md       # Topic and structure outline
├── public/                   # Deployed HTML + PDF (served by GitHub Pages)
├── docs/
│   └── guide.md              # Layout class reference
├── engine/
│   ├── marp.config.js        # Marp engine config
│   └── scripts/              # assemble, cite, mermaid, variant, theme merge, postprocess, lint-text
├── themes/bai-flat/          # CSS theme + assets
└── .claude/                  # Skills, agents, rules, output style
```

## Encryption

Presentation source content (`presentations/`) is encrypted via git-crypt. On GitHub the files appear as encrypted blobs. Locally, after `git-crypt unlock`, they are plaintext.

- git-crypt encrypts file **contents only, never paths**. Directory and file *names* under `presentations/` are visible in cleartext on GitHub. So every filename must itself be opaque (see Privacy below).
- `public/` is NOT encrypted (intentionally public artifacts; folder names there may reveal topic and that is acceptable)
- To set up on a new machine: `make setup` (installs git-crypt, gnupg, npm deps), then import the GPG key and `git-crypt unlock`
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

### Figure naming + INDEX.md

Every `images/figures/` folder holds opaquely-named figures (`f00.<ext>`, `f01.<ext>`, ...) plus an `INDEX.md` mapping each opaque name to a real description. `INDEX.md` is git-crypt encrypted, so descriptions there are safe. The opaque name is what authors reference from slides (`![alt](images/figures/f03.svg)`); `INDEX.md` is how you (or a human) recall what `f03.svg` actually is. When adding a figure: pick the next free `fNN`, drop the file in, and add a row to that folder's `INDEX.md`. The same opaque-name rule applies to any other content folder (`generated/`, etc.).

## Build

```bash
make html    DIR=presentations/{name} THEME=bai-flat
make pdf     DIR=presentations/{name} THEME=bai-flat
make html-wl DIR=presentations/{name} THEME=bai-flat  # whitelabel
make pdf-wl  DIR=presentations/{name} THEME=bai-flat  # whitelabel
make lint    DIR=presentations/{name}                 # check text against .claude/rules/
```

`make html` runs the text linter in warn-only mode first. `make lint` exits non-zero on hits. The script is `engine/scripts/lint-text.sh`; run it directly for a single file or with `-a` to include research and draft notes.

## Skills

| Skill | Usage |
|-------|-------|
| `/new-presentation <topic>` | Scaffold `presentations/{name}/` |
| `/list-presentations` | List presentations with deploy/PDF status |
| `/generate-slides [name]` | Generate slides from synopsis |
| `/build [format] [name]` | Compile slides |
| `/research <source>` | Add research docs |
| `/fetch-image <url>` | Download image to images/figures/ |
| `/deploy [name]` | Build + push HTML (+ optional PDF) to Pages |
| `/inspect [slide] [name]` | Visual screenshot + analysis |
| `/export-notes [name]` | Extract speaker notes |
| `/revise [name]` | Voice pass: run the linter, then the manual checks |
| `/diagram <what to show>` | Author, lint and grade a hand-built SVG figure |
| `/commit` | Git commit |

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

This project uses the `concise` output style (`.claude/output-styles/concise.md`). It owns chat response shape only; content voice lives in `.claude/rules/`. Output styles never reach subagents, so every agent `@`-imports what it needs: `concise.md` for all of them, plus the relevant writing rule for any agent that reads or writes prose.

## Delegation policy

When a skill or agent exists for a task, delegate to it.
