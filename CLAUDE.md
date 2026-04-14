# Presentation Generation Harness

Marp-based presentation generation system with theme support, sectioned slide authoring, and Claude Code integration.

## Layout

```
template-gen/
├── CLAUDE.md
├── .env                      # PRESENTATIONS_DIR (gitignored)
├── .github/workflows/
│   └── deploy-pages.yml      # Deploy public/ to GitHub Pages
├── Makefile                  # make html/pdf DIR=... THEME=...
├── package.json              # marp-cli + markdown-it-cjk-friendly
├── public/                   # Deployed presentation HTML (served by Pages)
├── docs/
│   └── guide.md              # Layout class reference (read by /generate-slides)
├── engine/
│   ├── marp.config.js        # Marp engine config
│   └── scripts/              # assemble, cite, mermaid, variant, theme merge, postprocess
├── themes/bai-flat/          # CSS theme + assets
├── .claude/                  # Skills, agents, rules
└── plan/                     # Plan documents
```

## Presentations Repository

Presentations live in a separate private repo (`slides`) configured via `PRESENTATIONS_DIR` in `.env`.

- `main` branch: archive of all finalized presentations
- Presentation branches: ephemeral workspaces, named `{YYYY-MM}-{slug}`, merged into main via PR when done
- Worktrees: `$PRESENTATIONS_DIR/.worktrees/{branch-name}`

Deployment: `/deploy` copies built HTML to `public/{name}/index.html` on this repo, pushes, and GitHub Actions deploys to Pages.

## Build

```bash
make html    DIR=/path/to/presentation THEME=bai-flat
make pdf     DIR=/path/to/presentation THEME=bai-flat
make html-wl DIR=/path/to/presentation THEME=bai-flat  # whitelabel
make pdf-wl  DIR=/path/to/presentation THEME=bai-flat  # whitelabel
```

## Skills

| Skill | Usage |
|-------|-------|
| `/new-presentation <topic>` | Create branch + worktree + scaffold |
| `/list-presentations` | List all branches and active worktrees |
| `/open-presentation <name>` | Create worktree for existing branch |
| `/close-presentation <name>` | Remove worktree (keeps branch) |
| `/generate-slides [name]` | Generate slides from synopsis |
| `/build [format] [name]` | Compile slides |
| `/research <source>` | Add research docs to knowledge base |
| `/fetch-image <url>` | Download image to images/figures/ |
| `/pr-presentation [name]` | Create PR to merge into main |
| `/deploy [name]` | Build + push to Pages |
| `/inspect [slide] [name]` | Visual screenshot + analysis |
| `/export-notes [name]` | Extract speaker notes |
| `/commit` | Git commit |

## Agents

| Agent | Use for |
|-------|---------|
| `claude-code-guide` | Claude Code docs/features lookup |
| `web-researcher` | Online research (sonnet) |
| `cross-project-researcher` | Explore sibling projects in ~/Developer/ |

## Delegation Policy

When a skill or agent exists for a task, delegate to it.
