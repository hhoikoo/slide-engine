#!/usr/bin/env bash
set -euo pipefail

# lint-text.sh -- grep the mechanically checkable subset of .claude/rules/writing-*.md
# and text-syntax.md against slide sources.
#
# Usage:
#   engine/scripts/lint-text.sh [-w] [-q] [-a] [--gate] [PATH ...]
#
#   -w      warn only: always exit 0 (for `make html`)
#   -q      quiet: counts per rule only, no per-line output
#   -a      all: also scan research/, draft/ and other planning artifacts
#   --gate  exit non-zero on the gated classes only (provenance, punctuation, svg
#           labels). Every other class still reports as a count. Implies -q.
#
# Exit: 0 clean (or --gate with no gated hit), 1 hits, 2 usage error.
#
# PATH defaults to presentations/. For a presentation directory the default scope is
# shipped text only: sections/*.md, synopsis.md, draft/outline.md, and
# images/figures/*.svg. Research notes and the rest of draft/ quote outside sources
# verbatim, so they are excluded unless -a. Mock exports are excluded always: a
# dashed brief in a mock is prose by design and would grade as a shipped label.
# Dependencies beyond the project baseline: none. Uses grep, sed, awk, find only.

# Advisory density soft caps. Reported, never gated. See docs/deck-lifecycle.md.
readonly BODY_WORD_CAP=80
readonly NOTE_WORD_CAP=40

warn_only=0
quiet=0
scan_all=0
gate_mode=0

args=()
for arg in "$@"; do
  case "${arg}" in
    --gate) gate_mode=1; quiet=1 ;;
    --*) echo "usage: $0 [-w] [-q] [-a] [--gate] [PATH ...]" >&2; exit 2 ;;
    *) args+=("${arg}") ;;
  esac
done
set -- ${args[@]+"${args[@]}"}

while getopts ":wqa" opt; do
  case "${opt}" in
    w) warn_only=1 ;;
    q) quiet=1 ;;
    a) scan_all=1 ;;
    *) echo "usage: $0 [-w] [-q] [-a] [--gate] [PATH ...]" >&2; exit 2 ;;
  esac
done
shift $((OPTIND - 1))

if [ "$#" -eq 0 ]; then
  set -- presentations
fi

collect_dir() {
  local dir="$1"
  # Transcripts are somebody else's words verbatim. Voice rules do not apply to
  # quoted speech, and "fixing" it would falsify the record.
  if [ "${scan_all}" -eq 1 ]; then
    find "${dir}" -type f -name '*.md' \
      ! -name 'slides.md' ! -name 'citation-map.md' ! -name 'INDEX.md' \
      ! -path '*/transcripts/*' | sort
    return 0
  fi
  # Shipped text only. draft/outline.md carries the deck's full cue-level content,
  # so it is in scope; the rest of draft/ is working notes.
  find "${dir}" -type f -name '*.md' \
    ! -name 'slides.md' ! -name 'citation-map.md' ! -name 'INDEX.md' \
    ! -path '*/research/*' ! -path '*/output/*' \
    \( ! -path '*/draft/*' -o -path '*/draft/outline.md' \) | sort
}

collect_svg() {
  local dir="$1"
  if [ "${scan_all}" -eq 1 ]; then
    find "${dir}" -type f -name '*.svg' \
      ! -path '*/transcripts/*' ! -path '*/images/mocks/*' | sort
    return 0
  fi
  find "${dir}" -type f -name '*.svg' \
    ! -path '*/research/*' ! -path '*/draft/*' ! -path '*/output/*' \
    ! -path '*/images/mocks/*' | sort
}

md_files=""
svg_files=""
for target in "$@"; do
  if [ -f "${target}" ]; then
    case "${target}" in
      *.svg) svg_files="${svg_files}${target}"$'\n' ;;
      *)     md_files="${md_files}${target}"$'\n' ;;
    esac
  elif [ -d "${target}" ]; then
    md_files="${md_files}$(collect_dir "${target}")"$'\n'
    svg_files="${svg_files}$(collect_svg "${target}")"$'\n'
  else
    echo "lint-text: no such path: ${target}" >&2
    exit 2
  fi
done

md_files="$(printf '%s' "${md_files}" | sed '/^$/d')"
svg_files="$(printf '%s' "${svg_files}" | sed '/^$/d')"

