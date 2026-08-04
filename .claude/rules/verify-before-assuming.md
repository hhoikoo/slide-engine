---
paths:
  - "**/*"
---
# Verify Before Assuming

Never rely on memory or training data when a definitive source is available. Look it up. Guessing leads to broken scripts, wrong API calls, and misleading explanations.

## General Principle

If a claim is not trivially obvious, verify it before stating it or acting on it.

- **Library APIs and behavior**: Read the actual source or docs. Do not guess function signatures, parameter names, return types, or default values.
- **External projects and repos**: Use web search, `gh`, or fetch the repo's docs before making claims about how another project works.
- **Standards and protocols**: Look up the spec or authoritative reference rather than paraphrasing from memory.
- **Non-programming facts**: When the user asks about something outside of code, search the web or consult authoritative sources rather than generating an answer from training data alone. Flag uncertainty explicitly if verification is not possible.

## Claude Code surface details

Never guess frontmatter fields, hook events, settings keys, tool names, or permission syntax. They change between releases.

1. `claude-code-guide` subagent (via Agent): preferred for a specific question.
2. `WebFetch` against `https://code.claude.com/docs/en/<page>`. Common pages: `skills`, `sub-agents`, `hooks`, `mcp`, `plugins`, `memory`, `settings`, `permissions`, `cli-reference`, `output-styles`.
3. `WebSearch` with `site:code.claude.com/docs/en/`.

The fetched page is the source of truth. Do not paraphrase from training data.

## Project-Specific Sources of Truth

| Information needed | Check this |
|-------------------|------------|
| Layout classes | `docs/guide.md` |
| Theme CSS variables | `themes/*/theme.css` |
| Build commands | `Makefile` |
| Engine features | `engine/marp.config.js` |
| Writing rules | `.claude/rules/writing-core.md` first, then `writing-{en,ko,shortform}.md` |
| Punctuation and dashes | `.claude/rules/text-syntax.md` |
| What the linter checks | `engine/scripts/lint-text.sh` |
