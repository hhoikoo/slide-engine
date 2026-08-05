# Writing core

No `paths:` on purpose: unscoped rules load at launch and survive `/compact`, path-scoped ones do not. This is the backstop.

Owns the always-on rules. Long tails: `writing-en.md`, `writing-ko.md`, `writing-shortform.md`. Punctuation: `text-syntax.md`.

## Register by surface

| Surface | Register | Ends with |
|---|---|---|
| Slide bullet | terse fragment, one idea. Korean 개조식, noun-final, no 해요체/합니다체 | noun or number, no period |
| Speaker note | rare by default. Bullet fragments, never connected prose | noun or fragment, no period |
| Diagram label, box header, axis label | noun phrase, sentence case, 1-4 words | nothing |
| Divider subtitle, `header:` string, alt text | noun phrase | nothing |
| Prose (docs, research, synopsis, outline, README) | direct declarative sentences | period |

Verbless fragments, dropped articles, and dropped Korean 조사 are **correct** in the first four rows and wrong in the last. Never apply prose rules to a label, or label rules to a slide bullet.

**Less is more, on both surfaces.** A speaker note exists only for something that genuinely cannot be slide content or a figure and still has to be said aloud. Genuine uncertainty is one licensed reason. No walls of text in a slide body either. `engine/scripts/lint-text.sh` reports density counts (words per slide body, words per note block, note blocks per deck) and never gates on them, because hard-gating a judgement class is what makes an author delete real content to get a green light.

Decks written before this bar carry long prose notes. They are not migrated; `deck-status.sh` reports them as `phase=legacy` and the note checks skip.

## The honesty bar

The line between a real deck and AI filler. None of this is a style preference.

- Put on a slide only what a source said or what you can verify. Summarizing a session means summarizing what was covered, not what a textbook would cover.
- No invented numbers, benchmarks, dates, or "studies show". Every figure comes from a named source and gets `<sup>[research:{id}]</sup>`.
- Mark uncertainty in the speaker's voice, in the notes ("이 부분은 확인 필요", "not sure about this part yet") or under `## Open` in `draft/decisions.md`. Do not smooth over a gap with confident generic prose.
- Allow honest negatives. Annoying tradeoffs get said out loud. Positivity bias is a tell.
- Never raise confidence beyond the source. Never invent an anonymous authority ("업계에서는", "experts argue"). Name it or drop the claim.
- Researched rather than attended: say where it came from, keep claims inside what the source supports.
- Never fabricate a quotation, a DOI, or a link.

## The twenty

1. No em dash, en dash, or ASCII `--` as prose punctuation, in any language. See `text-syntax.md`.
2. **No negative parallelism**, all four forms: "it's not X, it's Y" / "not just X, but also Y" / **"X rather than Y"** / "A가 아니라 B". Measured 9.2x AI-over-human in Korean, the strongest single signal in any language. State what the thing is.
3. No rhetorical-question pivot ("The result?", "왜일까요?"). Give the answer.
4. No meta-commentary: "the key is", "what matters here", "핵심은 ~이다", "중요한 것은". State the content.
5. No summary ending. The closing slide or paragraph carries something new, never a recap of what was just shown.
6. No praise-challenge-optimism sandwich, and no "Despite these challenges..." pivot.
7. Rule of three: use the real number. Two is fine. Four is fine. Never pad or trim to hit three, in prose or in boxes.
8. Bold budget: key numbers, and a product name on first mention. Max 2-3 bold spans per slide. Never `**Label**: description` as a bullet shape.
9. Sentence case in every heading, title, and label. Capitalize the first word and proper nouns only.
10. One term per concept. No synonym cycling ("the project" -> "the initiative" -> "the endeavor").
11. Specificity test: if a sentence could front any deck on any topic, rewrite it with the actual number, name, or mechanism, or cut it.
12. Vary depth by how much there is to say. Do not pad a thin point to match a rich one. Length follows the material, never a slide count.
13. Vary sentence length. The measured tell is the **absence** of long sentences, not the presence of short ones (Korean: 100+ char sentences, AI 8.1 vs human 91.3 per 1000, 11x). Every prose paragraph should carry at least one long sentence. Fix by joining adjacent sentences; add no content.
14. Korean: no comma right after a connective ending (`-고 / -며 / -지만 / -면서 / -아서·어서 / -는데`). Measured 4.84x. Strongest surface metric in Korean.
15. Korean: keep commas in under half of your sentences (measured 2.32x).
16. Korean: no `~할 수 있습니다` hammer. More than two in a section, rewrite.
17. Korean: `결론적으로 / 요약하면 / 종합하면 / 정리하자면`. Delete on sight, state the conclusion.
18. Korean: keep English technical terms in English, and hold one spelling per term across the whole document.
19. No emoji, anywhere. Also breaks Marp's twemoji inline layout.
20. No knowledge-cutoff hedges and no assistant-voice leakage: "as of my last update", "I hope this helps", "좋은 질문이네요", "while preserving the original structure".

