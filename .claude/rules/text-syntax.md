---
paths:
  - "**/*"
---
# Text Syntax

## Encoding

- **ASCII only** in code, comments, docstrings, commit messages, and configuration files. Use plain ASCII equivalents (`--`, `->`, `-`, etc.) instead of em dashes, special arrows, or other Unicode punctuation.
- **Exceptions**: tree-drawing characters in diagrams, natural-language content such as author names, and internationalized user-facing strings (Korean slide content, etc.).

## Formatting

- **No manual line wrapping** in prose (markdown, docstrings, comments, config). Write single long lines and let the editor or renderer handle wrapping. Only break lines where semantically meaningful (e.g. list items, paragraph breaks).
