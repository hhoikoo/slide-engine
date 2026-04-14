# Harness Architecture Patterns for AI-Powered Presentation Generation

> Research date: April 2026. Covers patterns for building a robust, CLI-driven LLM harness that generates slide decks from templates and content outlines.

---

## 1. Core Concept: What the Harness Does

An AI presentation harness takes high-level inputs and produces finished, styled slide decks with minimal manual intervention:

```
Input:
  - Content outline (topic, key points, audience, tone)
  - Template / visual theme selection
  - (Optional) source material (PDFs, notes, data)

Output:
  - Finished slide deck (HTML, PDF, PPTX)
  - Generated assets (images, diagrams, SVGs)
  - Speaker notes
  - Multiple theme variants (same content, different look)
```

The harness is the orchestration layer: it manages LLM calls, tool calls (image gen, diagram render, CLI), file assembly, and final compilation.

---

## 2. How Claude Code / LLM Agents Can Drive Slide Generation

### Claude Code as a slide generation engine

Claude Code has emerged in 2025–2026 as an exceptionally capable engine for Markdown slide generation. Developers have noted it can:

- Generate valid Marp/Slidev/reveal-md Markdown from a one-sentence brief
- Apply theme directives in front matter based on content type
- Generate Mermaid/D2 diagram code from natural language descriptions
- Iterate on slide content with commands like "make this two columns" or "add a speaker note explaining the diagram"
- Write the build scripts that compile the deck

Slidev in particular has noted explicit compatibility with Claude Code; Marp's GitHub Actions CI pattern also integrates cleanly.

**Key insight:** The LLM is most reliable when it generates Markdown as a file (not via stdout) and the harness validates the output before compiling. Catch malformed front matter, unclosed fences, and invalid theme names at the harness level.

### Claude API (Anthropic SDK) for programmatic generation

For a production harness (vs. interactive Claude Code session), use the Claude API directly:

