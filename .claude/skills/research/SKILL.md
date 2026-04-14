---
name: research
description: Add structured research docs to a presentation's research/ directory. Usage: /research <url|topic|arxiv:ID|code:path>
argument-hint: "<url|topic|arxiv:ID|code:path>"
---

# Research

Add a structured research document to the current presentation's `research/` directory.

## Input

`$ARGUMENTS` determines the input mode:

- **URL** (`/research https://...`): Fetch the page, extract key information, save as research doc.
- **Topic** (`/research GPU utilization`): Launch a `web-researcher` agent to find relevant sources, save top 3-5 as research docs.
- **Paper** (`/research arxiv:2401.12345` or `/research /path/to/paper.pdf`): Fetch abstract or read PDF, save as research doc.
- **Code** (`/research code:~/path/to/file.py`): Read source file, capture git commit, save as research doc.

## Research Doc Format

Each research doc is saved as `research/{id}-{slug}.md`:

```markdown
---
id: {sequential number}
title: "Document Title"
type: web|paper|report|code|manual
authors: ["Author Name"]
year: 2026
source: "Publication or site name"
url: "https://..."
tags: ["tag1", "tag2"]
date_added: "2026-04-14"
---

# Document Title

## Summary

3-5 sentence summary of the source material.

## Key Data Points

- Specific facts, numbers, quotes usable in slides
- Each point should be concrete and citable

## Relevance

How this connects to the presentation topic. Which slides would reference this.
```

For `type: code`, replace "Key Data Points" with "Key Code" containing the relevant code snippet, and add `path` and `commit` fields to frontmatter.

## Resolve Presentation Directory

The last token in `$ARGUMENTS` may be a presentation name (e.g., `/research https://... 2026-04-build-demo`). If it matches a worktree at `$PRESENTATIONS_DIR/.worktrees/{name}/`, use that. Otherwise use the presentation from earlier in this conversation. If neither, ask the user. Read `PRESENTATIONS_DIR` from `/Users/hhkoo/Documents/Presentation/template-gen/.env`.

## Workflow

1. Resolve the presentation directory (see above).
2. Scan existing `research/*.md` files to find the next sequential ID.
3. Determine input mode from `$ARGUMENTS`:
   - Starts with `http://` or `https://` -> URL mode
   - Starts with `arxiv:` or ends with `.pdf` -> Paper mode
   - Starts with `code:` -> Code mode
   - Otherwise -> Topic mode
4. For **URL mode**: Use WebFetch to get the page content. Extract title, key data, and generate the research doc.
5. For **Topic mode**: Launch a `web-researcher` agent with the topic. For each relevant source found (3-5), generate a research doc.
6. For **Paper mode**: If arxiv, fetch the abstract page. If PDF, read the file. Extract abstract, key findings, generate the research doc.
7. For **Code mode**: Read the source file at the path after `code:`. Run `git log -1 --format=%H` in its directory for the commit hash. Generate the research doc with code snippets.
8. Save to `research/{id}-{slug}.md` where slug is derived from the title.
9. Report what was saved.

## ID Assignment

Scan `research/` for existing files matching `{number}-*.md`. The next ID is max(existing) + 1, or 1 if no files exist. Zero-pad to 2 digits (01, 02, ...).

## Notes

- Always fill in all frontmatter fields. Use best guesses for year/authors when not obvious.
- Tags should be lowercase, 2-5 per document.
- The `date_added` field uses the current date.
- For topic mode, create separate research doc files for each source found.
