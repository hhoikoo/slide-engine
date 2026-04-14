# Presentations Repository and GitHub Pages Deployment

> Status: TODO
> Priority: Post-MVP
> Depends on: MVP (build system must work)

## Overview

The presentations directory (`PRESENTATIONS_DIR`) becomes its own git repository. Each presentation lives on a dedicated branch, with worktrees enabling concurrent work on multiple presentations. GitHub Pages serves the built HTML.

## Repository model

```
presentations/                    # git repo, private
├── .gitignore                    # slides.md, output/, images/generated/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Build + deploy to Pages
└── (empty on main -- presentations live on branches)
```

Each presentation is a branch:
```
branch: 2026-04-gpu-pooling
└── 2026-04-gpu-pooling/
    ├── synopsis.md
    ├── sections/
    ├── research/
    ├── images/
    └── output/
```

The main branch holds only repo-level config (`.gitignore`, `.github/`, optional `README.md`). Presentation content lives exclusively on named branches.

### Why branch-per-presentation

- **Worktrees**: each branch gets its own worktree on disk, so multiple presentations can be checked out simultaneously. This enables concurrent Claude Code sessions -- one per worktree, no git lock conflicts.
- **Isolation**: changes to one presentation never touch another. No merge conflicts between unrelated talks.
- **Deployment**: Pages can deploy from any branch, or a GH Action can aggregate built HTML from all branches into a deploy branch.
- **History**: each presentation has a clean, independent commit history on its branch.

### Worktree layout

```
~/Documents/Presentation/
├── template-gen/                          # engine repo
├── presentations/                         # main branch (repo config only)
├── presentations--2026-04-gpu-pooling/    # worktree for gpu-pooling branch
├── presentations--2026-05-webassembly/    # worktree for webassembly branch
└── ...
```

Naming convention: `presentations--{branch-name}` for worktrees. The `--` separator distinguishes worktrees from other directories.

Creating a worktree:
```bash
cd ~/Documents/Presentation/presentations
git worktree add ../presentations--2026-04-gpu-pooling 2026-04-gpu-pooling
```

## Skills changes

### `/new-presentation` updates

Current behavior: creates a folder in `PRESENTATIONS_DIR`. New behavior:

1. Read `PRESENTATIONS_DIR` from `.env` (still the base repo path)
2. Generate branch name from topic: `{date}-{slug}` (e.g., `2026-04-gpu-pooling`)
3. Create the branch from main: `git -C $PRESENTATIONS_DIR branch {branch-name}`
4. Create a worktree: `git -C $PRESENTATIONS_DIR worktree add ../{worktree-dir} {branch-name}`
5. Scaffold the presentation directory inside the worktree (same structure as now)
6. Initial commit on the branch: `git -C {worktree-dir} add -A && git commit -m "scaffold {topic}"`
7. Report the worktree path and suggest: `cd {worktree-path}` then edit synopsis.md

### New skill: `/list-presentations`

Lists all presentations (branches + worktrees):

1. `git -C $PRESENTATIONS_DIR branch --list` to show all presentation branches
2. `git -C $PRESENTATIONS_DIR worktree list` to show active worktrees
3. Display as a table: branch name, worktree path (if checked out), last commit date

### New skill: `/open-presentation`

Switch to / check out an existing presentation:

1. Argument: branch name or partial match
2. If worktree already exists for that branch, report its path
3. If no worktree, create one: `git worktree add ../{worktree-dir} {branch-name}`
4. Report the path and suggest `cd {worktree-path}`

### New skill: `/close-presentation`

Remove a worktree (not the branch):

1. Argument: branch name
2. Verify no uncommitted changes in the worktree
3. `git -C $PRESENTATIONS_DIR worktree remove {worktree-dir}`
4. Report success. The branch and its history remain intact.

### `/build` updates

No fundamental changes. The build still runs from the presentation directory (now a worktree). The template-gen engine path is resolved from `.env` or hardcoded.

One addition: after building, optionally commit the output to the branch. This enables the deployment pipeline to pick up built HTML. Add a `--commit` flag or make it configurable.

### `/deploy` (new skill)

Build and push a presentation for deployment:

1. Run `/build html`
2. Commit output/ to the branch (if not already committed)
3. Push the branch to remote
4. Report the Pages URL

## GitHub Pages deployment

### Option A: Per-branch deployment (simple)

Configure GitHub Pages to deploy from a specific branch. Each presentation gets its own Pages URL via branch-based deployment. Limited by GitHub's single-branch Pages constraint -- only one presentation live at a time unless using custom routing.

### Option B: Aggregation branch (recommended)

A GitHub Action collects built HTML from all presentation branches into a single `gh-pages` branch:

```yaml
name: Deploy Presentations
on:
  push:
    branches: ['20*']  # triggers on any presentation branch push

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: gh-pages
          fetch-depth: 0

      - name: Checkout source branch
        uses: actions/checkout@v4
        with:
          path: source

      - name: Copy built HTML
        run: |
          PRES_DIR=$(ls -d source/20*/ | head -1)
          PRES_NAME=$(basename "$PRES_DIR")
          mkdir -p "$PRES_NAME"
          cp "$PRES_DIR/output/slides.html" "$PRES_NAME/index.html"

      - name: Commit and push
        run: |
          git add .
          git commit -m "deploy: $PRES_NAME" || true
          git push
```

Result: `https://user.github.io/presentations/2026-04-gpu-pooling/` serves the slides.

The action does NOT run template-gen's build (that requires the engine repo). It copies pre-built HTML that was committed on the presentation branch. This keeps the CI simple and avoids cross-repo dependencies.

### Index page

The `gh-pages` branch gets a static `index.html` listing all deployed presentations with links. Generated by the GH Action after each deploy.

## `.env` changes

`PRESENTATIONS_DIR` continues to point to the base repo checkout (main branch). Worktrees live alongside it as siblings. Skills that need the base repo (branching, worktree management) use `PRESENTATIONS_DIR`. Skills that work on a specific presentation (build, generate-slides) detect the presentation from cwd.

## `.gitignore` for presentations repo

```
# Build artifacts
**/slides.md
**/output/

# AI-generated images (optional -- may want to track these)
# **/images/generated/

# OS files
.DS_Store
```

Note: `output/` is gitignored by default. The `/deploy` skill un-ignores it (via `git add -f`) when committing built HTML for Pages deployment. Alternatively, the GH Action can build from source if template-gen is available.

## Implementation order

1. Initialize presentations as a git repo with `.gitignore` and main branch
2. Update `/new-presentation` for branch + worktree workflow
3. Create `/list-presentations` skill
4. Create `/open-presentation` skill
5. Create `/close-presentation` skill
6. Update `/build` with optional output commit
7. Create `/deploy` skill
8. Set up GitHub Actions deployment (Option B)
9. Test full cycle: new -> generate -> build -> deploy -> view on Pages

## Open questions

- Should `output/` be committed on the presentation branch (simple, but bloats repo) or only on `gh-pages` (cleaner, but requires the GH Action to build)?
- Should images/generated/ be tracked? They're AI-generated and reproducible in theory, but regeneration may produce different results.
- Should there be a `/archive-presentation` that deletes both the branch and worktree? Or is branch deletion too destructive for a skill?
