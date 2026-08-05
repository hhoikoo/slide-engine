#!/usr/bin/env bash
set -euo pipefail

# deck-status.sh -- derive a deck's pipeline phase from what is on disk.
#
# Usage:
#   engine/scripts/deck-status.sh [--porcelain] [DECK ...]
#
#   --porcelain  one KEY=VALUE line per deck instead of the human table
#   DECK         pNNN or a path to a deck directory. Default: every deck.
#
# Phase is the highest one whose predicate holds with every lower predicate also
# holding. A deck satisfying a higher predicate while failing a lower one reports
# the lower phase and names the gap in blocked=; the higher artifact exists, but
# the phase it belongs to did not finish.
#
# Exit: 0 always, unless a named deck does not exist (2).
#
# Layout and artifact schemas: docs/deck-lifecycle.md.
# Dependencies beyond the project baseline: none. Uses grep, sed, awk, git.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly ROOT
readonly DECKS_DIR="${ROOT}/presentations"

porcelain=0
targets=()
for arg in "$@"; do
  case "${arg}" in
    --porcelain) porcelain=1 ;;
    -*) echo "usage: $0 [--porcelain] [DECK ...]" >&2; exit 2 ;;
    *) targets+=("${arg}") ;;
  esac
done

resolve_deck() {
  local t="$1"
  if [ -d "${t}" ]; then (cd "${t}" && pwd); return 0; fi
  if [ -d "${DECKS_DIR}/${t}" ]; then echo "${DECKS_DIR}/${t}"; return 0; fi
  echo "deck-status: no such deck: ${t}" >&2
  return 1
}

if [ "${#targets[@]}" -eq 0 ]; then
  while IFS= read -r d; do targets+=("${d}"); done < <(
    find "${DECKS_DIR}" -maxdepth 1 -type d -name 'p[0-9][0-9][0-9]' | sort
  )
fi

# Slide IDs declared in the outline, one per `### S.n - title` heading.
outline_ids() {
  local f="$1"
  [ -f "${f}" ] || return 0
  { grep -oE '^###[[:space:]]+[0-9]+\.[A-Za-z0-9]+' "${f}" || true; } \
    | sed -E 's/^###[[:space:]]+//' | sort -u
}

# Slide IDs actually marked in the section files.
marker_ids() {
  local dir="$1"
  [ -d "${dir}" ] || return 0
  { grep -ohE '<!--[[:space:]]*_slide:[[:space:]]*[A-Za-z0-9.]+' "${dir}"/*.md 2>/dev/null || true; } \
    | sed -E 's/.*_slide:[[:space:]]*//' | sort -u
}

# "fNN kind" per registry row. figures.md is the sole allocator.
figure_rows() {
  local f="$1"
  [ -f "${f}" ] || return 0
  awk -F'|' 'NF >= 4 {
    id = $2; kind = $4
    gsub(/[`[:space:]]/, "", id); gsub(/[`[:space:]]/, "", kind)
    if (id ~ /^f[0-9]+$/) print id, kind
  }' "${f}"
}

count() { printf '%s' "$1" | grep -c '' 2>/dev/null || true; }

recency() {
  local ts
  ts="$(git -C "${ROOT}" log -1 --format=%ct -- "$1" 2>/dev/null || true)"
  echo "${ts:-0}"
}

