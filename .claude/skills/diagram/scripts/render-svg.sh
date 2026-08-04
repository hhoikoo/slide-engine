#!/usr/bin/env bash
set -euo pipefail
#
# render-svg.sh -- rasterize a hand-authored SVG to PNG for visual review.
#
# The SVG is inlined into the DOM of a throwaway HTML page and screenshotted by
# headless Chrome, which is the same engine the deck build uses, so what you see
# is what the slide gets. Inlining is what the build does too (marp.config.js
# converts <img src="*.svg"> to inline <svg>), and it is what lets the theme's
# @font-face reach the diagram: an SVG referenced through <img src="data:...">
# renders in an isolated document that no page style can touch, so the bundled
# faces would silently fall back to whatever the machine happens to have.
#
# Usage: render-svg.sh <in.svg> <out.png> [max-dimension]
#
# Dependencies: python3, and Chrome. The browser is resolved from ${CHROME},
# then the macOS app bundle, then google-chrome/chromium on PATH, then the
# build puppeteer downloaded into node_modules.

readonly DEFAULT_MAX_DIM=1400
readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../../../.." && pwd)"
readonly THEME="${THEME:-bai-flat}"
readonly FONT_DIR="${REPO_ROOT}/themes/${THEME}/fonts"

usage() {
  echo "usage: render-svg.sh <in.svg> <out.png> [max-dimension]" >&2
  exit 2
}

[ "$#" -ge 2 ] || usage
readonly IN="$1"
readonly OUT="$2"
readonly MAX_DIM="${3:-${DEFAULT_MAX_DIM}}"

if [ ! -f "${IN}" ]; then
  echo "render-svg: no such file: ${IN}" >&2
  exit 2
fi
case "${MAX_DIM}" in
  ''|*[!0-9]*) echo "render-svg: max-dimension must be a positive integer, got '${MAX_DIM}'" >&2; exit 2 ;;
esac

resolve_chrome() {
  if [ -n "${CHROME:-}" ]; then
    printf '%s\n' "${CHROME}"
    return 0
  fi
  local mac_chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  if [ -x "${mac_chrome}" ]; then
    printf '%s\n' "${mac_chrome}"
    return 0
  fi
  local candidate
  for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "${candidate}" >/dev/null 2>&1; then
      command -v "${candidate}"
      return 0
    fi
  done
  if [ -d "${REPO_ROOT}/node_modules/puppeteer" ]; then
    node -e "process.stdout.write(require('${REPO_ROOT}/node_modules/puppeteer').executablePath())" 2>/dev/null && return 0
  fi
  return 1
}

CHROME_BIN="$(resolve_chrome || true)"
if [ -z "${CHROME_BIN}" ] || [ ! -x "${CHROME_BIN}" ]; then
  echo "render-svg: no Chrome found; set CHROME to a browser binary" >&2
  exit 2
fi

# Scratch lives in a per-run directory so parallel renders never share a path.
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/render-svg.XXXXXXXX")"
trap 'rm -rf "${TMP_DIR}"' EXIT
readonly PAGE="${TMP_DIR}/page.html"

# The heredoc is deliberately outside $( ). bash 3.2, which macOS ships, tracks
# quotes inside command substitution, so an apostrophe in the python body would
# be a parse error. Redirecting to a file keeps the body unconstrained.
readonly DIMS_FILE="${TMP_DIR}/dims"

python3 - "${IN}" "${PAGE}" "${MAX_DIM}" "${FONT_DIR}" >"${DIMS_FILE}" <<'PY'
import os
import re
import sys

src, page, max_dim, font_dir = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
raw = open(src, "rb").read()
head = raw[:4000].decode("utf-8", "ignore")

box = re.search(r'viewBox\s*=\s*"\s*([-\d.eE\s,]+)"', head)
if box:
    parts = re.split(r"[\s,]+", box.group(1).strip())
    width, height = float(parts[2]), float(parts[3])
else:
    w = re.search(r'\bwidth\s*=\s*"([\d.]+)', head)
    h = re.search(r'\bheight\s*=\s*"([\d.]+)', head)
    if not (w and h):
        sys.exit("render-svg: %s has no viewBox and no width/height" % src)
    width, height = float(w.group(1)), float(h.group(1))

if width <= 0 or height <= 0:
    sys.exit("render-svg: %s has a zero-sized canvas" % src)

scale = max_dim / max(width, height)
out_w, out_h = max(1, round(width * scale)), max(1, round(height * scale))

# The @font-face block in the theme is the single source of truth for which
# file backs which family, so lift it rather than restating it. A diagram that
# names a bundled family must resolve to the bundled file here too, otherwise
# the review render measures glyphs the deck will never use. url() is rewritten
# absolute the same way engine/scripts/merge-theme.js does it for the build.
#
theme_css = os.path.join(os.path.dirname(font_dir), "theme.css")
faces = ""
try:
    with open(theme_css, encoding="utf-8") as handle:
        css = handle.read()
except OSError as exc:
    sys.stderr.write("render-svg: cannot read %s (%s); diagram text will fall "
                     "back to system faces\n" % (theme_css, exc))
    css = ""

theme_dir = os.path.dirname(theme_css)
blocks = re.findall(r"@font-face\s*\{[^}]*\}", css, flags=re.I)
if css and not blocks:
    sys.stderr.write("render-svg: no @font-face in %s; diagram text will fall "
                     "back to system faces\n" % theme_css)
for block in blocks:
    def absolute(match):
        target = match.group(1)
        if target.startswith(("data:", "/", "file://")) or "://" in target:
            return match.group(0)
        return 'url("file://%s")' % os.path.join(theme_dir, target)
    block = re.sub(r'url\("([^"]+)"\)', absolute, block)
    # A screenshot has no second chance to repaint, so block on the face
    # rather than letting swap flash a fallback into the capture.
    block = re.sub(r"font-display\s*:\s*[^;}]+", "font-display:block", block, flags=re.I)
    faces += block

svg = raw.decode("utf-8")
svg = re.sub(r"<\?xml[^?]*\?>\s*", "", svg, flags=re.I)
svg = re.sub(r"<!DOCTYPE[^>]*>\s*", "", svg, flags=re.I)

with open(page, "w", encoding="utf-8") as handle:
    handle.write(
        '<!doctype html><meta charset="utf-8"><style>%s'
        "html,body{margin:0;background:#fff}"
        "#host{width:%dpx;height:%dpx}"
        "#host>svg{width:100%%;height:100%%;display:block}</style>"
        '<body><div id="host">%s</div></body>'
        % (faces, out_w, out_h, svg)
    )
print("%d %d" % (out_w, out_h))
PY

DIMS="$(cat "${DIMS_FILE}")"

OUT_W="${DIMS% *}"
OUT_H="${DIMS#* }"

OUT_DIR="$(dirname -- "${OUT}")"
mkdir -p "${OUT_DIR}"
OUT_ABS="$(cd -- "${OUT_DIR}" && pwd)/$(basename -- "${OUT}")"
rm -f "${OUT_ABS}"

"${CHROME_BIN}" \
  --headless \
  --disable-gpu \
  --hide-scrollbars \
  --allow-file-access-from-files \
  --force-device-scale-factor=1 \
  --default-background-color=ffffff \
  --screenshot="${OUT_ABS}" \
  --window-size="${OUT_W},${OUT_H}" \
  "file://${PAGE}" >/dev/null 2>&1 || true

if [ ! -s "${OUT_ABS}" ]; then
  echo "render-svg: ${CHROME_BIN} produced no image for ${IN}" >&2
  exit 1
fi

echo "${OUT_ABS} ${OUT_W}x${OUT_H}"
