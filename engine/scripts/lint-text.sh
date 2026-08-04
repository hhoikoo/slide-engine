#!/usr/bin/env bash
set -euo pipefail

# lint-text.sh -- grep the mechanically checkable subset of .claude/rules/writing-*.md
# and text-syntax.md against slide sources.
#
# Usage:
#   engine/scripts/lint-text.sh [-w] [-q] [-a] [PATH ...]
#
#   -w  warn only: always exit 0 (for `make html`)
#   -q  quiet: counts per rule only, no per-line output
#   -a  all: also scan research/, draft/ and other planning artifacts
#
# PATH defaults to presentations/. For a presentation directory the default scope is
# shipped text only: sections/*.md, synopsis.md, and images/figures/*.svg. Research
# notes and drafts quote outside sources verbatim, so they are excluded unless -a.
# Dependencies beyond the project baseline: none. Uses grep, sed, find only.

warn_only=0
quiet=0
scan_all=0
while getopts ":wqa" opt; do
  case "${opt}" in
    w) warn_only=1 ;;
    q) quiet=1 ;;
    a) scan_all=1 ;;
    *) echo "usage: $0 [-w] [-q] [-a] [PATH ...]" >&2; exit 2 ;;
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
  # Shipped text only.
  find "${dir}" -type f -name '*.md' \
    ! -name 'slides.md' ! -name 'citation-map.md' ! -name 'INDEX.md' \
    ! -path '*/research/*' ! -path '*/draft/*' ! -path '*/output/*' | sort
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
    svg_files="${svg_files}$(find "${target}" -type f -name '*.svg' | sort)"$'\n'
  else
    echo "lint-text: no such path: ${target}" >&2
    exit 2
  fi
done

md_files="$(printf '%s' "${md_files}" | sed '/^$/d')"
svg_files="$(printf '%s' "${svg_files}" | sed '/^$/d')"

errors=0
warns=0

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
    hits=$(printf '%s\n' "${wrapped}" | xargs python3 engine/scripts/unwrap-md.py --check 2>/dev/null | grep -c '^wrapped' || true)
    if [ "${hits}" -gt 0 ]; then
      printf 'ERROR %-9s %-28s %s hit(s)\n' "FMT-04" "hard-wrapped paragraph" "${hits}"
      printf '%s\n' "${wrapped}" | xargs python3 engine/scripts/unwrap-md.py --check 2>/dev/null | grep '^wrapped' | sed 's/^wrapped */    /'
      errors=$((errors + hits))
    fi
  fi
fi

echo
echo "== korean, measured =="
check ERROR KO-01 "연결어미 + comma (4.84x)" '(하고|되고|있고|없고|지고|리고|추고|이고|기고|우고|주고|보고|가고|오고|서고|두고|놓고|나고|타고|사고|자고|피고|열고|걸고|받고|맡고|남고|묶고|쓰고|끄고|넣고|찍고|섞고|짓고|굽고|굴고|들고), '
check ERROR KO-02 "연결어미 + comma, broad" '(며|지만|면서|는데|아서|어서|해서|워서|라서|고서|다가|거나|든지|더니|으나|지요), '
check ERROR KO-03 "A가 아니라 B (9.2x)" '아니라|아닌가, |인가, '
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
check ERROR EN-06 "negative parallelism" "[Ii]t'?s not just|[Nn]ot just .* but also|[Ii]t'?s not .*, it'?s "
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

count_lines() {
  [ -n "$1" ] || { echo 0; return 0; }
  printf '%s\n' "$1" | grep -c '' || true
}

echo
printf 'lint-text: %s error(s), %s warning(s) over %s markdown and %s svg file(s)\n' \
  "${errors}" "${warns}" \
  "$(count_lines "${md_files}")" "$(count_lines "${svg_files}")"

if [ "${warn_only}" -eq 1 ]; then
  exit 0
fi
if [ "${errors}" -gt 0 ] || [ "${warns}" -gt 0 ]; then
  exit 1
fi
exit 0
