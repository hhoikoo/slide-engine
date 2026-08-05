#!/usr/bin/env bash
set -euo pipefail

# watch.sh -- rebuild a deck's HTML whenever its sources change.
#
# Usage: watch.sh <presentation-dir> [theme]
#
# Watches sections/, images/ and draft/mocks/. Not the deck directory itself:
# the build writes slides.md and output/ inside it, so a naive whole-folder
# watch retriggers itself forever. images/generated/ is excluded for the same
# reason, since render-mermaid.js writes there on every build.
#
# draft/mocks/ is watched deliberately. Without it a hand-edit in the Excalidraw
# editor leaves the deck rendering a stale export.
#
# theme.css is not watched. Makefile:15 wires a per-deck theme.css that no deck
# has ever had; real per-deck CSS lives in sections/00.md, already covered.
#
# marp's own --watch cannot serve this: it would watch the generated slides.md
# and skip marp-postprocess.js, yielding a different artifact than ships.
#
# Dependencies beyond the project baseline: fswatch, or entr as a fallback.

# entr re-invokes this script for a single build; the loop below owns the watch.
once=0
if [ "${1:-}" = "--rebuild-once" ]; then
  once=1
  shift
fi

PRES_DIR="${1:?Usage: watch.sh [--rebuild-once] <presentation-dir> [theme]}"
THEME="${2:-bai-flat}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

paths=()
for sub in sections images draft/mocks; do
  [ -d "${PRES_DIR}/${sub}" ] && paths+=("${PRES_DIR}/${sub}")
done
if [ "${#paths[@]}" -eq 0 ]; then
  echo "watch: nothing to watch under ${PRES_DIR}" >&2
  exit 2
fi

rebuild() {
  echo "--- $(date '+%H:%M:%S') rebuilding"
  make -C "${REPO_ROOT}" mocks DIR="${PRES_DIR}" || true
  make -C "${REPO_ROOT}" html DIR="${PRES_DIR}" THEME="${THEME}" || true
}

if [ "${once}" -eq 1 ]; then
  rebuild
  exit 0
fi

echo "watch: ${paths[*]}"
rebuild

if command -v fswatch >/dev/null 2>&1; then
  fswatch -o -r -l 0.5 \
    -e '/output/' -e '/images/generated/' -e '\.DS_Store$' \
    "${paths[@]}" | while read -r _; do rebuild; done
elif command -v entr >/dev/null 2>&1; then
  # entr takes a file list, so a newly created file needs the list rebuilt.
  # -d exits on a new file in a watched directory, which the loop turns into a
  # rescan.
  while true; do
    find "${paths[@]}" -type f \
      ! -path '*/output/*' ! -path '*/images/generated/*' ! -name '.DS_Store' \
      | entr -d "${BASH_SOURCE[0]}" --rebuild-once "${PRES_DIR}" "${THEME}" || true
  done
else
  echo "watch: needs fswatch or entr. brew install fswatch" >&2
  exit 2
fi