errors=0
warns=0
gate_hits=0

# Classes a machine can decide. Everything else is a judgement call, and hard-gating
# judgement classes is what makes an author delete real content to get a green light.
is_gated() {
  case "$1" in
    PROV-0[1-4]|PUNC-0[1-5]|SVG-0[1-4]) return 0 ;;
    *) return 1 ;;
  esac
}

# check LEVEL CODE MESSAGE PATTERN [FILE_LIST]
check() {
  local level="$1" code="$2" msg="$3" pattern="$4" list="${5:-${md_files}}"
  local hits count
  [ -n "${list}" ] || return 0
  hits="$(printf '%s\n' "${list}" | tr '\n' '\0' \
    | xargs -0 grep -nE -- "${pattern}" 2>/dev/null || true)"
  [ -n "${hits}" ] || return 0
  count="$(printf '%s\n' "${hits}" | grep -c '' || true)"
  printf '%s %-8s %-28s %s hit(s)\n' "${level}" "${code}" "${msg}" "${count}"
  if [ "${quiet}" -eq 0 ]; then
    printf '%s\n' "${hits}" | sed 's/^/    /' | cut -c1-160
  fi
  if [ "${level}" = "ERROR" ]; then
    errors=$((errors + count))
  else
    warns=$((warns + count))
  fi
  if is_gated "${code}"; then
    gate_hits=$((gate_hits + count))
  fi
}

echo "== provenance (zero tolerance) =="
check ERROR PROV-01 "chatgpt paste residue" \
  'oaicite|oai_citation|contentReference|citeturn|turn0search|turn0image|utm_source=chatgpt\.com'
check ERROR PROV-02 "gemini / grok / perplexity" \
  '\[cite: |start_span|end_span|grok-card|grok_render_citation|ppl-ai-file-upload|\[attached_file:|\[web:[0-9]'
check ERROR PROV-03 "assistant-voice leakage" \
  'As an AI language model|as of my last knowledge update|I hope this helps|좋은 질문이네요'
check ERROR PROV-04 "unfilled placeholder" \
  '\[Your Name\]|20[0-9][0-9]-XX-XX|TODO: fill|LOREM IPSUM'

echo
echo "== punctuation (text-syntax.md) =="
check ERROR PUNC-01 "em dash" '—'
check ERROR PUNC-02 "en dash outside a number range" '[^0-9]–|–[^0-9]'
check ERROR PUNC-03 "ASCII -- as prose punctuation" '[^-!<]-- [^-]|[a-zA-Z가-힣]--[a-zA-Z가-힣]'
check ERROR PUNC-04 "curly quotes" '[“”‘’]'
# Backticked glyphs are a spec naming the character, not prose decorated with it.
check ERROR PUNC-05 "decorative unicode" '[^`][→←⇒✓✔✅❌🚀💡⚠📊•][^`]'
check WARN  PUNC-06 "ellipsis character" '…'
check WARN  PUNC-07 "가운뎃점 in prose (ration)" '·'

echo
echo "== structure (writing-core.md) =="
check ERROR FMT-01 "**Label**: bullet shape" '^ *[-*] +\*\*[^*]+\*\*:'
check WARN  FMT-02 "Title Case heading" '^#{2,4} +([A-Z][a-z]+ ){2,}[A-Z][a-z]+ *$'
check WARN  FMT-03 "thematic break before heading" '^\*\*\*$'

# Wrapped prose cannot be found by grep alone: it needs the previous line's
# length and block context. unwrap-md.py --check is the real test.
if [ "${md_files}" != "" ] && [ -x engine/scripts/unwrap-md.py ]; then
  wrapped=$(printf '%s\n' "${md_files}" | grep -v '^$' | grep -v '^presentations/' || true)
  if [ -n "${wrapped}" ]; then
    # unwrap-md.py exits non-zero when it finds a hit, so every pipeline reading it
    # needs the guard: under pipefail an unguarded one aborts the whole run and the
    # checks below this point never execute.
    found="$(printf '%s\n' "${wrapped}" | xargs python3 engine/scripts/unwrap-md.py --check 2>/dev/null || true)"
    hits="$(printf '%s\n' "${found}" | { grep -c '^wrapped' || true; })"
    if [ "${hits}" -gt 0 ]; then
      printf 'ERROR %-9s %-28s %s hit(s)\n' "FMT-04" "hard-wrapped paragraph" "${hits}"
      if [ "${quiet}" -eq 0 ]; then
        printf '%s\n' "${found}" | { grep '^wrapped' || true; } | sed 's/^wrapped */    /'
      fi
      errors=$((errors + hits))
    fi
  fi
