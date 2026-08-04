#!/usr/bin/env bash
set -euo pipefail

# localize-fonts.sh -- rewrite absolute @font-face urls in a built deck to a path
# that resolves once the page is served from GitHub Pages.
#
# merge-theme.js resolves the theme's relative url("fonts/...") against the theme
# directory, which is correct for a local file:// render and a dead link once the
# HTML is copied into public/. Deck pages land at public/{name}/index.html, one
# level below the shared font directory, so ../fonts/ resolves under a project
# page, a user page, or a custom domain alike. A root-relative /fonts/ would
# break on a project page.
#
# Usage:
#   engine/scripts/localize-fonts.sh <deck.html> [depth]
#
# depth is how many directories the page sits below public/ (default 1).
#
# Dependencies beyond the project baseline: none. Uses sed only.

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "usage: $0 <deck.html> [depth]" >&2
  exit 2
fi

readonly TARGET="$1"
readonly DEPTH="${2:-1}"

if [ ! -f "${TARGET}" ]; then
  echo "localize-fonts: no such file: ${TARGET}" >&2
  exit 2
fi

prefix=""
i=0
while [ "${i}" -lt "${DEPTH}" ]; do
  prefix="${prefix}../"
  i=$((i + 1))
done

before="$(grep -c 'url("[^"]*fonts/[^"]*\.woff2")' "${TARGET}" || true)"

# Any absolute or file:// path ending in fonts/<name>.woff2 collapses to the
# shared directory, whatever theme directory produced it.
sed -i '' -E \
  "s#url\(\"(file://)?/[^\"]*/fonts/([^\"/]+\.woff2)\"\)#url(\"${prefix}fonts/\2\")#g" \
  "${TARGET}"

after="$(grep -c "url(\"${prefix}fonts/[^\"]*\.woff2\")" "${TARGET}" || true)"
remaining="$(grep -c 'url("\(file://\)\?/[^"]*\.woff2")' "${TARGET}" || true)"

echo "localize-fonts: ${after}/${before} font url(s) rewritten to ${prefix}fonts/"
if [ "${remaining}" != "0" ]; then
  echo "localize-fonts: ${remaining} absolute font url(s) left unrewritten in ${TARGET}" >&2
  exit 1
fi
