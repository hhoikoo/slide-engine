---
paths:
  - "engine/**/*"
  - "**/*.sh"
  - "**/*.js"
---
# Code Conventions

## Constants and Configuration

- No hardcoded values -- use constants or configuration.
- Config values that vary by environment must be configurable (env vars, config files), not compiled in.

## Function Signatures

- Avoid long positional parameter lists.
- For functions that take many related values, group them into a config or options object.

## Error Handling

- Catch errors at appropriate boundaries.
- Never swallow errors silently -- at minimum, log them.
- Error messages should include enough context to diagnose the problem without reading the source code.

## Dead Code

- No commented-out code -- delete it; git has history.
