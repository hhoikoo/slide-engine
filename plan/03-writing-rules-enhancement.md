# Anti-AI Writing Rules Enhancement

> Status: Ready to implement
> Priority: High (implement alongside MVP)
> Depends on: Nothing (can be done independently)

## Context

The existing `.claude/rules/writing-ko.md` and `writing-en.md` are a good foundation but thin compared to the research in `samples/marp-template/demo/research/`. The demo folder contains:

- `agent-briefing.md` -- practical playbook with before/after examples
- `ai-writing-signs.md` -- English checklist (Wikipedia-based, 12 categories)
- `ai-writing-signs-extended.md` -- Extended research (Korean + English + cross-language, 380 lines, 15+ sources)

These need to be absorbed into the rules files.

## What to Add to writing-ko.md

### Formal ending monotony
- AI defaults to ~합니다/~입니다 for every sentence
- Add table of AI-like vs human-like endings:
  - ~할 수 있습니다 (repeated) -> ~돼요 / ~됩니다 / ~가능
  - ~것입니다 -> ~거예요 / ~인 셈
  - ~하고 있습니다 -> ~하는 중 / ~하고 있어요
- Ban ~할 수 있습니다 hammer

### Intensifier/connector overuse
- Intensifiers to avoid: 매우, 굉장히, 정말로, 실제로
- Human alternatives: 정말, 진짜, 엄청
- Connectors to avoid: 따라서, 그러므로, 게다가, 이에 따라
- Human alternatives: 그래서, 그리고, ~도, 근데

### Missing human markers
- Personal experience: 제가 써보니까, 해보면
- Conversational rhythm: 그래서요. / 이게 왜 중요하냐면요.
- Casual emphasis: 진짜, 확, 완전, 대박
- Sentence fragments: 당연하죠. / 맞아요 이거. / 이게 핵심.
- Sound-symbolic words (의태어): 뚝딱, 술술, 쭉쭉

### ChatGPT Korean tells
- 와... 너 정말, 핵심을 찔렀어.
- 좋은 질문이네요!
- 정말 흥미로운 관점이에요.

### Enumeration pattern
- Avoid rigid 첫째, 둘째, 셋째
- Human Korean uses varied transitions or no numbering

### Before/after example (include directly in rules)
```
Before (AI):
  ## Backend.AI -- 차별화 포인트
  - 소프트웨어 기반 GPU 가상화를 통해 **하드웨어에 의존하지 않는** 유연한 자원 관리 실현

After (human):
  ## Backend.AI -- 시작점이 달랐다
  ### fGPU (특허 기술)
  - 소프트웨어 기반 GPU 가상화 -- 하드웨어(MIG) 비의존
  - K8s가 나오기 전부터 "정수 단위 GPU" 문제를 자체적으로 풀고 있었음
```

## What to Add to writing-en.md

### Quantified overuse words (from Kobak et al.)
- delves: 25.2x normal frequency
- showcasing: 9.2x
- underscores: 9.1x
- 66% of excess words are verbs, 18% adjectives

### Extreme overuse words (100x+ human rate)
- tapestry, amidst, camaraderie, palpable, intricate

### Red flag word categories
- Innovation/hype verbs: unlock, transform, revolutionize, future-proof, supercharge, harness, leverage, optimize, streamline, unleash
- Fake-depth adjectives: unprecedented, seamless, comprehensive, tailored, scalable, agile, dynamic, cutting-edge, best-in-class, next-generation, robust
- Motivational: empower, enable, elevate, foster, maximize, amplify, augment, facilitate
- Abstract location nouns: landscape, realm, space, intersection, journey

### Structural tells
- Contrastive reframe: "It's not X, it's Y" -> state what it IS
- Rhetorical question pivot: "The result?" -> state the result
- "Whether you're X or Y" false inclusivity -> state who it's for
- Copula avoidance: "serves as" when "is" works

### Transition phrases (with replacements)
- Furthermore/Moreover -> And, Plus, Also
- It's important to note -> [delete]
- In light of this -> Because of this
- At the end of the day -> [delete or be specific]

## Cross-language additions (both files)

- **Uniformity of length**: vary sentence length deliberately (AI writes medium-medium-medium)
- **Positivity bias**: allow honest negative assessments
- **Synonym cycling**: pick one term, reuse it; consistency beats variety
- **Rule of three**: use actual number needed, not always three
- **Praise-challenge-optimism sandwich**: ban the formula
- **Excessive bold**: bold ONLY for key numbers, product names, 1-2 critical terms per slide
- **Vague attributions**: name specific source or drop the attribution
- **Missing specificity**: cite concrete data, not "many experts"

## Self-check checklist (add to both files)

1. Grep for repeated sentence endings
2. Count bold tags per slide (>2-3 is suspicious)
3. Look for negative parallelism
4. Check for praise-challenge-optimism sandwich
5. Check for rule-of-three groupings
6. Read bullets aloud -- do they sound spoken or written?
7. Could this sentence apply to any topic? Too generic if yes
8. Check for formal connector clustering

## Additional enforcement ideas

### Hook-based validation
A Claude Code hook that runs after `/generate-slides` to scan for known AI vocabulary clusters and flag them automatically.

### Marp CJK bold fix
Install `markdown-it-cjk-friendly` plugin in `marp.config.js` to fix `**한국어**` rendering. This is a proper fix rather than the `<b>` tag workaround. The plugin is actively maintained and already adopted by VitePress.

```javascript
// In marp.config.js engine config:
engine: ({ marp }) => {
  const cjkFriendly = require('markdown-it-cjk-friendly')
  marp.use(cjkFriendly)
  return marp
}
```

Then standard `**bold**` works for CJK text and the `<b>` tag workaround is no longer needed.
