---
paths:
  - ".claude/**/*.md"
  - ".claude/**/*.json"
---
# Prompt Engineering Conventions

Rules for writing and maintaining agent definitions, skill files, and hooks.

## Quality Rules

- No hallucinated tools. Every tool referenced in an agent or skill must actually exist.
- No conflicting instructions. If two files disagree, the more specific one wins (skill > agent > rule).
- Prompts are code. Review them with the same rigor as source code.
- Every frontmatter field must be a real field supported by Claude Code. Do not invent fields.
- When unsure about Claude Code features, launch a `claude-code-guide` agent rather than guessing.

## `@`-imports

**A `SKILL.md` expands `@path`. An agent definition does not.** In a skill the path resolves from the repo root, so `@docs/deck-lifecycle.md` loads that file. The same line in `.claude/agents/*.md` is inert: the agent starts without it and nothing warns you.

So an agent names the files it needs under a `Read first` list and reads them itself. Two things reach an agent without being read: a `.claude/rules/*.md` with no `paths:` frontmatter, which loads everywhere, and a path-scoped rule, which loads once the agent reads a file the pattern matches. Everything else has to be an explicit Read.

Verify a change to any of this against a throwaway probe agent rather than against this paragraph.

## Output styles

- `name:` must match the filename stem exactly, including case, or the body is silently dropped ([#47482](https://github.com/anthropics/claude-code/issues/47482)).
- `keep-coding-instructions: true` whenever the style changes voice without replacing the role. The default `false` removes Claude Code's built-in engineering guidance, and this repo builds scripts, themes and linters.
- Output styles never reach subagents. An agent that writes prose reads the style file as its first step.
