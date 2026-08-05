---
paths:
  - "presentations/**/*.md"
---
# Korean writing rules

Korean long tail. Always-on rules: `writing-core.md`. Punctuation: `text-syntax.md`. Labels: `writing-shortform.md`.

**[measured]** marks a published human-vs-AI ratio. Everything else is convention; no hard ban rests on an unmeasured item.

## Register: slide bullets

- **개조식.** Noun-final fragments, particles minimized: `자동 회수 적용`, `p99 90ms로 개선`, `검토 중`. A noun-final bullet has no 종결어미 to repeat, which dissolves the monotony problem structurally.
- No 해요체, no 합니다체, no sentence-final verb unless the bullet is a full claim.
- One idea per bullet. Split rather than comma-chaining.
- The flow rules below do **not** apply here. Never write 3-4 sentence paragraphs on a slide.

## Register: connected prose

`synopsis.md`, `draft/outline.md`, `research/`, repo docs, and any other connected Korean prose. The only place the flow rules apply. Speaker notes are not prose; see the next section.

- Connect clauses inside one sentence with connective endings (`~이고`, `~인데`, `~하는데`). Parenthetical asides welcome.
- **[measured]** The tell is the **absence of long sentences**, not the presence of short ones: 100+ char sentences run AI 8.1 vs human 91.3 per 1000 (11x). Every paragraph carries at least one long sentence. Fix by joining adjacent sentences; add no content.
- Opposite failure mode, also a tell: all-simple-sentence prose. Target roughly 60% simple, 30%+ complex.
- 3-4 sentences per paragraph. One-sentence paragraphs for deliberate emphasis only.

## Register: speaker notes

Rare by default. A note exists only for something that cannot be slide content or a figure and still has to be said aloud, and an honest open question is one licensed reason.

- Bullet fragments, never connected prose. Two or three at most.
- The flow rules above do not apply. A note that runs to 3-4 connected sentences is a slide body in the wrong place.
- Mixed endings are still right within a fragment (`~돼요`, `~하는 중`, `확인 필요`). Do not default to ~합니다 for every line.
- **Human markers to include** (notes only, never a slide bullet): 제가 써보니까 / 해보면; 근데 말이죠; 진짜, 확, 완전; fragments like 당연하죠 / 아직 확인 중; 의태어 뚝딱, 술술, 쭉쭉.

## AVOID: over-translation of technical terms

Keep English technical terms in English unless the Korean is genuinely more natural (`배포` for deployment, when not a K8s Deployment).

| Do not write | Write instead |
|---|---|
| 스케줄러 | Scheduler |
| 토폴로지 | Topology |
| 에이전트 | Agent |
| 프리미티브 | Primitive |
| 오케스트레이터 | Orchestrator |
| 오퍼레이터 | Operator |
| 컨트롤 플레인 | Control Plane |
| 인퍼런스 | Inference |
| 트레이닝 | Training |
| 어드미션 | Admission |
| 프리엠션 | Preemption |
| 라이프사이클 | Lifecycle |
| 서비스 디스커버리 | Service Discovery |
| 오토스케일러 | Autoscaler |
| 시나리오 | Scenario (or rephrase) |

Exception: now-standard Korean IT vocabulary (서버, 클러스터, 컨테이너, 스냅샷, 파이프라인, 리뷰). Acronyms (API, SDK, CLI, GPU, LLM) always stay original; `prompt -> 지시문`, `token -> 표식` are wrong.

### Calqued concept phrases (개념어 음차)

Multi-word English concept phrases transliterated wholesale read as raw translation. Replace with the Korean idea, not the sound.

| Do not write | Write instead |
|---|---|
| 멘탈 모델 | 큰 그림 / 머릿속 그림 / 사고 틀 |
| 토이 예시 | 단순 예시 / 간단한 예시 |
| 베이스라인 (as "baseline scenario") | 기본 그림 / 기준 (or keep `baseline` in English) |
| 유즈 케이스 | 사용 사례 / 쓰임새 |

### Transliteration consistency

Pick one spelling and hold it across the document. English-heavy decks default to English: `routing` not 라우팅, `telemetry` not 텔레메트리. A one-off 음차 next to the same word in Latin script is the tell.

