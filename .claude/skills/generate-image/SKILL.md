---
name: generate-image
description: Generate an image for slides using Gemini CLI (free tier, Nano Banana 2). Usage: /generate-image <prompt>
argument-hint: "<prompt>"
---

# Generate Image

Generate a presentation-quality image using Gemini CLI.

## Input

`$ARGUMENTS` is the image prompt (e.g., "abstract data flow diagram with three connected nodes").

## Prerequisites

- Gemini CLI installed: `npm install -g @google/gemini-cli`
- Google account authenticated: run `gemini` once to set up

## Workflow

1. **Check Gemini CLI**: Verify `gemini` is available. If not, tell the user to install it.
2. **Determine output path**: Save to `images/generated/{slug}.png` in the current presentation directory.
3. **Build the full prompt**: Combine the user's prompt with style defaults and negative prompts.
4. **Invoke Gemini CLI**:
   ```
   gemini -p "Generate an image and save it to {output_path}. {full_prompt}" -m gemini-3.1-flash-image-preview
   ```
5. **Verify**: Check the output file exists. If generation failed, report the error.
6. **Report**: Print the relative path for embedding in slides.md.

## Style Defaults

Prepend to every prompt unless the user overrides:
- "Professional, clean, minimal design suitable for presentation slides."
- "16:9 aspect ratio."

## Negative Prompts

Append to every prompt:
- "No text overlays or watermarks. No photorealistic human faces. No cluttered backgrounds. No stock photo aesthetic. No gradients unless specifically requested."

## Per-Theme / Per-Presentation Style

If `image-style.md` exists in the presentation directory or the theme directory, read it and incorporate its style directions and negative prompts into the full prompt. Presentation-level overrides theme-level.

## Rate Limits

Free tier: 60 requests/minute, 1000 requests/day. More than sufficient for slide image generation.
