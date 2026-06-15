---
paths:
  - "presentations/**/*.md"
  - "**/*.md"
---
# Korean Writing Rules

Rules for Korean slide content.

## Sentence Flow

- Connect clauses naturally within a single sentence using connective endings (~이고, ~인데, ~하는데).
- Allow parenthetical insertions for context.
- Avoid short, disconnected sentences (AI signature pattern).

## Paragraph Structure

- Minimum 3-4 sentences per paragraph. One-sentence paragraphs only for intentional emphasis.
- Do not fragment paragraphs excessively.

## AVOID: Over-Translation of Technical Terms

In technical presentations, keep English technical terms in English. Do not transliterate into Korean unless the Korean term is genuinely more natural in context (e.g., "배포" for deployment when not referring to K8s Deployments).

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

Exception: words that have become standard Korean IT vocabulary (e.g., 서버, 클러스터, 컨테이너) are fine.

## AVOID: 번역투 (Translation-ese)

영어 구문을 한국어로 1대1 옮긴 흔적. AI 한글의 가장 결정적 시그니처. 슬라이드 본문과 speaker notes 모두에 적용.

| Do not write | Write instead |
|---|---|
| "X에 대해(서) 논의한다" | "X를 논의한다" (목적격 직결) |
| "분석을 통해 인사이트를 얻는다" | "분석해서 인사이트를 얻는다" (~로/~해서로 분산) |
| "~에 있어(서)" | "~에서", "~할 때" |
| "~를 기반으로 한", "~에 기반하여" | "~로 만든", "~위에 세운", "~로" |
| "~함으로써" | "~하면", "~해서" |
| "경쟁력을 가지고 있다" (have + N 직역) | "경쟁력이 강하다" (형용사로 환원) |
| "판단되어진다" (이중 피동) | "판단된다" / "판단한다" |
| "AI에 의해 생성된 이미지" (by-passive) | "AI가 만든 이미지" (행위자를 주어로) |
| "AI 기술 발전 속도 가속화" (명사 나열) | "AI 기술의 발전 속도가 빨라진다" (조사 복원) |

**영어 대명사 직역 (그/그녀/그것/그들):** 영어 he/she/it/they를 1대1로 옮기지 말 것. 한국어는 생략하거나 호칭으로 응결한다. "존은 피곤했다. 그는 앉았다. 그는 시계를 보았다" -> "존은 피곤했다. 자리에 앉아 시계를 보았다." "그의 손" -> "손". 한 문단에 인칭 대명사 3회 이상이면 다시 쓴다.

## AVOID: Korean Slop Words

- Adjectives/adverbs: 혁신적인, 획기적인, 선도적인, 차별화된, 탁월한, 원활한, 강력한
- Connectors: 이를 통해, 이를 바탕으로, 이와 같이, 이러한 가운데
- Transition words: limit "또한", "더불어", "나아가", "한편", "특히", "무엇보다" to max 2 per document

## BANNED: AI Patterns

- **Meta-framing**: "오해를 풀겠습니다", "흔한 오해 하나를 풀고 시작하겠습니다", "이건 오해. X 때문" -> just present the facts and let the audience draw the conclusion. Do not announce that you are correcting a misconception.
- **Meta-commentary**: "핵심은 ~이다", "중요한 것은" -> state the content directly
- **Negative contrast**: "A가 아니라 B" -> describe B directly
- **Rigged comparisons**: no setting up scenarios where one side fails and the other succeeds. Present both sides' facts side by side.
- **Summary endings**: no paragraphs that repeat what was already said. End with new insight.
- **Equal distribution**: vary depth by importance. Don't give every point the same length.

## AVOID: Punctuation Mistakes

- **연결어미 뒤 쉼표**: strongest single AI tell in Korean (KatFish: human 4.10% vs AI 19.83%, 4.84x). Do not put a comma right after a connective ending (-고 / -며 / -지만 / -면서 / -아서·어서 / -는데). "발전하지만, 대응은 더디다" -> "발전하지만 대응은 더디다". The ending already carries the breath; drop the comma or split into a new sentence.
- **Dashes**: do not use em dashes or double hyphens in Korean. Use commas, parentheses, colons, or just write a normal sentence.
- **Bold markers**: `**text**` followed by Korean particles needs a space (`**text** 로`). Colons go inside bold (`**text:**`).
- **Quotes**: single quotes for emphasis/concepts, double quotes only for direct quotes from real people.

## AVOID: Formal Ending Monotony

AI defaults to ~합니다/~입니다 for every sentence. Mix registers: ~해요, ~거든요, ~인데, sentence fragments.

| AI-like (경직된 문체) | Human-like (자연스러운 문체) |
|---|---|
| ~할 수 있습니다 (repeated) | ~돼요 / ~됩니다 / ~가능 |
| ~것입니다 | ~거예요 / ~인 셈 |
| ~하고 있습니다 | ~하는 중 / ~하고 있어요 |

Ban the ~할 수 있습니다 hammer. If more than two sentences in a section end this way, rewrite.

## AVOID: Intensifier/Connector Overuse

**Intensifiers to avoid (with human alternatives):**
- 매우 -> 정말, 진짜, 엄청
- 굉장히 -> sounds like a news anchor, drop or replace with 진짜
- 정말로 -> the -로 suffix makes it overly emphatic, use 정말 or 진짜
- 실제로 -> translationese from "actually", drop or use 사실

**Connectors to avoid (with human alternatives):**
- 따라서 -> 그래서
- 그러므로 -> rarely used in casual Korean, use 그래서
- 또한 -> ~도, 그리고
- 게다가 -> 거기다, 그것도
- 이에 따라 -> bureaucratic register, drop or restructure
- 즉 (영어 i.e. 직역) -> 곧, 말하자면, 다시 말해, or drop and join with a comma. Max 1 per document.

