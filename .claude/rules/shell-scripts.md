---
paths:
  - "engine/scripts/*.sh"
  - ".claude/**/*.sh"
---
# Shell Script Conventions

## Header

Every script starts with:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

## Behavior

- Idempotent. Running a script twice with the same inputs produces the same result.
- No interactive prompts. Scripts must work unattended.

## Security

- Never log secrets or tokens.
- Quote all variable expansions: `"${var}"`, not `$var`.

## Dependencies

Assumed available: `jq`, `git`, `gh`, `node`, `marp`. Document any additional dependencies in a comment at the top of the script.