## Deck structure

- Open with the actual content. No "이번 발표에서는 ~를 다뤄보겠습니다" opener beyond the title slide.
- Section titles name the thing, not a category. "캐시 키에 타임스탬프가 들어간 이유", not "주요 개념".
- End on a concrete takeaway from the material. A "Thank you" / "Q&A" divider is fine; a confessional closer is not.
- **No blanket source footer.** Cite specific claims inline where you make them. A trailing "출처: ..." slide naming where the whole deck came from is not a citation.
- **No trailing "open questions" / "다음에 볼 것" slide.** Genuine uncertainty goes in the speaker notes of the slide where it comes up, or under `## Open` in `draft/decisions.md`.
- A figure earns its place by showing something the bullets cannot. Never add one to fill space.
- Divider slides usually need only the section title. Add a subtitle only when it carries context the title does not.

## Exemplars

Worked pairs beat blocklists. Match these, not the rule text.

**English, slide body.**

Before:
```markdown
## Rethinking Our Caching Strategy

- **Performance**: leveraging a robust multi-tier cache to unlock seamless response times
- **Scalability**: a comprehensive approach that ensures the system scales effortlessly
- It's not just about speed, it's about delivering a transformative user experience
```

After:
```markdown
## Cache misses drove p99 to 1.4s

- Key included a timestamp. Every request missed
- Dropping the timestamp took p99 from **1.4s to 90ms**
- Hit rate is 94%. The remaining 6% are cold-start reads we did not fix
```

Fixed: Title Case, three blocklist adjectives, `**Label**:` shape, negative parallelism, zero numbers, a padded third bullet.

**Korean, speaker note.**

Before:
```
결론적으로, 이 아키텍처는 매우 혁신적인 접근을 통해 확장성을 확보하고, 안정성 또한
크게 향상시킬 수 있습니다. 핵심은 캐시 계층의 분리라는 점에 있습니다.
```

After:
```
- 락 경합이 사라진 건 읽기 경로가 갈린 부수 효과
- 안정성은 아직 확인 중
```

Fixed: 결론적으로 pivot, 혁신적인 hype adjective, `통해` as universal connector, comma after `-하고`, `~할 수 있습니다` hedge, `핵심은 ~라는 점에 있다` meta-commentary. The rewrite also drops to two fragments, because the mechanism belongs on the slide and only the aside and the open question have to be spoken.

Connected Korean prose still exists, in `synopsis.md`, `draft/outline.md` and `research/`. Its rules, including rule 13's long sentence, are in `writing-ko.md` under "Register: connected prose".

## Verification

Rules are checked, not hoped for. Run `engine/scripts/lint-text.sh` on what you write; run `/revise` before a deck ships.

Look it up rather than recall it. Library APIs, another project's behaviour, specs, and every Claude Code surface (frontmatter fields, hook events, settings keys, permission syntax) get read from the source before you rely on them. `verify-before-assuming.md` has the lookup routes and the project's sources of truth, but it is path-scoped and may not be loaded: this line is the part that always applies.