## AVOID: 번역투 (translation-ese)

영어 구문을 한국어로 1대1 옮긴 흔적. 슬라이드 본문과 speaker notes 모두 적용.

| Do not write | Write instead |
|---|---|
| X에 대해(서) 논의한다 | X를 논의한다 (목적격 직결) |
| X에 있어(서) | X에서, X를 볼 때 |
| X를 기반으로 한 / X에 기반하여 | X로 만든, X 위에 세운, X로 |
| X함으로써 | X하면, X해서 |
| 경쟁력을 가지고 있다 (have + N) | 경쟁력이 강하다 (형용사로 환원) |
| 판단되어진다 (이중 피동) | 판단된다 / 판단한다 |
| AI에 의해 생성된 이미지 (by-passive) | AI가 만든 이미지 (행위자를 주어로) |
| 합의가 이루어졌다 | 합의했다 |
| 마포구에 위치한다 | 마포구에 있다 |
| AI 기술 발전 속도 가속화 (명사 나열) | AI 기술의 발전 속도가 빨라진다 (조사 복원) |
| 저의 경우에는 | 저는 |
| 한강으로부터 10km | 한강에서 10km |
| 많은 학생들이 | 많은 학생이 (수량 표현이 이미 복수) |
| 이러한 노력에도 불구하고 | 이러한 노력에도 |
| 아무리 강조해도 지나치지 않는다 | 중요하다 |
| 긴장으로부터의 해방 (조사 중첩 `-에서의 / -으로의 / -로부터의`) | 긴장에서 벗어남 |

**영어 대명사 직역 (그/그녀/그것/그들).** "존은 피곤했다. 그는 앉았다. 그는 시계를 보았다" -> "존은 피곤했다. 자리에 앉아 시계를 보았다." Scope guard: fires on **translated** text only. **[measured]** In natively written Korean humans use 그는/그의 *more* than AI (1.9 vs 0.0 per 1000 어절).

### Two rules that measurement disproved

Earlier versions of this file banned both. Both bans were wrong.

- **`~를 통해` is not an AI tell.** 최희경 (2016): non-translated Korean **84.4** vs translated **42.1**. Natives use it twice as often. Only "universal connector, 3+ per paragraph" is a style problem, and the fix is variety (`X로`, `X해서`), not deletion.
- **`것이다` is not an AI tell.** **[measured]** AI **20.4** vs human **43.0** per 1000. Only 3+ consecutive `~인 것이다 / ~할 것이다` closers read mechanical. Plain `~의` is fine too; 국립국어원 holds it native since the 15th century.

## AVOID: 연결어미 뒤 쉼표

**[measured]** Strongest single Korean surface metric: KatFish, human **4.10%** vs AI **19.83%** (4.84x). No comma right after `-고 / -며 / -지만 / -면서 / -아서·어서 / -자 / -는데`. "발전하지만, 대응은 더디다" -> "발전하지만 대응은 더디다". The ending carries the breath. 6+ per document is decisive; 3-5 is strong.

**[measured]** Comma density: keep the share of sentences containing a comma under 50% (human 26.31% vs AI 61.03%, 2.32x). Mean comma-segment length should stay under 7 어절 (human 4.35 vs AI 8.56).

## AVOID: 대칭 대조 (A가 아니라 B)

**[measured]** Strongest signal in the whole taxonomy: AI **5.8** vs human **0.6** per 1000 sentences (9.2x, G²=41.7, p<0.0001; 18x vs personal blogs). Model-independent. Also `A인가, B인가`. 3+ per document is decisive. Describe B directly.

## AVOID: AI signature endings

LLM이 결산·종결 문장을 자동으로 이렇게 닫는다. Quotas are per document.