**문두 접속사 남발:** "또한 / 따라서 / 즉 / 나아가 / 아울러" stacked at sentence and paragraph starts. Cut 70%+. Logic should show through the content, not the connector.

## AVOID: AI Signature Endings

LLM이 결산·종결 문장을 거의 자동으로 이렇게 닫는다. 발견 즉시 평서형으로.

- 결산 피벗: "결론적으로 / 요약하면 / 종합하면 / 정리하자면" -> drop, just state the conclusion. (한 문서 3회 초과 시 강한 신호)
- 형식명사 종결: "~인 것이다 / ~할 것이다" -> "~다" 직결 ("변화가 큰 것이다" -> "변화가 크다")
- 의미 부연 종결: "~다는 뜻이다 / ~다는 의미다 / ~라는 점에 있다" -> 본문에 풀어 단언 ("핵심은 ~라는 점에 있다" -> "핵심은 ~다")
- 권고형 결말: "~해야 한다 / ~해야 합니다"가 매 결말마다 -> 구체 동사 단언 또는 주체 명시 ("정부는 ~를 도입한다"). 한 문서 5회 초과 회피.
- 완결 공식: "~할 때입니다 / ~로 나아갈 시점입니다" -> 구체 동사로. 한 문서 1회만.

## AVOID: Over-hedging (완곡 남발)

단언할 수 있는 곳은 단언한다. hedging은 정말 불확실한 지점에만.

- 추측형 종결이 모든 문장 끝에: "~할 수 있을 것으로 보인다 / ~인 것으로 판단된다 / ~인 듯하다" -> 단언
- 이중·삼중 완곡: "~할 가능성이 있을 수 있다 / ~로 보여질 수 있다" -> 하나만
- 안전 균형 어휘: "양쪽 모두 / 장점도 있지만 / 신중하게 / 균형 잡힌 시각" -> 한쪽을 단언하거나 조건부("X일 때는 A, Y일 때는 B")로

## AVOID: 명사화 과다 (~적 N, ~성/~화)

- "~적 N" 추상 체인: "전략적 함의", "기술적 토대", "구조적 변화"가 한 문서 3회+ -> 명사+명사("전략 함의") 또는 동사로 풀기("기술이 얼마나 안정적인가")
- 한자어 명사화 "-성 / -적 / -화" 밀도가 높으면 동사·형용사 어근으로 해체. "근본적 관점에서 구조적 변화가 필연적이다" -> "구조가 근본부터 바뀐다"
- "~능력" 추상명사 연쇄("사고 능력", "추론 능력")가 3회+ -> 동사형("잘 사고한다"). 한 문서 2회 이하.

## AVOID: 괄호 영어 병기 매번

전문용어마다 영어 병기하지 말 것. "인공지능(AI)은 거대언어모델(LLM)과 다르다." 전문 독자 대상이면 첫 등장 1회만 병기, 이후 한국어만. 고유명사·업계 표준(Transformer, API, SDK)은 예외로 유지.

## Human Markers to Include

Real Korean uses markers that AI consistently omits. Include these where tone allows:

- **Personal experience:** 제가 써보니까, 해보면, 저는 매일 쓰는 방법이에요
- **Conversational rhythm:** 그래서요. / 이게 왜 중요하냐면요. / 근데 말이죠.
- **Casual emphasis:** 진짜, 확, 완전, 대박
- **Sentence fragments:** 당연하죠. / 맞아요 이거. / 이게 핵심.
- **Sound-symbolic words (의태어):** 뚝딱, 술술, 쭉쭉

## BANNED: ChatGPT Korean Tells

These phrases are dead giveaways of AI-generated Korean. Never use them:

- 와... 너 정말, 핵심을 찔렀어.
- 좋은 질문이네요!
- 정말 흥미로운 관점이에요.
- ~에 대해 자세히 알아보겠습니다.

## AVOID: Rigid Enumeration

Avoid rigid 첫째, 둘째, 셋째 structure. Human Korean uses varied transitions or no explicit numbering.

Before (AI):
```
첫째, 운동은 건강에 좋습니다. 둘째, 스트레스를 줄여줍니다.
셋째, 수면의 질을 높여줍니다.
```

After (human):
```
운동하면 일단 건강해지잖아요. 스트레스도 확 줄고, 잠도 잘 오고요.
```

## Before/After Example

Before (AI):
```
## Backend.AI: 차별화 포인트

- 소프트웨어 기반 GPU 가상화를 통해 **하드웨어에 의존하지 않는** 유연한 자원 관리 실현
- **NUMA-aware** 리소스 매핑으로 최적의 성능을 제공하는 **Sokovan 스케줄러** 탑재
- NVIDIA, AMD, Intel 등 **12종 이상**의 다양한 하드웨어를 지원하는 **애그노스틱** 설계
```

Problems: "차별화 포인트" is AI vocabulary, excessive bold on every line, "유연한 자원 관리 실현" is inflated, "최적의 성능을 제공" is promotional.

After (human):
```
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

Changes: title is plain Korean not AI vocabulary, bold only on the one key number, specific details instead of vague claims, no promotional adjectives, no dashes as separators.

## Sources

Translation-ese, signature-ending, hedging, and 연결어미-쉼표 patterns adapted from the Korean AI-tell taxonomy in [epoko77-ai/im-not-ai](https://github.com/epoko77-ai/im-not-ai) (MIT). KatFish figures: Park et al.
