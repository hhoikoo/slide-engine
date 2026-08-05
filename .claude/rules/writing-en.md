---
paths:
  - "presentations/**/*.md"
  - "**/*.md"
  - "docs/**/*.md"
---
# English writing rules

English long tail. Always-on rules: `writing-core.md`. Punctuation: `text-syntax.md`. Labels: `writing-shortform.md`. Nothing here repeats those.

**[measured]** marks a published frequency ratio against a human control corpus. Everything else is convention.

## Vocabulary

Single-word entries match inflected forms. Two or more in one paragraph means rewrite the paragraph.

| Do not write | Write instead |
|---|---|
| leverage, utilize, harness | use |
| streamline, optimize, supercharge | make faster, cut N steps, name the change |
| delve into | look at, read |
| showcase, highlight, underscore, emphasize | show, or name the fact |
| empower, enable, facilitate, foster, cultivate | let, name who does what |
| unlock, unleash, transform, revolutionize, future-proof | name the concrete effect |
| enhance, elevate, amplify, augment, bolster | improve by N%, or the specific verb |
| ensure, guarantee | name the mechanism that makes it hold |
| robust, resilient | name the failure it survives |
| seamless, effortless, frictionless | no extra step, no config |
| comprehensive, holistic, multifaceted, nuanced | say what is covered |
| pivotal, crucial, vital, key, essential | delete, or give the number that makes it matter |
| intricate, meticulous | detailed, or describe the detail |
| cutting-edge, state-of-the-art, next-generation, groundbreaking, innovative, unprecedented, game-changing, transformative | the version number and date |
| tailored, bespoke | configurable, per-tenant, name the axis |
| scalable, agile, dynamic, best-in-class | the number it scales to |
| landscape, realm, space, ecosystem, frontier, journey, tapestry, testament, synergy, paradigm, cornerstone | name the actual thing |
| a plethora of, a myriad of, a diverse array of | the count |
| amidst | during, in |
| boasts, features, offers | has |

**[measured]** Highest frequency ratios in Kobak et al., *Science Advances* 2025 (15.1M PubMed abstracts, 2024 vs a 2021-2022 counterfactual): **delves ~28x**, **underscores ~13.8x**, **showcasing ~10.7x**. Their measured marker set, distinct from folk blocklists: *across, additionally, comprehensive, crucial, enhancing, exhibited, insights, notably, particularly, within*.

Tell lists decay. Wikipedia tiers its vocabulary by model era and "delve" has already faded. Treat this table as dated.

## Openers, closers, connectives

| Do not write | Write instead |
|---|---|
| Furthermore, Moreover, Additionally | And, Also, or nothing |
| In light of this | Because of this |
| Moving forward | Next, From here |
| At the end of the day | delete, or be specific |
| Without further ado, Let's dive in | delete |
| It's worth noting that, It's important to note | just note it |
| In conclusion, it is clear that | state the conclusion |
| In today's fast-paced world, In the ever-evolving landscape of | delete |
| Essentially, Basically | delete |
| In order to | to |
| The reason is because | because |
| Great question, Of course, Certainly, You're absolutely right | delete |
| I hope this helps, Let me know if you have questions | delete |
| As of my last update, I may not have the latest | delete, or check and state the date |

## Structural tells

| Do not write | Write instead |
|---|---|
| We're not just building a product, we're creating an experience | We built a product that cuts setup from 40 min to 3 |
| Not just X, but also Y | Y does Z |
| **X rather than Y** ("prioritizing consolidation rather than purity") | name what X does |
| The result? More people switched | Switching rose 15% last quarter |
| Whether you're a beginner or an expert, this guide has something for you | name who it is for |
| It serves as / stands as / represents / marks / functions as | is |
| Industry reports suggest, Observers have cited, Experts argue, studies show | the paper, company, or person, or your own assertion |
| ...highlighting its importance, ...ensuring scalability, ...reflecting broader trends, ...contributing to growth, ...fostering collaboration | delete the participial tail. If it could end any sentence, it is filler |
| marks a pivotal moment in adoption | adoption hit 40% in Q3 |
| is a testament to, serves as a reminder, setting the stage for, shaping the future of | the event and its number |
| Despite these challenges, the future remains bright | state the limitation and stop |
| Nestled in the heart of, boasts a vibrant, renowned for its rich | delete the whole clause |

**"X rather than Y" is the negative-parallelism form most guides miss.** Reversed-order variant, does not look like the meme version. `writing-core.md` rule 2 covers all four.

**[measured]** Copula avoidance: over a **10% drop in "is"/"are"** in academic writing in 2023, post-ChatGPT. Prefer `is` and `has`.

## Permissions

Explicitly allowed. Over-editing strips these out; Wikipedia lists them as signs of *human* writing.

- Plain constructions: "there is a", "it has a".
- Plain verbs: wrote, moved, used, ran. Not "authored", "leveraged".
- Superlatives when true: "one of the best", "was the first".
- Real hedges on a real uncertainty: "perhaps", "tends to", "we did not test this".
- Slightly wordy connectives in speech: "as a result of", "in order to".
- A long sentence. See `writing-core.md` rule 13.

## Slide specifics

- One key message per slide. 3-5 bullets, minimal nesting.
- Bold key numbers only: `**80%**`, `**3x faster**`.
- Speaker notes are rare and fragmentary. One exists only for something that cannot be slide content or a figure and still has to be said aloud, and it is bullet fragments, never connected prose. An honest open question is a licensed reason to write one.
- Connected English prose lives in `synopsis.md`, `draft/outline.md`, `research/` and repo docs. Rule 13's long sentence is anchored there.

## Sources

Taxonomy adapted from [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), an actively edited essay that frames every item as probabilistic, not proof.

Measured figures: Kobak et al., *Science Advances* 2025 ([arXiv:2406.07016](https://arxiv.org/abs/2406.07016)). Em-dash prevalence in 69,632 medRxiv preprints, **4.23% pre-ChatGPT, 8.03% in 2024, 20.30% in 2025** ([arXiv:2606.29540](https://arxiv.org/pdf/2606.29540)), backs the dash ban in `text-syntax.md`.

Two cautions. The Nigerian-annotator origin story for "delve" was tested by Juzek & Ward ([arXiv:2412.11385](https://arxiv.org/abs/2412.11385)) and **not confirmed**; folk etymology. And OpenAI shipped em-dash suppression in November 2025, so that tell now detects untuned output, not AI in general.
