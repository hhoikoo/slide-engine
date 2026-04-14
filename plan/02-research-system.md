# Research / Knowledge Base System

> Status: Draft
> Priority: Post-MVP (Phase 3)
> Depends on: MVP (01-mvp.md Phase 1-2 complete)

## Overview

Each presentation has a `research/` folder containing structured markdown files that serve as the knowledge base for slide content. The `/research` skill populates this folder; `/generate-slides` reads it to produce cited slides.

## Research Doc Types

| Type | Source | Use case |
|------|--------|----------|
| `web` | Website, blog, news article | General research, market data |
| `paper` | Academic paper (arXiv, conference) | Technical claims, citations |
| `report` | Industry report (Gartner, W&B, etc.) | Market data, statistics |
| `code` | Code snippet from another repo | Architecture examples, implementation patterns |
| `manual` | Hand-written notes, meeting notes | Personal observations, stakeholder input |

## Research Doc Format

```markdown
---
id: 4
title: "Analysis of Large-Scale Multi-Tenant GPU Clusters"
type: paper
authors: ["Myeongjae Jeon", "et al."]
year: 2019
source: "USENIX ATC '19"
url: "https://www.usenix.org/conference/atc19/presentation/jeon"
tags: ["multi-tenant", "GPU cluster", "utilization"]
date_added: "2026-03-20"
---

# Analysis of Large-Scale Multi-Tenant GPU Clusters

## Summary

3-5 sentence summary of the source material.

## Key Data Points

- Bullet points of specific facts, numbers, quotes that can be used in slides
- GPU utilization drops to 50% in large multi-tenant clusters
- Locality-aware scheduling improves completion time by 27%

## Relevance

How this research connects to the presentation's topic. Which sections/slides would use this.
```

### Code snippet variant

```markdown
---
id: 5
title: "Backend.AI Scheduler Implementation"
type: code
source: "github.com/lablup/backend.ai"
path: "src/ai/backend/manager/scheduler/dispatcher.py"
commit: "abc1234"
tags: ["scheduling", "resource-allocation"]
date_added: "2026-03-22"
---

# Backend.AI Scheduler Implementation

## Summary

The dispatcher uses a priority queue with fair-share scheduling across projects.

## Key Code

\```python
class FIFOSlotScheduler(AbstractScheduler):
    async def schedule(self, pending_sessions, existing_sessions, ...):
        # Fair-share across projects, FIFO within each project
        ...
\```

## Relevance

Architecture slide: shows how the scheduler handles multi-tenant fairness.
```

## Citation Map

`research/citation-map.md` maps research doc IDs to slide citation numbers `[N]`:

```markdown
| Citation [N] | Research ID | Title | First appears in |
|-------------|-------------|-------|-----------------|
| 1 | 08 | National GPU Procurement | 02-background.md |
| 2 | 03 | KISTI Supercomputer 6 | 02-background.md |
| 3 | 15 | GPU Utilization (W&B) | 03-problem.md |
```

Citation numbers are assigned by order of first appearance in slides, not by research doc ID. The citation map is the single source of truth for the mapping.

## The `/research` Skill

Invoked as `/research <topic-or-url>`. Behavior depends on input:

**URL input** (`/research https://example.com/article`):
1. Fetch the URL content
2. Extract key information, data points, quotes
3. Generate a research doc with proper frontmatter
4. Save to `research/{next-id}-{slug}.md`

**Topic input** (`/research GPU utilization in multi-tenant clusters`):
1. Launch a web-researcher agent to find relevant sources
2. For each relevant source found, generate a research doc
3. Save all docs to `research/`

**Paper input** (`/research arxiv:2401.12345` or a PDF path):
1. Fetch/read the paper
2. Extract abstract, key findings, methodology, data points
3. Generate a research doc

**Code input** (`/research code:~/Developer/backend.ai/src/scheduler.py`):
1. Read the source file
2. Extract the relevant section with context
3. Generate a research doc with code snippets, file path, and commit hash

The skill always:
- Auto-assigns the next sequential ID
- Generates a slug from the title
- Fills in all frontmatter fields
- Writes Summary, Key Data Points, and Relevance sections

## Integration with `/generate-slides`

When research docs exist in the presentation's `research/` folder:
1. `/generate-slides` reads all research docs before generating content
2. Incorporates specific data points and facts from the research
3. Adds `<sup>[N]</sup>` citations referencing the citation map
4. Generates a References appendix slide listing all cited sources

## Implementation Steps

1. Create `/research` SKILL.md
2. Implement URL, topic, paper, and code research modes
3. Update `/generate-slides` to read and cite research docs
4. Set up citation-map.md auto-generation
5. Test end-to-end: research -> generate -> build with citations