fi

echo
echo "== korean, measured =="
check ERROR KO-01 "연결어미 + comma (4.84x)" '(하고|되고|있고|없고|지고|리고|추고|이고|기고|우고|주고|보고|가고|오고|서고|두고|놓고|나고|타고|사고|자고|피고|열고|걸고|받고|맡고|남고|묶고|쓰고|끄고|넣고|찍고|섞고|짓고|굽고|굴고|들고), '
check ERROR KO-02 "연결어미 + comma, broad" '(며|지만|면서|는데|아서|어서|해서|워서|라서|고서|다가|거나|든지|더니|으나|지요), '
# The reversed form, "A이지 B가 아니다". The gap is bounded and 않 is excluded on
# purpose: "~지 않다" is ordinary negation, so an unbounded gap flags every
# "보이지 않음" in the corpus.
check ERROR KO-03 "A가 아니라 B (9.2x)" '아니라|아닌가, |인가, |이지 [^.]{0,25}(아니|아님)'
# "A 대신 B" is the substitution form of the same antithesis. Ordinary substitution
# dominates the corpus (`달러 대신 퍼센트`), so this warns on the bare noun-pair shape
# only, where the tic lives, and takes 는/은/을/인 off the left to drop the clause
# form. Adnominal endings that fuse into the syllable (`느린 대신`, `단순한 대신`) still
# get through; they are honest tradeoffs and worth the glance a WARN asks for.
check WARN  KO-03b "A 대신 B (check by hand)" '[가-힣]{1,5}[^는은을인ㄴ] 대신 [가-힣]{2,6}(을|를|이|가)'
check ERROR KO-04 "meta-commentary" '핵심은|중요한 것은|주목할 점은'
check ERROR KO-05 "wrap-up pivot" '결론적으로|요약하면|종합하면|정리하자면|정리하면'
check WARN  KO-06 "~할 수 있습니다 hammer" '할 수 있습니다|할 수 있다'
check WARN  KO-07 "significance inflation" '매우 중요|시사하는 바가|주목할 만|간과할 수 없|지평을 열'
check WARN  KO-08 "hype / cliché lexicon" '혁신적|획기적|선도적|차별화된|탁월한|원활한|압도적|막강한|폭발적|파격적'
check WARN  KO-09 "connector quota (max 2/doc)" '(^|[ .]) *(또한|따라서|그러므로|게다가|이에 따라|나아가|아울러|더불어) '
check WARN  KO-10 "AI connector glue" '이를 통해|이를 바탕으로|이와 같이|이러한 가운데'
check WARN  KO-11 "번역투" '에 대해|에 있어|에 의해|되어진|되어졌|여진다|가지고 있|이루어졌|함으로써|에도 불구하고|의 경우에는'
check WARN  KO-12 "~적 N nominalization" '적 [가-힣]+(을|를|이|가|은|는|과|와|에)'
check WARN  KO-13 "speculative hedge stack" '것으로 보인다|것으로 판단|라고 여겨|인 듯하다|있을 수 있|보여질 수 있'
check WARN  KO-14 "closing formula" '할 때입니다|시점입니다|할 순간입니다|을 넘어 .*로$'

