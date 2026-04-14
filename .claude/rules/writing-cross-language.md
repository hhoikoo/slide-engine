---
paths:
  - "presentations/**/*.md"
  - "**/*.md"
---
# Cross-Language Writing Rules

Patterns that appear in both Korean and English AI output. Apply these regardless of language.

## Uniformity of Length

AI text clusters around average length (medium-medium-medium). Human writing mixes short punchy lines with longer ones. Vary sentence and paragraph length deliberately.

- Korean: 한 줄짜리 문장. 그 다음에 길게 설명하는 단락이 올 수도 있고.
- English: "This matters." followed by a longer explanation, then back to short.

## Positivity Bias

AI avoids negativity. Allow honest negative assessments.

- Korean AI: 이 방법은 매우 효과적이며 다양한 장점이 있습니다.
- Korean human: 솔직히 단점도 있어요. 근데 장점이 더 크긴 해요.
- English AI: "This approach offers numerous benefits and opportunities."
- English human: "The setup is annoying, but it pays off."

## Synonym Cycling

AI avoids repeating the same word by cycling through synonyms ("the project", then "the initiative", then "the endeavor"). Pick one term and reuse it. Consistency beats variety.

## Rule of Three

AI defaults to grouping items in threes. Use the actual number needed. Two is fine. Four is fine. Don't pad or trim to hit three.

## Praise-Challenge-Optimism Sandwich

AI structures sections as: [good things] -> "but there are challenges" -> [optimistic future]. Ban this formula. Present limitations honestly without the framing trick.

## Excessive Bold

Bold ONLY for:
- Key numbers: **82%**, **3x faster**
- Product/project names on first mention
- 1-2 critical terms per slide, not every bullet

More than 2-3 bold spans per slide is suspicious. If every bullet has bold text, strip most of it.

## Vague Attributions

- AI: "Many experts recommend..." / "많은 전문가들이..."
- Human: name a specific source or drop the attribution entirely.

Never invent anonymous authorities. If you can't cite it, don't attribute it.

## Missing Specificity

- AI: "significant improvements" / "다양한 분야에 적용"
- Human: cite concrete data, name the fields, give the percentage.

If a sentence could apply to any topic, it is too generic. Make it specific to the actual subject.

## Self-Check Checklist

Run this after writing or reviewing slides:

1. Grep for repeated sentence endings (Korean: ~합니다 clustering, English: repetitive structure)
2. Count bold tags per slide (more than 2-3 is suspicious)
3. Look for negative parallelism ("not X, but Y" / "X가 아니라 Y")
4. Check for praise-challenge-optimism sandwich structure
5. Check for rule-of-three groupings that could be two or four
6. Read bullets aloud: do they sound spoken or written?
7. Could this sentence apply to any topic? Too generic if yes
8. Check for formal connector clustering (Furthermore/Moreover/Additionally or 따라서/또한/게다가)
