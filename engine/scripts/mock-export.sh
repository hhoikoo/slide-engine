#!/usr/bin/env bash
set -euo pipefail

# mock-export.sh -- render a deck's Excalidraw mocks to SVG.
#
# Reads  <presentation-dir>/draft/mocks/*.excalidraw
# Writes <presentation-dir>/images/mocks/<name>.svg
#
# Usage: mock-export.sh <presentation-dir> [--force]
#
# Skips a mock whose SVG is already newer than its source, so it is cheap to
# call from a watch loop. --force re-renders everything.
#
# The .excalidraw file is the source of truth. Edit it in the Excalidraw editor
# (the VS Code custom editor handles it directly), or regenerate it through
# mock-project.js --spec and mock-compile.js. Do not hand-edit the JSON: bound
# labels and arrows are maintained by the editor and by the compiler, not by
# whoever last changed a coordinate.

PRES_DIR="${1:?Usage: mock-export.sh <presentation-dir> [--force]}"
FORCE="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
EXPORTER="${REPO_ROOT}/node_modules/.bin/excalidraw-export"

SRC_DIR="${PRES_DIR}/draft/mocks"
OUT_DIR="${PRES_DIR}/images/mocks"

if [ ! -d "${SRC_DIR}" ]; then
  echo "mock-export: no ${SRC_DIR}, nothing to do"
  exit 0
fi

if [ ! -x "${EXPORTER}" ]; then
  echo "mock-export: ${EXPORTER} not found. Run 'npm ci' first." >&2
  exit 1
fi

mkdir -p "${OUT_DIR}"

count=0
skipped=0
shopt -s nullglob
for src in "${SRC_DIR}"/*.excalidraw; do
  name="$(basename "${src}" .excalidraw)"
  out="${OUT_DIR}/${name}.svg"

  if [ "${FORCE}" != "--force" ] && [ -f "${out}" ] && [ "${out}" -nt "${src}" ]; then
    skipped=$((skipped + 1))
    continue
  fi

  "${EXPORTER}" "${src}" --svg -o "${out}" >/dev/null
  echo "mock-export: ${name}.excalidraw -> images/mocks/${name}.svg"
  count=$((count + 1))
done
shopt -u nullglob

if [ "${count}" -eq 0 ] && [ "${skipped}" -eq 0 ]; then
  echo "mock-export: no .excalidraw files in ${SRC_DIR}"
else
  echo "mock-export: ${count} rendered, ${skipped} up to date"
fi
