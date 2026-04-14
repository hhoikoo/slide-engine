# GitHub Pages Deployment

> Status: TODO
> Priority: Post-MVP
> Depends on: MVP (build system must work)

## Concept

Marp HTML output is a single self-contained file (~200-500KB, all CSS/JS/assets inlined). It can be hosted on GitHub Pages directly.

## Options

### Option A: Manual deploy via /deploy skill

A Claude Code skill that:
1. Builds HTML
2. Copies to `docs/` or a `gh-pages` branch
3. Pushes to remote

### Option B: GitHub Actions auto-deploy

A workflow that triggers on push to `main`, builds all presentations, and deploys to Pages.

```yaml
name: Build and Deploy Slides
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g @marp-team/marp-cli
      - run: make html DIR=presentations/my-talk THEME=bai-flat
      - uses: peaceiris/actions-gh-pages@v4
        with:
          publish_dir: ./presentations/my-talk/output
```

### Option C: Per-presentation repo Pages

Since presentations live in separate private repos, each repo can have its own Pages deployment. The template repo doesn't need Pages.

## Recommended approach

Option C for private slides (each presentation repo deploys independently).
Option B for any public presentations.
