---
paths:
  - "engine/**/*"
  - "**/*.sh"
  - "**/*.js"
---
# Code conventions

## Constants and configuration

- No hardcoded values. Use constants or configuration.
- Config values that vary by environment must be configurable (env vars, config files), not compiled in.

## Function signatures

- Avoid long positional parameter lists.
- For functions that take many related values, group them into a config or options object.

## Error handling

- Catch errors at appropriate boundaries.
- Never swallow errors silently. At minimum, log them.
- Error messages should include enough context to diagnose the problem without reading the source.

## Comments

- Explain *why*, not *what*. If code needs a comment to explain what it does, make the code readable instead.
- No change-narration (`was X, now Y`, `updated to use new approach`).
- No meta-commentary (`this function handles`, `here we`, `the following code`).
- No defensive annotations after a fix. Fix the bug; do not leave a note telling the next reader not to repeat it.
- No commented-out code. Delete it; git has the history.
- No TODO without context. Say what and why.
- No reference to the current task (`added for issue #123`).
- No avoidance notes (`chose Y instead of X because user said Z`).
- No phase numbers (`Phase 3 wiring`). Code reads as if written in one pass.
- No AI narration in any written artifact: `Let's`, `Great`, `I'll now`, `Here's what I did`, `while preserving the original structure`.
