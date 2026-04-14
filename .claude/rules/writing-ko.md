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

## AVOID: Translation-style Expressions

- "~하는 것이 중요하다" -> explain why directly
- "~에 있어" overuse -> "~에서", "~할 때"
- "~를 기반으로 한" -> "~로 만든", "~위에 세운"
- "~함으로써" -> "~하면", "~해서"

## AVOID: Korean Slop Words

- Adjectives/adverbs: 혁신적인, 획기적인, 선도적인, 차별화된, 탁월한, 원활한, 강력한
- Connectors: 이를 통해, 이를 바탕으로, 이와 같이, 이러한 가운데
- Transition words: limit "또한", "더불어", "나아가", "한편", "특히", "무엇보다" to max 2 per document

## BANNED: AI Patterns

- **Meta-commentary**: "핵심은 ~이다", "중요한 것은" -> state the content directly
- **Negative contrast**: "A가 아니라 B" -> describe B directly
- **Rigged comparisons**: no setting up scenarios where one side fails and the other succeeds. Present both sides' facts side by side.
- **Summary endings**: no paragraphs that repeat what was already said. End with new insight.
- **Equal distribution**: vary depth by importance. Don't give every point the same length.

## AVOID: Punctuation Mistakes

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
