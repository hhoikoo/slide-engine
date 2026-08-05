# c-card-stack

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

"N of these", where the N things are identical and their sameness is the point. Three cards is always the right number.

```xml
<rect x="64" y="528" width="160" height="56" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<rect x="52" y="520" width="160" height="56" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<rect x="40" y="512" width="160" height="56" rx="6" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<text x="120" y="540" ...>worker</text>
```

**Connect on the left or the top edge only.** The offset puts the back cards down and to the right of the front card, so a connector arriving at the front card's right or bottom edge lands on top of them and reads as pointing at the wrong card. If the flow reaches this element from the right, either re-plan the layout so it arrives from the left, or drop the stack and use a plain `c-box` with an italic count label beside it.

**Emit back to front.** The back card is written first and the front card last, so the front one overpaints. Offset is `(+12, +8)` per card. `tokens.md` records the corpus measurement as `(+15, +8)`; the exemplars round it to `(+12, +8)` to stay on the multiple-of-4 grid, and that is what this part uses. Only the front card is labelled. Connectors attach to the front card.
