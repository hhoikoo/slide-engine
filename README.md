# Presentation Generation Harness

**Slides:** https://hhoikoo.github.io/slide-engine/

Marp-based slide build system with theme support and Claude Code integration.

## Setup

```bash
make setup   # npm install
```

## Build

```bash
make html DIR=/path/to/presentation THEME=bai-flat
make pdf  DIR=/path/to/presentation THEME=bai-flat
```

Presentations live outside this repo (configured via `.env`). Each presentation has a `sections/` directory with numbered markdown files that get assembled into `slides.md` at build time.

## Structure

```
engine/          Marp config and build scripts
themes/bai-flat/ Theme CSS and assets
docs/guide.md         Layout class reference
starter.md       Starter template with examples
```

## Presentation Layout

```
sections/
  00-frontmatter.md   YAML frontmatter (theme, header, etc.)
  01-title.md         Title slide
  02-content.md       Content slides (separated by ---)
  ...
```

See `docs/guide.md` for available slide layout classes.