```python
import anthropic

client = anthropic.Anthropic()

SYSTEM_PROMPT = """
You are a slide deck author. Given a content outline, produce a complete Marp Markdown 
presentation. Follow these rules:
- Use '---' to separate slides
- First slide: title + subtitle only
- Include speaker notes after each content slide using <!-- notes: ... -->
- Generate Mermaid diagrams (in ```mermaid blocks) for any process or architecture descriptions
- For images, output a JSON image spec on a comment line: <!-- img: {"prompt": "...", "position": "right"} -->
- Output ONLY the Markdown, no explanation.
"""

def generate_deck(outline: str, theme: str = "gaia", template_context: str = "") -> str:
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=8192,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Theme: {theme}\n\nTemplate context:\n{template_context}\n\nOutline:\n{outline}"
        }]
    )
    return message.content[0].text
```

### Template injection pattern

The most reliable approach is to provide the LLM with a partial template and ask it to fill in the content:

```
TEMPLATE (Marp):
---
marp: true
theme: {{ theme_name }}
paginate: true
backgroundColor: {{ brand_bg_color }}
---

<!-- _class: lead -->
# {{ DECK_TITLE }}
## {{ DECK_SUBTITLE }}

---
## Agenda
{{ AGENDA_ITEMS }}

---
{{ CONTENT_SLIDES }}

---
<!-- _class: lead -->
# Thank You
{{ CONTACT_INFO }}
```

The LLM fills in `{{ }}` placeholders. This gives the harness control over structure while the LLM handles content.

---

## 3. Template-Driven Generation: Content → Finished Slides

### Architecture overview

```
┌─────────────────────┐
│   Content Outline   │  (YAML, Markdown, plain text)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Template Selector  │  Picks Marp/Quarto/reveal-md template
│  (rule-based or LLM)│  based on audience, format, brand
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Content LLM Agent │  Generates slide text, speaker notes,
│   (Claude/GPT-4o)   │  diagram specs, image prompts
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Asset Generation   │  Mermaid CLI, D2, Gemini image API
│  (parallel)         │  Saves to assets/
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Markdown Assembly  │  Substitutes image paths, validates
│  (deterministic)    │  front matter, fixes known issues
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Slide Compiler CLI │  marp --pdf, quarto render, reveal-md
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Output Artifacts   │  slides.pdf, slides.html, slides.pptx
└─────────────────────┘
```

### Theme switching: same content, different look

This is a first-class design goal. The separation that makes it work:

1. **Content layer:** The Markdown body text, bullet points, diagram code, speaker notes — generated by LLM, theme-agnostic.

2. **Configuration layer:** YAML front matter, theme name, color variables — injected by the harness based on the selected template.

3. **Style layer:** CSS/SCSS files or Quarto `_brand.yml` — exist as named presets in the template library.

**Marp theme switching example:**
```bash
# Same content.md, three themes:
marp --theme corporate content.md -o corporate.pdf
marp --theme minimal content.md -o minimal.pdf
marp --theme dark content.md -o dark.pdf
```

**Quarto multi-format from one source:**
```bash
quarto render deck.qmd --to revealjs -o deck.html
quarto render deck.qmd --to beamer -o deck.pdf
quarto render deck.qmd --to pptx -o deck.pptx
```

**Implementation:** The harness stores templates as named presets:
```python
THEMES = {
    "corporate": {
        "tool": "marp",
        "theme_file": "themes/corporate.css",
        "front_matter": {"backgroundColor": "#FFFFFF", "color": "#1A1A2E"},
    },
    "dark-tech": {
        "tool": "marp",
        "theme_file": "themes/dark-tech.css",
        "front_matter": {"backgroundColor": "#0F172A", "color": "#E2E8F0"},
    },
    "academic": {
        "tool": "quarto",
        "format": "beamer",
        "brand_file": "themes/academic-brand.yml",
    },
}

def apply_theme(content_md: str, theme_name: str) -> str:
    theme = THEMES[theme_name]
    front_matter = yaml.dump(theme["front_matter"])
    return f"---\n{front_matter}---\n\n{content_md}"
```

---

## 4. Multi-Agent Patterns for Slide Generation

### Why multi-agent?

A single LLM call can generate a full deck, but quality degrades as complexity increases. Multi-agent patterns divide the work:

- **Specialization:** An agent focused on content outline writes better bullets. An agent focused on image prompts produces more descriptive, visually coherent prompts.
- **Parallelism:** Image generation (slow API calls) can run in parallel with speaker note generation.
- **Quality gates:** Separate validation agents catch issues before final compilation.

### Pattern 1: Supervisor + Specialists (Recommended for production)

```
Supervisor Agent (Claude Opus / GPT-4o)
  │
  ├── Content Agent (Claude Sonnet)
  │     └── Generates slide-by-slide Markdown
  │
  ├── Visual Asset Agent (Claude Haiku + Image APIs)
  │     ├── Generates Mermaid/D2 diagram code
  │     └── Writes image prompts → calls Gemini/Flux
  │
  ├── Notes Agent (Claude Haiku)
  │     └── Generates speaker notes for each slide
  │
  └── QA Agent (Claude Sonnet)
        └── Reviews rendered slides, flags issues
```

**Communication protocol:** Agents share state via structured JSON files on disk (not in-memory to allow restarts):

```
workspace/
  job_123/
    outline.yaml          # Input
    content_draft.md      # Content Agent output
    assets/
      diagram_02.svg      # Visual Agent output
      hero_image_01.png
    notes.yaml            # Notes Agent output
    final_deck.md         # Assembled by Supervisor
    final_deck.pdf        # Compiled output
```

### Pattern 2: Sequential Pipeline (Simpler, good starting point)

```python
async def generate_presentation(outline: dict, theme: str) -> Path:
    # Step 1: Generate content
    content_md = await content_agent.generate(outline)
    
    # Step 2: Extract asset specs from content
    asset_specs = extract_asset_specs(content_md)  # parse <!-- img: {...} --> comments
    
    # Step 3: Generate assets in parallel
    assets = await asyncio.gather(*[
        generate_asset(spec) for spec in asset_specs
    ])
    
    # Step 4: Substitute asset paths into Markdown
    final_md = substitute_assets(content_md, assets)
    
    # Step 5: Apply theme
    themed_md = apply_theme(final_md, theme)
    
    # Step 6: Compile
    output_path = await compile_deck(themed_md, theme)
    
    return output_path
```

### Pattern 3: Stateless Handoffs (Most scalable)

Each stage is stateless; intermediate artifacts are the sole communication channel. This avoids context window bloat and makes stages independently restartable.

```
Stage 1: outline.yaml → [Content LLM] → content.md
Stage 2: content.md → [Asset Extractor (deterministic)] → asset_specs.json
Stage 3: asset_specs.json → [Image API loop] → assets/
Stage 4: content.md + assets/ → [Markdown Assembler] → assembled.md
Stage 5: assembled.md + theme.yaml → [Theme Applier] → themed.md
Stage 6: themed.md → [marp CLI] → final.pdf
```

Each stage is individually retryable. Assets are cached (see image caching in `ai-image-generation-for-slides.md`).

### Claude Code as an interactive harness

Rather than a fully automated pipeline, Claude Code itself can serve as the harness in an interactive workflow:

```
# In a Claude Code session:
# 1. Provide CLAUDE.md with slide generation instructions
# 2. Drop outline.md and theme preference into the project
# 3. Claude Code reads the outline, generates the Markdown, 
#    calls Mermaid CLI via Bash, assembles the deck, runs marp

> "Generate a 12-slide deck from outline.md using the corporate theme. 
   Use Mermaid for any process diagrams. Save the PDF as deck_v1.pdf."
```

This works because Claude Code can run shell commands, write files, and iterate based on tool output. For presentation generation, this interactive loop is often faster than a coded pipeline for one-off decks.

---

## 5. Existing AI Slide Generation Tools (Survey)

### Gamma.app

**Approach:** Web-only SaaS. Input: a few sentences of natural language. Output: polished, design-forward presentation.

- Generates 700,000+ decks per day as of 2025
- Combines LLM text generation + proprietary design layout engine + image generation
- Users can iterate with natural language: "make the title more concise", "switch to blue"
- Gamma 2.0 (April 2025) expanded to websites and social media content
- **Key architectural insight:** Gamma separates **narrative structure** (handled by LLM) from **visual layout** (handled by deterministic template engine). The LLM never touches CSS or layout math.
- **Limitation:** Closed SaaS; no API for programmatic use; no self-hosting; limited export options

### SlidesGPT

**Approach:** Web SaaS, simpler than Gamma. Single text prompt → PPTX download.

- Focused on speed (< 5 minutes from input to download as of 2025)
- Multiple design themes selectable after generation
- Less design polish than Gamma; more straightforward content output
- **Key architectural insight:** Content generation (LLM) and template application (python-pptx) are fully separated; theme is applied post-generation.

### Presenton (Open Source)

**Approach:** Self-hosted, open-source alternative to Gamma/Beautiful.ai. Apache 2.0 license.

- Architecture: FastAPI backend + Next.js frontend, Docker + Electron desktop
- BYOK (Bring Your Own Key): connects to OpenAI, Gemini, Anthropic, or local Ollama
- Custom templates defined in HTML + Tailwind CSS
- Supports custom slide Markdown or full auto-generation
- **Key architectural insight:** Custom templates as HTML+Tailwind means the design layer is completely separable from content.
- GitHub: `presenton/presenton`
- **Relevant for this project:** The most useful open-source reference implementation.

### SlideDeck AI (Open Source)

- Python + Streamlit web UI
- LLM generates structured JSON → python-pptx renders PPTX
- Supports Azure/OpenAI, Google, SambaNova, Together AI, OpenRouter
- GitHub: `barun-saha/slide-deck-ai`
- **Key architectural insight:** JSON as the intermediate representation between LLM and renderer is more reliable than generating PPTX XML directly.

### Beautiful.ai

- Commercial SaaS with "Smart Slide" templates that auto-resize and reflow
- Workflow: prompt → outline (low-fidelity, text-first for review) → polished slides
- Brand control: lock fonts, colors, logos organization-wide
- **Key architectural insight:** Generating a reviewable text-first outline before committing to visual generation reduces wasted work on wrong content structure.

---

## 6. CLI-Driven vs. Web-Based Workflows

### CLI-driven advantages

- **Automation:** Scriptable in any language; integrates with CI/CD, cron, Make
- **Version control:** Markdown source + theme CSS are text files; diffs are readable
- **Reproducibility:** Same inputs → same outputs; no UI state drift
- **Customization:** Full control over every step; can inject custom pre/post processors
- **Cost control:** Pay only for API calls made; no SaaS subscription
- **Offline capable:** With self-hosted models and Mermaid/D2, works without internet

### Web-based advantages

- Lower barrier to entry for non-developers
- Real-time preview without a local toolchain
- Collaborative review (HackMD, Gamma's share links)

### Recommended CLI stack for a custom harness

```bash
# Core tools
npm install -g @marp-team/marp-cli    # Marp compiler
npm install -g @google/gemini-cli     # Gemini CLI (optional, interactive)
npm install -g @mermaid-js/mermaid-cli # mmdc diagram renderer
brew install d2                        # D2 diagram renderer
pip install anthropic google-generativeai  # Python API clients

# Optional: Quarto for multi-format output
# https://quarto.org/docs/get-started/
```

**Makefile pattern for a complete pipeline:**

```makefile
THEME ?= corporate
OUTLINE ?= outline.yaml

.PHONY: slides clean

slides: final/$(THEME).pdf final/$(THEME).html

# Step 1: Generate content markdown
content.md: $(OUTLINE)
	python harness/generate_content.py $(OUTLINE) > content.md

# Step 2: Generate diagrams
assets/diagrams/%.svg: content.md
	python harness/extract_diagrams.py content.md
	for f in assets/diagrams/*.mmd; do mmdc -i $$f -o $${f%.mmd}.svg; done

# Step 3: Generate images
assets/images/: content.md
	python harness/generate_images.py content.md assets/images/

# Step 4: Assemble and theme
themed.md: content.md assets/
	python harness/apply_theme.py content.md $(THEME) > themed.md

# Step 5: Compile
final/$(THEME).pdf: themed.md assets/
	marp themed.md --pdf -o final/$(THEME).pdf --theme themes/$(THEME).css

final/$(THEME).html: themed.md assets/
	marp themed.md -o final/$(THEME).html --theme themes/$(THEME).css

clean:
	rm -f content.md themed.md
	rm -rf assets/cache/
```

---

## 7. How to Handle Template Switching

Template switching is the ability to regenerate the same content with a different visual theme.

### Key principle: strict content/style separation

The LLM must be instructed to generate **theme-neutral content**. The following should NOT appear in LLM-generated content:

- Color values (`#FF0000`, `blue`, `dark`)
- Font names or sizes
- Absolute pixel measurements
- Theme-specific class names

Instead, the harness injects all visual configuration via:
- Front matter YAML (Marp, reveal-md, Quarto)
- External CSS/SCSS theme files referenced by the CLI
- `_brand.yml` (Quarto)
- Template HTML wrappers (Presenton/reveal-md approach)

### Implementation: theme presets

```yaml
# themes/corporate.yaml
tool: marp
css: themes/corporate.css
front_matter:
  marp: true
  theme: corporate
  paginate: true
  backgroundColor: "#FFFFFF"
  color: "#1A1A2E"
  header: "Acme Corp"
  footer: "Confidential"

# themes/startup-dark.yaml
tool: marp
css: themes/startup-dark.css
front_matter:
  marp: true
  theme: startup-dark
  paginate: true
  backgroundColor: "#0F172A"
  color: "#F8FAFC"
  header: ""
  footer: ""
```

```python
# harness/apply_theme.py
import yaml, sys

def apply_theme(content_md: str, theme_name: str) -> str:
    with open(f"themes/{theme_name}.yaml") as f:
        theme = yaml.safe_load(f)
    
    fm = yaml.dump(theme["front_matter"], default_flow_style=False)
    # Strip any existing front matter from content
    if content_md.startswith("---"):
        _, _, content_md = content_md[3:].split("---", 1)
        content_md = content_md.lstrip("\n")
    
    return f"---\n{fm}---\n\n{content_md}"
```

### Multi-theme batch generation

```bash
#!/bin/bash
# generate_all_themes.sh
THEMES=("corporate" "minimal" "startup-dark" "academic")
for theme in "${THEMES[@]}"; do
  python harness/apply_theme.py content.md $theme > themed_$theme.md
  marp themed_$theme.md --pdf -o output/${theme}.pdf --theme themes/${theme}.css
  echo "Generated output/${theme}.pdf"
done
```

---

## 8. Error Handling and Quality Gates

Common failure modes in LLM-generated slides:

| Issue | Detection | Fix |
|---|---|---|
| Invalid Marp front matter | `marp --dry-run` exit code | Strip and reinject canonical front matter |
| Unclosed Mermaid fences | Regex for ` ```mermaid` without ` ``` ` | LLM retry with explicit instruction |
| Image prompt too vague | Heuristic (< 20 chars) | LLM expansion pass |
| Too many bullets per slide | Count `- ` lines per slide block | Split into multiple slides |
| Slides too text-heavy | Character count per slide | LLM summarization pass |
| Missing speaker notes | Count `<!-- notes:` per slide | LLM notes-filling pass |

```python
def validate_deck(content_md: str) -> list[str]:
    """Returns list of issues found. Empty list = valid."""
    issues = []
    slides = content_md.split("\n---\n")
    
    for i, slide in enumerate(slides, 1):
        # Check bullet density
        bullets = slide.count("\n- ")
        if bullets > 7:
            issues.append(f"Slide {i}: {bullets} bullets (max 7 recommended)")
        
        # Check for unclosed code fences
        fences = slide.count("```")
        if fences % 2 != 0:
            issues.append(f"Slide {i}: unclosed code fence")
        
        # Check character count
        char_count = len(slide.strip())
        if char_count > 800:
            issues.append(f"Slide {i}: {char_count} chars (consider splitting)")
    
    return issues
```

---

## 9. Recommended Architecture for This Project

Given the context (CLI-driven, template-gen project, Marp/Slidev experience, AI-first approach):

### Suggested stack

```
Orchestration:     Python script or Claude Code (interactive)
Content LLM:       Claude Sonnet 4.5 (via Anthropic SDK)
Image generation:  Gemini 2.5 Flash Image (free tier for dev, paid for production)
Diagram rendering: Mermaid CLI (mmdc) + D2 for complex diagrams
Slide compiler:    Marp CLI (primary) + Quarto (for multi-format needs)
Theme system:      Named YAML presets → inject into front matter at build time
Asset caching:     SHA256-keyed file cache in assets/cache/
Output:            PDF (primary), HTML (for sharing), PPTX (for stakeholders)
```

### Directory structure

```
template-gen/
  harness/
    generate_content.py    # LLM call → content.md
    generate_images.py     # Image API → assets/images/
    render_diagrams.py     # Mermaid/D2 → assets/diagrams/
    apply_theme.py         # Theme YAML → themed.md
    validate_deck.py       # Quality checks
    assemble.py            # Full pipeline orchestrator
  themes/
    corporate.yaml + corporate.css
    minimal.yaml + minimal.css
    startup-dark.yaml + startup-dark.css
  templates/
    default.md             # Partial template with {{ placeholders }}
    technical.md           # Technical/code-heavy template
    executive.md           # Executive summary template
  samples/                 # Existing sample decks
  research/                # This directory
  Makefile                 # Top-level build targets
  CLAUDE.md                # Instructions for Claude Code sessions
```

### CLAUDE.md for slide generation sessions

```markdown
# Slide Generation Harness

When generating slides, follow these rules:
1. Output pure Marp Markdown. Do not include HTML or raw CSS.
2. Separate slides with `---` on its own line.
3. For diagrams, use ```mermaid blocks inside the slide.
4. For image requests, output a comment: <!-- img: {"prompt": "...", "ar": "16:9"} -->
5. Keep bullet points to ≤ 6 per slide.
6. Add speaker notes as <!-- notes: ... --> after each content slide.
7. Do not hardcode colors or font sizes — these come from the theme.
8. When asked to switch themes, only modify the front matter block, not the content.
```

---

## Sources

- [Gamma AI Review 2026 – Gamsgo](https://www.gamsgo.com/blog/gamma-app-review)
- [Gamma vs SlidesGPT Comparison 2026 – SlideSpeak](https://slidespeak.co/comparison/gamma-vs-slidesgpt)
- [Presenton GitHub](https://github.com/presenton/presenton)
- [Presenton – Self-Hosted AI Presentation Revolution – BrightCoding](https://www.blog.brightcoding.dev/2026/04/03/presenton-the-self-hosted-ai-presentation-revolution/)
- [SlideDeck AI GitHub](https://github.com/barun-saha/slide-deck-ai)
- [Multi-Agent and Multi-LLM Architecture Guide 2025 – Collabnix](https://collabnix.com/multi-agent-and-multi-llm-architecture-complete-guide-for-2025/)
- [Multi-Agent Systems: Architecture, Patterns, and Production Design – Comet](https://www.comet.com/site/blog/multi-agent-systems/)
- [Agentic Workflows 2026 – Vellum AI](https://www.vellum.ai/blog/agentic-workflows-emerging-architectures-and-design-patterns)
- [Claude Code Subagents docs](https://code.claude.com/docs/en/sub-agents)
- [Awesome Claude Code – GitHub](https://github.com/hesreallyhim/awesome-claude-code)
- [Creating Slides with Assistants API – OpenAI Cookbook](https://developers.openai.com/cookbook/examples/creating_slides_with_assistants_api_and_dall-e3)
- [Switching from Marp to Slidev – codenote.net](https://codenote.net/en/posts/migrate-marp-to-slidev/)
- [Creating Slides with Marp and GitHub Actions – Medium](https://medium.com/@75py/creating-slides-with-marp-13dc35e36e4c)
- [Why Slidev – Slidev docs](https://sli.dev/guide/why)
- [12 Best AI Presentation Makers 2026 – AIToolsSME](https://www.aitoolssme.com/comparison/ai-tools-for-presentations)