echo
echo "== english vocabulary (writing-en.md) =="
check WARN  EN-01 "hype adjectives" '\b(robust|seamless|comprehensive|cutting-edge|state-of-the-art|next-generation|best-in-class|groundbreaking|unprecedented|game-changing|transformative|innovative|pivotal|crucial|bespoke|holistic|multifaceted)\b'
check WARN  EN-02 "hype verbs" '\b(leverage|leverages|leveraging|utilize|utilizes|harness|harnesses|streamline|streamlines|empower|empowers|unlock|unlocks|unleash|delve|delves|delving|showcase|showcases|showcasing|underscore|underscores|foster|fosters|elevate|amplify|bolster)\b'
check WARN  EN-03 "abstract nouns" '\b(tapestry|realm|landscape|ethos|zeitgeist|cornerstone|nexus|synergy|paradigm|plethora|myriad|testament)\b'
check WARN  EN-04 "significance puffery" 'is a testament to|serves as a reminder|underscores the importance|marking a turning point|setting the stage for|shaping the future of|stands as a'
check WARN  EN-05 "-ing significance tail" ', (highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|contributing to|fostering|showcasing|aligning with) '
check ERROR EN-06 "negative parallelism" "[Ii]t( i|')s not just|[Nn]ot just .* but also|[Ii]t( i|')s not .*, it( i|')s "
# " rather than " is the fourth antithesis form, but the rhetorical use is
# indistinguishable by regex from an ordinary comparative ("copy it into both
# rather than sharing"). Warn on the rhetorical shape only: a short predicate on
# each side, no comma, which is where the tic actually lives.
check WARN  EN-06b "'X rather than Y' antithesis (check by hand)" '\b(is|are|was|were|feels|reads|becomes|remains) +[a-z]+ rather than +[a-z]+\b'
check ERROR EN-07 "vague attribution" '[Ii]ndustry reports|[Oo]bservers have cited|[Ee]xperts argue|[Ss]ome critics argue|[Ss]tudies show'
check WARN  EN-08 "stock connective" '\b(Furthermore|Moreover|Additionally|In light of this|Moving forward|At the end of the day|Without further ado)\b'
check WARN  EN-09 "copula avoidance" '\b(serves as|stands as|functions as|represents a|boasts a)\b'
check ERROR EN-10 "cutoff disclaimer" 'as of my last update|may not have the latest|training data goes through'

if [ -n "${svg_files}" ]; then
  echo
  echo "== svg labels (writing-shortform.md) =="
  check ERROR SVG-01 "em / en dash in label" '<text[^>]*>[^<]*[—–]' "${svg_files}"
  check ERROR SVG-02 "ampersand in label" '<text[^>]*>[^<]*&amp;' "${svg_files}"
  check ERROR SVG-03 "emoji / decorative glyph" '<text[^>]*>[^<]*[→←⇒✓✔✅❌🚀💡⚠📊]' "${svg_files}"
  check ERROR SVG-04 "가운뎃점 in label" '<text[^>]*>[^<]*·' "${svg_files}"
  check WARN  SVG-05 "trailing period on fragment" '<text[^>]*>[^<]*[a-z가-힣]\.</text>' "${svg_files}"
  check WARN  SVG-06 "Title Case label" '<text[^>]*>([A-Z][a-z]+ ){1,}[A-Z][a-z]+</text>' "${svg_files}"
  check WARN  SVG-07 "gerund-initial label" '<text[^>]*>[A-Z][a-z]+ing ' "${svg_files}"
  check WARN  SVG-08 "vague head-noun" '<text[^>]*>[^<]*\b(Layer|Engine|Platform|Solution|Ecosystem|Framework|Manager|Handler|Processor|Module|Abstraction|Orchestration)\b' "${svg_files}"
  check WARN  SVG-09 "종결어미 in label" '<text[^>]*>[^<]*(합니다|됩니다|입니다|있습니다)' "${svg_files}"
fi

# Density is a judgement call. These counts exist so the judgement has numbers under
# it; they never change the exit code. 00.md carries frontmatter, not slides.
section_files="$(printf '%s\n' "${md_files}" | grep '/sections/' | grep -v '/sections/00' || true)"
if [ -n "${section_files}" ]; then
  echo
  echo "== density (advisory, never gates) =="
  printf '%s\n' "${section_files}" | tr '\n' '\0' | xargs -0 awk \
    -v body_cap="${BODY_WORD_CAP}" -v note_cap="${NOTE_WORD_CAP}" -v verbose="$((1 - quiet))" '
