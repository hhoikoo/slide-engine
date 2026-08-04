#!/usr/bin/env python3
"""Join hard-wrapped markdown paragraphs back into single lines.

A paragraph becomes one line however long; list items absorb their continuation
lines. Fenced and indented code, YAML frontmatter, tables, blockquotes, headings
and HTML blocks are passed through untouched.

The non-whitespace token stream is compared before and after, so a rewrite that
would drop or reorder content fails instead of being written.

Usage:
  python3 unwrap-md.py <file.md> [more.md ...]
  python3 unwrap-md.py --dir <folder>     # every *.md under folder, recursive
  python3 unwrap-md.py --check <file.md>  # report only, change nothing

Exit: 0 clean or rewritten, 1 files still wrapped under --check, 2 bad usage.
"""

import argparse
import os
import re
import sys

FENCE = re.compile(r"^\s{0,3}(```|~~~)")
HEADING = re.compile(r"^\s{0,3}#{1,6}\s")
LIST_ITEM = re.compile(r"^(\s*)([-*+]|\d+[.)])\s+")
TABLE_ROW = re.compile(r"^\s*\|")
BLOCKQUOTE = re.compile(r"^\s*>")
THEMATIC = re.compile(r"^\s{0,3}([-_*])(\s*\1){2,}\s*$")
HTML_BLOCK = re.compile(r"^\s*</?[a-zA-Z!]")
FOOTNOTE = re.compile(r"^\s*\[\^[^\]]+\]:")
LINK_DEF = re.compile(r"^\s*\[[^\]]+\]:\s")

# A trailing double space or backslash is an intentional hard break.
HARD_BREAK = re.compile(r"(  |\\)$")

# Shortest line that plausibly got broken for width. Below this, a line ending is
# an authored break.
DEFAULT_WRAP_FLOOR = 60
args_wrap_floor = [DEFAULT_WRAP_FLOOR]


def starts_block(line):
    return bool(
        not line.strip()
        or FENCE.match(line)
        or HEADING.match(line)
        or LIST_ITEM.match(line)
        or TABLE_ROW.match(line)
        or BLOCKQUOTE.match(line)
        or THEMATIC.match(line)
        or HTML_BLOCK.match(line)
        or FOOTNOTE.match(line)
        or LINK_DEF.match(line)
    )


def unwrap(text):
    lines = text.split("\n")
    out = []
    fence = None
    in_frontmatter = text.startswith("---\n")
    # Current open paragraph or list item, waiting to absorb continuations.
    buf = None
    # Indent that a continuation must meet to belong to the open list item.
    list_body_indent = None

    def flush():
        nonlocal buf
        if buf is not None:
            out.append(buf)
            buf = None

    for i, line in enumerate(lines):
        if in_frontmatter:
            out.append(line)
            if i > 0 and line.strip() == "---":
                in_frontmatter = False
            continue

        if fence is not None:
            out.append(line)
            if line.strip().startswith(fence):
                fence = None
            continue

        m = FENCE.match(line)
        if m:
            flush()
            fence = m.group(1)
            out.append(line)
            continue

        # Indented code, but only where a list item is not already open: inside a
        # list the same indent is an ordinary continuation.
        if buf is None and list_body_indent is None and re.match(r"^(\t|    )", line) and line.strip():
            out.append(line)
            continue

        if not line.strip():
            flush()
            list_body_indent = None
            out.append(line)
            continue

        item = LIST_ITEM.match(line)
        if item:
            flush()
            list_body_indent = len(item.group(0))
            buf = line.rstrip()
            continue

        if starts_block(line):
            flush()
            list_body_indent = None
            out.append(line)
            continue

        # A short line ending in a colon is a label introducing what follows, not
        # the tail of a wrapped sentence.
        stripped = line.strip()
        is_label = stripped.endswith(":") and len(stripped) < args_wrap_floor[0]

        # Only join where the open line is long enough to have been broken for
        # width. Two consecutive short lines are a deliberate break, not a wrap:
        # cheat-sheet files list one fact per line and must survive intact.
        if (buf is not None and not is_label and not HARD_BREAK.search(buf)
                and len(buf.rstrip()) >= args_wrap_floor[0]):
            buf = buf.rstrip() + " " + line.strip()
            continue

        flush()
        buf = line.rstrip()

    flush()
    return "\n".join(out)


def tokens(text):
    """Content signature: fenced blocks keep their newlines, prose does not."""
    parts, fence = [], None
    for line in text.split("\n"):
        m = FENCE.match(line)
        if fence is None and m:
            fence = m.group(1)
            parts.append("\x00FENCE\x00")
            continue
        if fence is not None:
            if line.strip().startswith(fence):
                fence = None
                parts.append("\x00FENCE\x00")
            else:
                parts.append("\x00" + line + "\x00")
            continue
        parts.append(line)
    return " ".join(" ".join(parts).split())


def process(path, check_only):
    with open(path, encoding="utf-8") as fh:
        original = fh.read()
    rewritten = unwrap(original)
    if rewritten == original:
        return "clean"
    if tokens(rewritten) != tokens(original):
        return "MISMATCH"
    if check_only:
        return "wrapped"
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(rewritten)
    return "rewritten"


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--dir", action="append", default=[])
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--wrap-floor", type=int, default=DEFAULT_WRAP_FLOOR,
                    help="only join lines at least this long (default %d)" % DEFAULT_WRAP_FLOOR)
    args = ap.parse_args()
    args_wrap_floor[0] = args.wrap_floor

    files = list(args.paths)
    for d in args.dir:
        for root, dirs, names in os.walk(d):
            dirs[:] = [x for x in dirs if x not in (".git", "node_modules", "public")]
            files.extend(os.path.join(root, n) for n in sorted(names) if n.endswith(".md"))
    if not files:
        ap.error("no markdown files given")

    counts = {}
    for path in sorted(set(files)):
        status = process(path, args.check)
        counts[status] = counts.get(status, 0) + 1
        if status != "clean":
            print("%-10s %s" % (status, path))

    print("\n%s" % ", ".join("%d %s" % (n, k) for k, n in sorted(counts.items())))
    if counts.get("MISMATCH"):
        return 2
    return 1 if (args.check and counts.get("wrapped")) else 0


if __name__ == "__main__":
    sys.exit(main())
