---
name: fetch-image
description: Download an image URL to images/figures/ in the current presentation. Usage: /fetch-image <url> [filename]
argument-hint: "<url> [filename]"
---

# Fetch Image

Download an image from a URL and save it to the current presentation's `images/figures/` directory.

## Input

`$ARGUMENTS` is `<url> [filename]`:
- First argument: the image URL (required)
- Second argument: optional filename (without path). If omitted, derive from the URL or content-type.

## Workflow

1. Detect the current presentation directory (look for `sections/` in cwd or parent).
2. Parse URL and optional filename from `$ARGUMENTS`.
3. Create `images/figures/` if it does not exist.
4. Download the image using `curl -fsSL -o`:
   - If filename is provided, use it directly.
   - If URL has a recognizable image extension (.png, .jpg, .jpeg, .svg, .webp, .gif), derive the filename from the URL basename.
   - If no extension, first do a HEAD request (`curl -fsSI`) to check the Content-Type header, then map to the appropriate extension (image/png -> .png, image/jpeg -> .jpg, image/svg+xml -> .svg, image/webp -> .webp). Use a slug from the URL path as the base name.
5. Verify the download succeeded (file exists and has non-zero size).
6. Print the relative markdown reference: `![alt](images/figures/{filename})`
7. Report the saved path so the user can insert it into slides.

## Notes

- One image per invocation. For multiple images, run the skill multiple times.
- Does not resize or convert images. If an image is very large, suggest the user resize it manually.
- The `images/figures/` directory is for hand-sourced or fetched images. AI-generated images go in `images/generated/`.