- **결산 피벗** (max 3): 결론적으로 / 요약하면 / 종합하면 / 정리하자면 / ~라고 할 수 있다 / ~라고 볼 수 있다. Drop, state the conclusion.
- **의미 부연 종결** (max 2): ~다는 뜻이다 / ~다는 의미다 / ~라는 점에 있다 -> 단언.
- **권고형 결말** (max 5): ~해야 한다 / ~해야 합니다 as every closer -> 구체 동사 단언 또는 주체 명시 ("정부는 ~를 도입한다").
- **완결 공식** (max 1): ~할 때입니다 / ~로 나아갈 시점입니다 / ~할 순간입니다.
- **전환 공식** (max 1): `X에서 Y로` / `X을 넘어 Y로`. "'지식 전달자'에서 '학습 조력자'로" -> "교사는 더 이상 지식 전달자가 아니다. 학생 곁에서 학습을 돕는다."
- **의미 인플레**: 매우 중요하다 / 시사하는 바가 크다 / 주목할 만하다 / 간과할 수 없다 / ~의 지평을 연다.
- **추상 주어 의인화**: "기술이 묻는다", "시대가 부른다". Name a real agent.

## AVOID: formal ending monotony

AI defaults to ~합니다/~입니다 for every sentence. In notes, mix registers.

| AI-like | Human-like |
|---|---|
| ~할 수 있습니다 (repeated) | ~돼요 / ~됩니다 / ~가능 |
| ~하고 있습니다 | ~하는 중 / ~하고 있어요 |
| ~고 있다 (English `be -ing` calque) | ~는다 ("읽고 있다" -> "읽는다") |

Same 종결어미 four times consecutively is the threshold. Vary with ~었다 / ~ㄴ다 / ~는다 / ~기 마련이다.

## AVOID: intensifier and connector overuse

- **Intensifiers**: 매우 -> 정말/진짜/엄청; 굉장히 -> drop; 정말로 -> 정말; 실제로 -> drop or 사실. Cut degree adverbs ~90%, except where the source is spoken and the adverb is the speaker's voice.
- **Connectors**: 따라서 / 그러므로 -> 그래서; 게다가 -> 거기다; 이에 따라 -> drop.
- **Quotas, not bans.** 또한 / 더불어 / 나아가 / 한편 / 특히 / 무엇보다: max 2 each. 즉 (`i.e.` calque): max 2, or 곧 / 말하자면 / 다시 말해. Sentence-initial connectors stacked 5+ times: cut 70%.
- 이를 통해 / 이를 바탕으로 / 이와 같이 / 이러한 가운데 as paragraph glue: restructure.
- **메타 재진입**: 이는 ~ / 이 점에서 / 이 관점에서 보면, 3회 초과 시 삭제.

## AVOID: over-hedging (완곡 남발)

단언할 수 있는 곳은 단언한다. Hedge only where the uncertainty is real, then say what is uncertain.

- 추측형 종결: ~할 수 있을 것으로 보인다 / ~인 것으로 판단된다 / ~라고 여겨진다 / ~인 듯하다 -> 단언.
- 이중·삼중 완곡: ~할 가능성이 있을 수 있다 / ~로 보여질 수 있다 -> 하나만.
- 안전 균형 어휘 (합계 4회+): 양쪽 모두 / 장점도 있지만 / 신중하게 / 균형 잡힌 시각 -> 한쪽을 단언하거나 조건부로.
- 습관적 "다만" after every mildly contestable claim.

## AVOID: 명사화 과다 (~적 N, ~성/~화)

- `~적 N` 추상 체인 (전략적 함의, 기술적 토대, 구조적 변화) 3회+ -> 명사+명사 또는 동사로.
- `-성 / -적 / -화` 밀도 한 문서 12회 초과면 어근으로 해체. "근본적 관점에서 구조적 변화가 필연적이다" -> "구조가 근본부터 바뀐다".
- `~능력` 연쇄 (사고 능력, 추론 능력) 3회+ -> 동사형. 최대 2회.
- Not an absolute ban: 공식적인 답변 / 공식 답변 differ by context. Overuse is the problem, not the suffix.
- English `-tion / -ment / -ity` calques: "the implementation of the policy" -> "정책 시행".

## AVOID: 괄호 영어 병기 매번

전문용어마다 영어 병기하지 말 것. "인공지능(AI)은 거대언어모델(LLM)과 다르다." 첫 등장 1회만, 이후 한국어만. 고유명사·업계 표준 (Transformer, API, SDK)은 예외.

