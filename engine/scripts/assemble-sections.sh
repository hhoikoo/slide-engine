#!/bin/bash
set -euo pipefail
SECTIONS_DIR="$1/sections"
OUTPUT="$1/slides.md"

count=0
first=true
is_frontmatter=true
for f in "$SECTIONS_DIR"/*.md; do
    count=$((count + 1))
    if [ "$first" = true ]; then
        cat "$f" > "$OUTPUT"
        first=false
        # 00-frontmatter.md ends with --- which is the YAML close
        # The next file's content follows directly (no extra --- needed)
        [[ "$(basename "$f")" == 00-* ]] && is_frontmatter=true || is_frontmatter=false
    else
        if [ "$is_frontmatter" = true ]; then
            # After frontmatter: just append with a blank line (no ---)
            printf "\n" >> "$OUTPUT"
            cat "$f" >> "$OUTPUT"
            is_frontmatter=false
        else
            # Between content sections: insert --- separator
            printf "\n---\n\n" >> "$OUTPUT"
            cat "$f" >> "$OUTPUT"
        fi
    fi
done

if [ "$count" -le 1 ]; then
    echo "Warning: no content sections found in $SECTIONS_DIR (only frontmatter)" >&2
fi
