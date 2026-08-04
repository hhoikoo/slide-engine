---
name: revise
description: Revision pass over a deck's slide text and speaker notes. Runs the text linter, then walks the non-mechanical checks by hand and applies edits. Usage: /revise [presentation-name] [what to change]
argument-hint: "[presentation-name] [instructions]"
---

# Revise

A separate pass beats in-flight suppression. Generation-time compliance and review-time compliance are different problems; a fresh read with a checklist catches what generation missed.

## Input

`$ARGUMENTS`:
- First token: the presentation, as an opaque ID (`p009`), a name from `presentations/index.md`, or a path to a section file. If ambiguous, list from `presentations/index.md` and ask.
- Rest: optional instructions (`shorten section 3`, `the Korean sounds robotic`). With none, do a full voice pass.

## Read first

`.claude/rules/writing-core.md`, then `writing-ko.md` or `writing-en.md` matching the deck's language, then `writing-shortform.md` if the deck has SVG figures. Do not work from memory.

## Workflow

1. Resolve the presentation. Work on `presentations/{id}/sections/*.md`, never on `slides.md` (a build artifact).
2. If the user gave instructions, do those first.
3. Run the linter and fix every hit:
   ```bash
   engine/scripts/lint-text.sh presentations/{id}
   ```
   Every provenance hit is a defect, not a style call. Fix those before anything else.
4. Walk the checks the linter cannot make, file by file:
   - **Honesty.** Any number, date, or benchmark without a source: find the source or cut the claim. Any claim stated more confidently than its source supports: lower it. Any invented specific: remove.
   - **Negative parallelism**, all four forms, including `X rather than Y`.
   - **Specificity.** Any sentence that could front a deck on any topic: rewrite with the real number or mechanism, or cut.
   - **Register.** Korean slide bullets noun-final 개조식, notes conversational, labels noun phrases. Check the table in `writing-core.md`.
   - **Rule of three.** Groupings of three that are really two or four, in bullets and in figure boxes alike.
   - **Praise-challenge-optimism** sandwich shape in any section.
   - **Ending monotony.** Read the bullets aloud. Do they sound spoken or written?
   - **Bold budget.** Max 2-3 spans per slide.
   - **Structure.** No blanket source footer, no trailing open-questions slide, no summary-recap closer, no filler divider subtitle.
   - **Figures.** Does each one show something the bullets cannot? Run `writing-shortform.md` over every `<text>` element in the deck's SVGs.
5. Apply edits directly to the section files.
6. Re-run the linter. Report the before and after counts.
7. Rebuild: `/build html`.

## Two hard gates

**Change rate.** Measure the diff against the original text.
- Over **30%** changed: stop and warn the user before continuing.
- Over **50%** changed: abort. Report what you would have done and let the user decide.

Over-editing destroys meaning faster than the tells cost credibility. This is editing, not rewriting. Keep what already sounds human.

**Removal only.** Never insert a cliché you did not find. A revision pass that adds `기록적인 성과`, `괄목할 만한`, `~로 평가된다`, `주목받았다`, `a testament to`, or `underscores the importance of` has made the text worse than it found it. The pass deletes and simplifies; it does not decorate.

Also never:
- Raise formality (`-했-` -> `-하였-`).
- Touch proper nouns, product or model names, numbers, dates, units, text inside quotation marks, math notation, or standard acronyms.
- Fabricate a fact to fill a gap the original left open. Mark it uncertain in the speaker notes instead.
- Change what a slide claims. If a claim looks wrong, flag it to the user; do not silently correct it.

## Report

Two or three sentences: linter counts before and after, what categories you fixed, anything you flagged but did not change. Never name the deck's subject matter in the report if it will land in a commit message. See CLAUDE.md, Privacy.

$ARGUMENTS