## AVOID: cliché lexicon

**Honest framing:** no Korean authority names these an *AI* tell. They are documented as corporate / 자기소개서 cliché. Avoid them as cliché; same advice, defensible justification.

- Hype adjectives: 혁신적인, 획기적인, 선도적인, 차별화된, 탁월한, 원활한, 강력한, 압도적, 막강한, 폭발적, 파격적, 대대적.
- Cliché openers: "급변하는 현대 사회에서...", "AI 기술은 ~에서 매우 중요한 역할을 한다".
- 열거 예고: 크게 세 가지로 나눌 수 있다 / 다음과 같은 특징을 가진다 / 다음과 같이 요약할 수 있다.
- 동의어 겹침: 중요하고 핵심적인 역할 / 새롭고 혁신적인 접근 / 지속적이고 꾸준한 노력.
- 기능+역할 합성: ~로서의 역할과 기능 / ~의 의미와 가치.
- ChatGPT tells, never write: "좋은 질문이네요!", "정말 흥미로운 관점이에요.", "~에 대해 자세히 알아보겠습니다.", "와... 너 정말, 핵심을 찔렀어."

## AVOID: rigid enumeration

첫째 / 둘째 / 셋째 is natural Korean rhetoric; a three-item list is not a defect. Dissolve only when 4+ land in one paragraph and it reads like a metronome. Same for `1) 2) 3)`.

Before:
```
첫째, 운동은 건강에 좋습니다. 둘째, 스트레스를 줄여줍니다. 셋째, 수면의 질을 높여줍니다.
```

After:
```
운동하면 일단 건강해지잖아요. 스트레스도 확 줄고, 잠도 잘 오고요.
```

## Do not touch

Leave alone when editing: proper nouns, product and model names, numbers, dates, units, quoted text, math notation, standard acronyms. Never raise formality (`-했-` -> `-하였-`). AI-ness is grammar and rhetoric, not formality.

## Before/after

Before (AI):
```markdown
## Backend.AI: 차별화 포인트

- 소프트웨어 기반 GPU 가상화를 통해 **하드웨어에 의존하지 않는** 유연한 자원 관리 실현
- **NUMA-aware** 리소스 매핑으로 최적의 성능을 제공하는 **Sokovan 스케줄러** 탑재
- NVIDIA, AMD, Intel 등 **12종 이상**의 다양한 하드웨어를 지원하는 **애그노스틱** 설계
```

Problems: "차별화 포인트" AI vocabulary, bold on every line, "유연한 자원 관리 실현" inflated, "최적의 성능을 제공" promotional, `애그노스틱` a calque.

After (human):
```markdown
## 시작부터 달랐던 Backend.AI

### fGPU (특허 기술)

- 소프트웨어 기반 GPU 가상화. 하드웨어(MIG)에 의존하지 않음
- 컨슈머 GPU(RTX 시리즈)까지 지원
- K8s가 나오기 전부터 "정수 단위 GPU" 문제를 자체적으로 풀고 있었음

### Sokovan 스케줄러

- NUMA-aware 리소스 매핑 (CPU, GPU, 메모리의 물리적 근접성)
- 자동 유휴 자원 회수 (GPU 0% 10분, 네트워크 무활동 1시간 등)

### 하드웨어 다종 지원

- NVIDIA CUDA, AMD ROCm, Intel Gaudi, Google TPU 등 <b>12종+</b>
```

Changes: plain Korean title, bold only on the key number, concrete details, no promotional adjectives, noun-final 개조식 bullets.

## Sources

Taxonomy, thresholds, and the two rejected rules from [epoko77-ai/im-not-ai](https://github.com/epoko77-ai/im-not-ai) (MIT). KatFish baselines: Park et al., ACL 2025. 번역투 pairs also from 한빛+ 「흔한 번역투 TOP 12」 and 우리말 지킴이; `~를 통해` counts from 최희경 (2016).

Caution: 국립국어원 publishes no official 번역투 list, no Korean equivalent of Wikipedia's "Signs of AI writing" exists, and most Korean pattern claims rest on typology rather than measurement. Only **[measured]** items have a human control corpus behind them.