# Everything the report needs about one deck, as shell variables.
scan_deck() {
  local dir="$1"
  id="$(basename "${dir}")"
  local outline="${dir}/draft/outline.md"
  local figures_md="${dir}/draft/figures.md"

  blockers=""
  add_blocker() { blockers="${blockers:+${blockers},}$1"; }

  # Phase 1: the four grounding artifacts.
  local p1=1
  for f in synopsis.md draft/outline.md draft/decisions.md draft/figures.md; do
    [ -f "${dir}/${f}" ] || { p1=0; add_blocker "missing-$(basename "${f}" .md)"; }
  done

  # Legacy: slides exist without the grounding artifacts behind them, so the deck
  # was not authored under this pipeline. Frozen, never migrated. p009 carries a
  # precursor draft/outline.md and still belongs here, which is why the test is
  # the whole phase-1 predicate rather than that one file.
  if [ -d "${dir}/sections" ] && [ "${p1}" -eq 0 ]; then
    phase="legacy"; phase_num=-1; next="-"
    slides="-"; mocks="-"; figures="-"; blockers=""
    return 0
  fi

  # Phase 2: every outline slide ID has a marker in a section file.
  local ids markers matched total p2=1
  ids="$(outline_ids "${outline}")"
  markers="$(marker_ids "${dir}/sections")"
  total="$(count "${ids}")"
  matched=0
  if [ -n "${ids}" ] && [ -n "${markers}" ]; then
    matched="$(comm -12 <(printf '%s\n' "${ids}") <(printf '%s\n' "${markers}") | grep -c '' || true)"
  fi
  slides="${matched}/${total}"
  if [ "${total}" -eq 0 ] || [ "${matched}" -ne "${total}" ]; then
    p2=0
  fi

  # Phase 3: every diagram figure has a mock source and a mock export.
  local rows dia_total=0 dia_done=0 built=0 fig_total=0 p3=1
  rows="$(figure_rows "${figures_md}")"
  while read -r fid kind; do
    [ -n "${fid:-}" ] || continue
    fig_total=$((fig_total + 1))
    if compgen -G "${dir}/images/figures/${fid}.*" > /dev/null; then
      built=$((built + 1))
    fi
    [ "${kind}" = "diagram" ] || continue
    dia_total=$((dia_total + 1))
    if [ -f "${dir}/draft/mocks/${fid}.excalidraw" ] \
      && [ -f "${dir}/images/mocks/${fid}.svg" ]; then
      dia_done=$((dia_done + 1))
    fi
  done <<< "${rows}"
  mocks="${dia_done}/${dia_total}"
  figures="${built}/${fig_total}"
  [ "${dia_done}" -eq "${dia_total}" ] || p3=0

  # Phase 4: slides point at real figures, and INDEX.md has been generated.
  # Three independent conditions, so the gap is named per condition. A count alone
  # reports "figures-2/2" on a deck blocked by a missing INDEX.md.
  local p4=1
  p4_gaps=""
  if [ -d "${dir}/sections" ] \
    && grep -qR 'images/mocks/' "${dir}/sections" 2>/dev/null; then
    p4=0
    p4_gaps="${p4_gaps:+${p4_gaps} }mock-refs-in-sections"
  fi
  if [ "${built}" -ne "${fig_total}" ]; then
    p4=0
    p4_gaps="${p4_gaps:+${p4_gaps} }figures-${figures}"
  fi
  if [ "${fig_total}" -gt 0 ] && [ ! -f "${dir}/images/figures/INDEX.md" ]; then
    p4=0
    p4_gaps="${p4_gaps:+${p4_gaps} }missing-index"
  fi

  phase_num=0
  for ok in "${p1}" "${p2}" "${p3}" "${p4}"; do
    [ "${ok}" -eq 1 ] || break
    phase_num=$((phase_num + 1))
  done

  case "${phase_num}" in
    0) phase="none";    next="/deck-plan ${id}" ;;
    1) phase="plan";    next="/deck-draft ${id}" ;;
    2) phase="draft";   next="/deck-mock ${id}" ;;
    3) phase="mock";    next="/deck-figures ${id}" ;;
    4) phase="figures"; next="/deck-polish ${id}" ;;
  esac

  # Name the gap that stopped the deck here, not every gap above it.
  case "${phase_num}" in
    1) [ "${p2}" -eq 1 ] || add_blocker "slides-${slides}" ;;
    2) [ "${p3}" -eq 1 ] || add_blocker "mocks-${mocks}" ;;
    3) for gap in ${p4_gaps}; do add_blocker "${gap}"; done ;;
  esac
}

emit_porcelain() {
  printf 'id=%s phase=%s phase_num=%s next=%s slides=%s mocks=%s figures=%s blocked=%s\n' \
    "${id}" "${phase}" "${phase_num}" "${next}" "${slides}" "${mocks}" "${figures}" "${blockers}"
}

rows=""
for t in "${targets[@]}"; do
  dir="$(resolve_deck "${t}")" || exit 2
  scan_deck "${dir}"
  if [ "${porcelain}" -eq 1 ]; then
    rows="${rows}$(recency "${dir}")|$(emit_porcelain)"$'\n'
  else
    rows="${rows}$(recency "${dir}")|$(printf '%-6s %-8s %-22s %s' \
      "${id}" "${phase}" "${next}" "${blockers:--}")"$'\n'
  fi
done

if [ "${porcelain}" -eq 0 ]; then
  printf '%-6s %-8s %-22s %s\n' "ID" "PHASE" "NEXT" "BLOCKED"
fi
# Filesystem mtime resolves to whichever deck was built last, so order by commit.
printf '%s' "${rows}" | sed '/^$/d' | sort -t'|' -k1,1nr | cut -d'|' -f2-