function words(s,   a) {
  gsub(/!\[[^]]*\]\([^)]*\)/, " ", s)
  gsub(/<[^>]*>/, " ", s)
  gsub(/[#*`>|]/, " ", s)
  gsub(/^[ \t]+|[ \t]+$/, "", s)
  if (s == "") return 0
  return split(s, a, /[ \t]+/)
}
function is_directive(s) {
  gsub(/^[ \t]+|[ \t]+$/, "", s)
  return (s ~ /^_[A-Za-z]/) || (s ~ /^(vendor|whitelabel)-(start|end)$/) || (s ~ /^img-needed:/)
}
function deck_of(path,   i) {
  i = index(path, "/sections/")
  return (i > 0) ? substr(path, 1, i - 1) : path
}
function seen(d) {
  if (!(d in known)) { known[d] = 1; dorder[++dcount] = d }
}
function emit_body(   d) {
  if (cur_file == "") return
  d = deck_of(cur_file); seen(d)
  bodies[d] = bodies[d] " " bodyw
  nslides[d]++
  if (bodyw > body_cap && verbose)
    flag[d] = flag[d] sprintf("    %s slide %d: body %d words (soft cap %d)\n", cur_file, slide, bodyw, body_cap)
}
function emit_note(   d) {
  d = deck_of(cur_file); seen(d)
  notes[d] = notes[d] " " notew
  nnotes[d]++
  if (notew > note_cap && verbose)
    flag[d] = flag[d] sprintf("    %s slide %d: note %d words (soft cap %d)\n", cur_file, slide, notew, note_cap)
  notew = 0
}
function maxof(s,   n, a, i, m) {
  n = split(s, a, " ")
  if (n == 0) return 0
  m = a[1] + 0
  for (i = 2; i <= n; i++) if (a[i] + 0 > m) m = a[i] + 0
  return m
}
function medof(s,   n, a, i, j, t) {
  n = split(s, a, " ")
  if (n == 0) return 0
  for (i = 2; i <= n; i++) {
    t = a[i] + 0; j = i - 1
    while (j >= 1 && a[j] + 0 > t) { a[j+1] = a[j]; j-- }
    a[j+1] = t
  }
  if (n % 2) return a[(n+1)/2] + 0
  return int((a[n/2] + a[n/2+1]) / 2)
}
FNR == 1 {
  emit_body()
  cur_file = FILENAME; slide = 1; bodyw = 0; notew = 0; innote = 0; instyle = 0
}
{
  if (innote) {
    txt = $0
    if (txt ~ /-->/) { sub(/-->.*/, "", txt); innote = 0 }
    notew += words(txt)
    if (!innote) emit_note()
    next
  }
  if (instyle) { if ($0 ~ /<\/style>/) instyle = 0; next }
  if ($0 ~ /<style/) { if ($0 !~ /<\/style>/) instyle = 1; next }
  if ($0 ~ /^[ \t]*<!--/) {
    inner = $0
    sub(/^[ \t]*<!--/, "", inner)
    closed = 0
    if (inner ~ /-->/) { sub(/-->.*/, "", inner); closed = 1 }
    if (is_directive(inner)) next
    notew = words(inner)
    if (closed) emit_note(); else innote = 1
    next
  }
  if ($0 ~ /^---[ \t]*$/) { emit_body(); slide++; bodyw = 0; next }
  bodyw += words($0)
}
END {
  emit_body()
  for (i = 1; i <= dcount; i++) {
    d = dorder[i]
    printf "DEN   %-26s %3d slides, body words max/med %d/%d; %3d notes, note words max/med %d/%d\n",
      d, nslides[d] + 0, maxof(bodies[d]), medof(bodies[d]),
      nnotes[d] + 0, maxof(notes[d]), medof(notes[d])
    printf "%s", flag[d]
  }
}'
fi

count_lines() {
  [ -n "$1" ] || { echo 0; return 0; }
  printf '%s\n' "$1" | grep -c '' || true
}

echo
printf 'lint-text: %s error(s), %s warning(s), %s gated hit(s) over %s markdown and %s svg file(s)\n' \
  "${errors}" "${warns}" "${gate_hits}" \
  "$(count_lines "${md_files}")" "$(count_lines "${svg_files}")"

if [ "${gate_mode}" -eq 1 ]; then
  [ "${gate_hits}" -gt 0 ] && exit 1
  exit 0
fi
if [ "${warn_only}" -eq 1 ]; then
  exit 0
fi
if [ "${errors}" -gt 0 ] || [ "${warns}" -gt 0 ]; then
  exit 1
fi
exit 0
