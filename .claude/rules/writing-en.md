---
paths:
  - "presentations/**/*.md"
  - "**/*.md"
---
# English Writing Rules

Rules for English slide content and documentation. Applies the same anti-AI principles as the Korean rules.

## Voice

- Direct and precise. No hedging, no filler.
- Avoid: "It's worth noting", "It's important to", "Essentially", "Basically", "In order to" (use "to").
- No meta-commentary: "The key takeaway is...", "What's important here is..." -> just state the thing.

## AI Patterns -- Banned

- **Em dash abuse**: prefer commas, parentheses, or sentence restructuring. Em dashes only for attribution and numeric ranges.
- **Triple emphasis**: "not just X, but Y, and even Z" -> state what it does directly.
- **Summary endings**: no final paragraphs that repeat earlier content. End with a new observation or implication.
- **Rigged comparisons**: no scenarios designed to make one option fail. Present facts for both sides.
- **Buzzwords**: avoid "robust", "seamless", "comprehensive", "cutting-edge", "leverage", "empower", "revolutionize", "game-changing".

## Slide-Specific

- One key message per slide.
- 3-5 bullets max. Avoid deep nesting.
- Bold key numbers: "**80%**", "**3x faster**".
- Speaker notes should use conversational tone -- these are what you say out loud.

## Quantified Overuse Words

Academic evidence from Kobak et al. (14.2M PubMed abstracts, 2010-2024). These words appear at dramatically higher rates in AI text:

| Word | Frequency Ratio |
|---|---|
| delves | 25.2x normal |
| showcasing | 9.2x |
| underscores | 9.1x |
| potential | +0.041 gap |
| crucial | +0.026 gap |

Key finding: 66% of excess words are verbs, 18% adjectives. If a paragraph clusters multiple words from this list, rewrite it.

## Extreme Overuse Words

These appear at 100x+ human frequency in GPT-4o outputs. Treat as banned:

- tapestry, amidst, camaraderie, palpable, intricate
- "In today's fast-paced world" (~107x overuse)
- "Notable works include" / "Notable figures" (>120x)

## Red Flag Word Categories

**Innovation/hype verbs:** unlock, transform, revolutionize, future-proof, supercharge, harness, leverage, optimize, streamline, unleash

**Fake-depth adjectives:** unprecedented, seamless, comprehensive, tailored, scalable, agile, dynamic, cutting-edge, best-in-class, next-generation, robust

**Motivational words:** empower, enable, elevate, foster, maximize, amplify, augment, facilitate

**Abstract location nouns (used metaphorically):** landscape, realm, space, intersection, journey

One of these in isolation may be fine. Two or more in the same paragraph is a rewrite signal.

## Structural Tells

**Contrastive reframe ("It's not X, it's Y"):**
- AI: "We're not just building a product, we're creating an experience."
- Human: "We built a product that [specific benefit]."
- Fix: state what it IS, directly.

**Rhetorical question pivot:**
- AI: "The result? More people are switching to renewable energy."
- Human: "Switching rates went up 15% last quarter."
- Fix: state the result with data.

**"Whether you're X or Y" false inclusivity:**
- AI: "Whether you're a beginner or an expert, this guide has something for you."
- Human: state who it is actually for.

**Copula avoidance:**
- AI uses "serves as", "stands as", "marks", "represents" when "is" works.
- Fix: prefer "is" and "has".

## Transition Phrases

| AI Transition | Replacement |
|---|---|
| Furthermore / Moreover | And, Plus, Also |
| It's important to note | [delete, just state the thing] |
| In light of this | Because of this |
| Without further ado | [delete] |
| At the end of the day | [delete or be specific] |
| It is worth noting that | [just note it] |
| In conclusion, it is clear that | [just state the conclusion] |
| Moving forward | Next, From here |
