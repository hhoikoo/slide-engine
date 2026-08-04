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

## Output styles

- `name:` must match the filename stem exactly, including case, or the body is silently dropped ([#47482](https://github.com/anthropics/claude-code/issues/47482)).
- `keep-coding-instructions: true` whenever the style changes voice without replacing the role. The default `false` removes Claude Code's built-in engineering guidance, and this repo builds scripts, themes and linters.
- Output styles never reach subagents. An agent that writes prose must `@`-import the rules it needs.
