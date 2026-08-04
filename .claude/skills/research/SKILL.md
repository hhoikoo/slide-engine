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

## Research doc format

Each research doc is saved as `research/r{NN}.md` (numeric name only, to avoid leaking topics via filenames):

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

How this connects to the presentation topic.
```

For `type: code`, replace "Key Data Points" with "Key Code" containing the relevant code snippet, and add `path` and `commit` fields to frontmatter.

## Resolve presentation

The last token in `$ARGUMENTS` may be a presentation identifier (opaque ID or human-readable name). If it matches via `presentations/index.md`, use that. Otherwise use the presentation from earlier in this conversation. If neither, ask the user.

## Workflow

1. Resolve the presentation directory.
2. Scan existing `research/r*.md` files to find the next sequential number.
3. Determine input mode from `$ARGUMENTS`.
4. Fetch/research the source material.
5. Save to `research/r{NN}.md`.
6. Report what was saved.

## Voice

Research docs quote and summarize outside sources, so the honesty bar in `.claude/rules/writing-core.md` is the binding rule: record what the source actually said, keep every number attached to its source, and mark what you could not verify. Do not paraphrase a claim into something stronger than the original.

Preserve the source's own punctuation inside quotations, including dashes. `.claude/rules/text-syntax.md` governs your prose around the quotation, not the quotation itself.

## Notes

- Always fill in all frontmatter fields.
- Tags should be lowercase, 2-5 per document.
- The `date_added` field uses the current date.
- For topic mode, create separate research doc files for each source found.
