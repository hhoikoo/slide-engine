---
name: fetch-image
description: Download an image URL to images/figures/ under an opaque fNN name and record it in INDEX.md. Usage: /fetch-image <url> [description]
argument-hint: "<url> [description]"
---

# Fetch Image

Download an image from a URL into the current presentation's `images/figures/` directory under an opaque filename, then record what it is in that folder's `INDEX.md`.

git-crypt encrypts file contents but NOT paths, so figure filenames are visible in cleartext on GitHub. Never save with a topic-revealing name (e.g. `kvcache-arch.png`); always use `fNN.<ext>` and keep the real description in the encrypted `INDEX.md`.

## Input

`$ARGUMENTS` is `<url> [description]`:
- First argument: the image URL (required)
- Rest: optional short description of what the image is (used for the INDEX.md row). If omitted, infer a description from the URL/page context.

Do NOT accept a target filename from the user; the filename is always the next free opaque `fNN`.

## Resolve presentation

Use the presentation from earlier in this conversation. If none established, ask the user. Accepts opaque ID or human-readable name via `presentations/index.md`.

## Workflow

1. Resolve the presentation directory.
2. Parse the URL and optional description from `$ARGUMENTS`.
3. Create `images/figures/` if it does not exist.
4. Determine the extension from the URL or `Content-Type` (`.png`, `.svg`, `.jpg`, ...).
5. Allocate the next opaque name: scan existing `fNN.*` in `images/figures/`, take the highest `NN`, add 1, zero-padded to two digits. First file is `f00`.
6. Download to `images/figures/f{NN}.{ext}` using `curl -fsSL -o`.
7. Verify the download succeeded (non-empty, correct type).
8. Append a row to `images/figures/INDEX.md` (create the file from the standard header if missing): `| \`f{NN}.{ext}\` | {description} |`.
9. Print the relative markdown reference: `![alt](images/figures/f{NN}.{ext})`

The `INDEX.md` description is a plain noun phrase naming what the figure actually is, sentence case, no trailing period (`.claude/rules/writing-shortform.md`). It is the only record of what `fNN` means, so be concrete.
