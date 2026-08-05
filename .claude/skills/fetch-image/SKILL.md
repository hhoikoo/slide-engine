---
name: fetch-image
description: Download an image URL into a deck's images/figures/ under the fNN reserved for it in draft/figures.md. Usage: /fetch-image <url> [description]
argument-hint: "<url> [description]"
---

@docs/deck-lifecycle.md

# Fetch Image

Download an image from a URL into the current presentation's `images/figures/` directory under its opaque name.

git-crypt encrypts file contents but NOT paths, so figure filenames are visible in cleartext on GitHub. Never save with a topic-revealing name (`kvcache-arch.png`); the name is always `fNN.<ext>` and the real description lives in `draft/figures.md`, which is encrypted.

## Input

`$ARGUMENTS` is `<url> [description]`:
- First argument: the image URL (required)
- Rest: optional short description. If omitted, infer one from the URL or page context.

Do not accept a target filename from the user.

## The name is handed to you

**This skill never scans `images/figures/` for the next free index and never appends to `INDEX.md`.** `draft/figures.md` is the sole allocator (`docs/deck-lifecycle.md`, Figure identity), and `INDEX.md` is generated from that registry at the end of phase 4.

- Invoked from `/deck-figures`, the caller names the `fNN` reserved for this image. Use it.
- Invoked standalone, read `draft/figures.md`, append a `kind: fetched` row, and take the name from the row you just wrote.
- Invoked standalone on a deck with no `draft/figures.md`, create it, seed it once from the `fNN` files already in `images/figures/`, then allocate. Ad-hoc figure work on a shipped deck keeps working, and nothing else about the deck is touched.

The registry reserves the name, not the type. The extension is still resolved here, from the URL or the `Content-Type`, because a fetched image's type is unknown until it is fetched.

## Resolve presentation

Use the presentation from earlier in this conversation. If none established, ask the user. Accepts opaque ID or human-readable name via `presentations/index.md`.

## Workflow

1. Resolve the presentation directory.
2. Parse the URL and optional description from `$ARGUMENTS`.
3. Resolve the `fNN` per the rule above.
4. Create `images/figures/` if it does not exist.
5. Determine the extension from the URL or `Content-Type` (`.png`, `.svg`, `.jpg`, ...).
6. Download to `images/figures/{fNN}.{ext}` using `curl -fsSL -o`.
7. Verify the download succeeded: non-empty, and the bytes match the extension.
8. Record the description in that figure's `draft/figures.md` row, not in `INDEX.md`.
9. Print the relative markdown reference: `![alt](images/figures/{fNN}.{ext})`

If a slide already points at the extensionless `images/figures/{fNN}`, which is what phase 2 writes for a fetched image, fix that reference to carry the extension you just resolved.

The description is a plain noun phrase naming what the figure actually is, sentence case, no trailing period (`.claude/rules/writing-shortform.md`). It is the only record of what `fNN` means, so be concrete.
