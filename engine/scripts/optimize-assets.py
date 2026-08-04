#!/usr/bin/env python3
"""Downscale and re-encode theme raster assets for slide-size delivery.

Slides render at 1280x720 CSS px and export to PDF through headless Chrome at
that geometry, so no asset needs to exceed 2560 px on its long edge (2x for
retina and PDF).

Encoder choice is driven by the measured alpha channel, never by the file
extension: an image whose alpha is fully opaque is re-encoded as JPEG even if it
is stored as a PNG, and an image with genuine transparency always stays PNG.

A PNG that becomes a JPEG changes extension. The script refuses to do that while
any file in the repo still references the old name, so a rename can never break
a reference. Pass --dry-run to see decisions without writing.

Idempotent: a second run finds every image already inside the size cap and below
the bytes-per-pixel threshold, and rewrites nothing.

Dependencies beyond the repo baseline: Python 3 with Pillow.

Usage:
    python3 engine/scripts/optimize-assets.py [--dirs common,partner] [--dry-run]
"""

import argparse
import os
import subprocess
import sys

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

# Long-edge cap: 2x the 1280x720 slide geometry.
MAX_EDGE = 2560
# Fraction of non-opaque pixels above which transparency counts as intentional.
ALPHA_MIN_FRACTION = 0.01
# JPEG quality that is visually lossless at slide size.
JPEG_QUALITY = 88
# Bytes per pixel above which an already-correct format is still worth redoing.
BPP_REENCODE_THRESHOLD = 0.5

RASTER_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
# Formats left alone: WebP is already efficient and converting it complicates
# the PDF path.
SKIP_EXTS = {".webp", ".gif"}


def repo_root() -> str:
    return os.path.realpath(os.path.join(os.path.dirname(__file__), "..", ".."))


def alpha_fraction(im: Image.Image) -> float:
    """Fraction of pixels that are not fully opaque."""
    if im.mode not in ("RGBA", "LA", "PA", "P") and "transparency" not in im.info:
        return 0.0
    alpha = im.convert("RGBA").getchannel("A")
    total = alpha.size[0] * alpha.size[1]
    if total == 0:
        return 0.0
    return sum(alpha.histogram()[:255]) / total


def is_referenced(root: str, name: str) -> bool:
    """True if any text file outside the asset tree mentions this basename."""
    cmd = [
        "grep", "-rIl", "--fixed-strings", name, root,
        "--exclude-dir=node_modules", "--exclude-dir=.git",
        "--exclude-dir=assets", "--exclude-dir=output",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    return bool(proc.stdout.strip())


def resized(im: Image.Image) -> Image.Image:
    w, h = im.size
    if max(w, h) <= MAX_EDGE:
        return im
    scale = MAX_EDGE / max(w, h)
    return im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)


def process(path: str, root: str, dry_run: bool) -> tuple[int, int, str]:
    """Returns (bytes_before, bytes_after, note)."""
    before = os.path.getsize(path)
    ext = os.path.splitext(path)[1].lower()
    if ext in SKIP_EXTS:
        return before, before, "skipped (format left alone)"

    im = Image.open(path)
    w, h = im.size
    frac = alpha_fraction(im)
    keep_png = frac > ALPHA_MIN_FRACTION
    oversized = max(w, h) > MAX_EDGE
    bpp = before / (w * h)

    target_ext = ".png" if keep_png else ".jpg"
    needs_work = oversized or ext != target_ext or bpp > BPP_REENCODE_THRESHOLD
    if not needs_work:
        return before, before, "already optimal"

    target = os.path.splitext(path)[0] + target_ext
    if target != path and is_referenced(root, os.path.basename(path)):
        # Renaming would break a live reference; stay in the current format.
        target, target_ext, keep_png = path, ext, ext == ".png"
        if not oversized and bpp <= BPP_REENCODE_THRESHOLD:
            return before, before, "referenced, left as is"

    out = resized(im)

    if dry_run:
        note = f"{w}x{h} {ext} -> {out.size[0]}x{out.size[1]} {target_ext}"
        if keep_png:
            note += f" (alpha {frac:.1%})"
        return before, before, note

    tmp = target + ".tmp"
    if keep_png or target_ext == ".png":
        out = out.convert("RGBA")
        out.save(tmp, "PNG", optimize=True)
    else:
        flat = Image.new("RGB", out.size, (255, 255, 255))
        rgba = out.convert("RGBA")
        flat.paste(rgba, mask=rgba.getchannel("A"))
        # 4:4:4 subsampling keeps screenshot text and thin lines crisp.
        flat.save(tmp, "JPEG", quality=JPEG_QUALITY, subsampling=0, optimize=True, progressive=True)

    after = os.path.getsize(tmp)
    if after >= before:
        # Never trade bytes for a format change. Applies to renames too, so a
        # PNG is only retired when the JPEG genuinely wins.
        os.remove(tmp)
        return before, before, "re-encode not smaller, kept original"

    os.replace(tmp, target)
    if target != path:
        os.remove(path)
    note = f"{w}x{h} {ext} -> {out.size[0]}x{out.size[1]} {target_ext}"
    if keep_png:
        note += f" (alpha {frac:.1%})"
    return before, after, note


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--theme", default="themes/bai-flat")
    parser.add_argument("--dirs", default="common",
                        help="comma separated asset subdirectories to process")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    root = repo_root()
    total_before = total_after = 0
    for sub in args.dirs.split(","):
        sub = sub.strip()
        if not sub:
            continue
        d = os.path.join(root, args.theme, "assets", sub)
        if not os.path.isdir(d):
            print(f"skip missing dir: {sub}", file=sys.stderr)
            continue
        sub_before = sub_after = 0
        for name in sorted(os.listdir(d)):
            path = os.path.join(d, name)
            if not os.path.isfile(path):
                continue
            if os.path.splitext(name)[1].lower() not in RASTER_EXTS:
                continue
            b, a, note = process(path, root, args.dry_run)
            sub_before += b
            sub_after += a
            print(f"  {b/1024:8.0f}K -> {a/1024:8.0f}K  {note}")
        print(f"{sub}: {sub_before/1024/1024:.2f}M -> {sub_after/1024/1024:.2f}M")
        total_before += sub_before
        total_after += sub_after
    print(f"total: {total_before/1024/1024:.2f}M -> {total_after/1024/1024:.2f}M")
    return 0


if __name__ == "__main__":
    sys.exit(main())
