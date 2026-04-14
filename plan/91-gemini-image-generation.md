# Gemini CLI Image Generation

> Status: Blocked on auth/billing model
> Priority: Post-MVP
> Depends on: MVP (engine/themes must exist)

## Key Constraint

Google AI Pro subscription ($19.99/month) does NOT make image generation available programmatically. The 100 images/day quota is only accessible via the Gemini web/mobile app. Gemini CLI is text-only; its OAuth auth routes through "Code Assist" API, which has no image generation capability.

The nanobanana extension requires a separate `GEMINI_API_KEY` (developer key from AI Studio). Free tier gives 15 images/day without billing. Billing-linked key gives higher limits at ~$0.067/image.

Open GitHub issues tracking this gap: [#1714](https://github.com/google-gemini/gemini-cli/issues/1714), [#12813](https://github.com/google-gemini/gemini-cli/issues/12813), [nanobanana #38](https://github.com/gemini-cli-extensions/nanobanana/issues/38).

## How It Actually Works

Gemini CLI (v0.37.x) has **no native image generation**. The solution is the **nanobanana extension** -- a first-party extension that wraps the Gemini image generation API.

### Setup (one-time)

```bash
# Install the extension
gemini extensions install https://github.com/gemini-cli-extensions/nanobanana

# Set API key (one of these, checked in order):
export NANOBANANA_API_KEY="your-key"   # or
export GEMINI_API_KEY="your-key"       # or
export GOOGLE_API_KEY="your-key"
```

The extension defaults to `gemini-3.1-flash-image-preview` (Nano Banana 2).

### Usage

**Interactive mode:**
```bash
gemini
> /generate "a minimalist data flow diagram, flat design, navy and orange palette"
```

**Non-interactive mode** (works since CLI v0.11.0):
```bash
gemini -p '/generate "a minimalist data flow diagram, flat design, navy and orange"'
```

Images save to `./nanobanana-output/` in the current directory. Filenames are auto-derived from the prompt.

### Available commands

| Command | Description |
|---------|-------------|
| `/generate` | Text-to-image |
| `/edit` | Edit existing image with prompt |
| `/restore` | Restore/upscale image |
| `/icon` | Generate icon |
| `/pattern` | Generate repeating pattern |
| `/diagram` | Generate diagram |
| `/nanobanana` | Natural language (auto-routes) |

## Billing Requirement

Image generation requires a **billing-linked** Google API key. Without billing, you get `free_tier quota limit 0` errors even if you have a key.

**Google AI Pro subscribers:** The subscription ($19.99/month) includes higher quotas for all Gemini models including image generation. The nanobanana extension works with the same API key. AI Pro provides significantly higher rate limits than the pay-as-you-go tier.

**Cost per image (pay-as-you-go, for reference):**
- `gemini-3.1-flash-image-preview`: ~$0.067/image at 1K resolution
- `gemini-2.5-flash-image`: ~$0.039/image

With AI Pro, these are covered by the subscription up to the quota limits.

## Integration Plan

### For the /generate-image skill

The skill should:
1. Check nanobanana extension is installed (`gemini extensions list`)
2. `cd` to the presentation's `images/generated/` directory
3. Run `gemini -p '/generate "FULL_PROMPT"'`
4. Find the output file in `./nanobanana-output/`
5. Move it to the desired filename
6. Return the relative path for embedding in slides

### Negative prompt system

The skill reads `image-style.md` (presentation-level, then theme-level fallback) and concatenates style direction + negative prompts with the user's prompt before passing to `/generate`.

### Alternative: Direct curl API call

If the nanobanana extension has issues, a `gemini-image.sh` script can call the API directly:

```bash
#!/usr/bin/env bash
PROMPT="$1"
OUTPUT_FILE="$2"

RESPONSE=$(curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{\"parts\": [{\"text\": \"${PROMPT}\"}]}],
    \"generationConfig\": {
      \"responseModalities\": [\"TEXT\", \"IMAGE\"],
      \"imageConfig\": {\"aspectRatio\": \"16:9\", \"imageSize\": \"1K\"}
    }
  }")

IMAGE_B64=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data')
echo "$IMAGE_B64" | base64 --decode > "$OUTPUT_FILE"
```

Requires: `curl`, `jq`, `GEMINI_API_KEY` env var.

## Notes

- Do NOT use `gemini-2.0-flash-preview-image-generation` -- deprecated, shuts down June 1, 2026.
- The nanobanana extension model can be overridden via `NANOBANANA_MODEL` env var.
- Images at 1K resolution are ~50-150KB, well-suited for slides.
