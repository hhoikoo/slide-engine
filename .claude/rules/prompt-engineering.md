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
