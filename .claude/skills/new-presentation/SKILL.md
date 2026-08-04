---
name: new-presentation
description: Scaffold a new presentation directory with synopsis and starter slides. Usage: /new-presentation <topic>
argument-hint: "<topic>"
---

# New Presentation

Create a new presentation directory with starter files.

## Input

`$ARGUMENTS` is the presentation topic (e.g., "WebAssembly for Backend Engineers").

## Naming

Presentation directories use opaque names (`p001`, `p002`, ...) to avoid leaking topics via filenames on the public repo. The mapping from opaque ID to human-readable name is stored in `presentations/index.md` (git-crypt encrypted).

Section files also use numeric names only: `00.md`, `01.md`, etc.

## Workflow

1. Read `presentations/index.md` to find the next sequential ID (e.g., if `p003` exists, next is `p004`).
2. Create `presentations/p{NNN}/` with subdirectories: `sections/`, `research/`, `images/figures/`, `images/generated/`.
3. Create `sections/00.md` with YAML frontmatter:
   ```markdown
   ---
   marp: true
   theme: bai-flat
   paginate: true
   html: true
   header: "{topic}"
   ---
   ```
4. Create `synopsis.md` with the topic as heading and placeholder sections: Audience, Key Messages, Structure.
5. Append the new entry to `presentations/index.md`.
6. Report the directory path and suggest next steps: edit synopsis.md, then run `/generate-slides`.

## Voice

`synopsis.md` is authored prose under `presentations/`, so `.claude/rules/writing-core.md` applies to it. Write the audience, key messages, and structure as plain declarative sentences with real specifics. No placeholder puffery, no invented numbers, no em dashes.

## Note

Do NOT create `slides.md` or `output/`. Both are build artifacts.
