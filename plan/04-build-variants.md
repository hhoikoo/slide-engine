# Build Variants (Vendor / Whitelabel)

> Status: Deferred
> Priority: Nice-to-have, post-MVP
> Depends on: MVP (01-mvp.md Phase 1-2 complete)

## Overview

Build variants allow a single `slides.md` (or assembled sections) to produce multiple output versions with different branding and terminology. The primary use case is producing a "vendor" version (with company branding) and a "whitelabel" version (brand-neutral) from the same source.

## How It Works

### Marker syntax in slide content

```markdown
<!-- vendor-start -->
Content only included in the vendor (branded) build
<!-- vendor-end -->
<!-- whitelabel-start -->
Content only included in the whitelabel build
<!-- whitelabel-end -->
```

Content outside any markers appears in both versions.

### build-variant.sh

A preprocessor script that runs before Marp:

- **Vendor build**: strips `whitelabel-start/end` blocks, removes `vendor-start/end` markers (keeps content)
- **Whitelabel build**: strips `vendor-start/end` blocks, removes `whitelabel-start/end` markers (keeps content), applies term substitutions

### Term substitutions (whitelabel)

The script does sed-based term replacement for the whitelabel variant:

```
Backend.AI Manager -> Pooling Manager
Backend.AI Agent   -> Pooling Agent
Backend.AI         -> Pooling platform
Company Name       -> Platform Operator
```

These substitution rules are hardcoded in the script per-project. A future improvement could externalize them to a config file.

## Makefile Targets

```bash
make html        # vendor version
make html-wl     # whitelabel version
make pdf         # vendor PDF
make pdf-wl      # whitelabel PDF
make all         # both versions
```

## Source

The working implementation exists in `samples/2026-univ-gpu-pooling-project-slide/scripts/build-variant.sh`. The gpu-pooling Makefile shows how the variant targets integrate with the build pipeline.

## Implementation Plan

1. Copy `build-variant.sh` into `engine/scripts/`
2. Add `html-wl`, `pdf-wl`, `all` targets to `engine/Makefile`
3. The variant script runs after section assembly but before Marp
4. Consider: externalize term substitutions to a per-presentation `variants.yaml` or similar config file instead of hardcoding them in the script
5. Update `/build` skill to accept variant argument: `/build html-wl`
