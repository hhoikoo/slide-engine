# c-leader

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

The house's answer to a legend: label the element in place, on a hairline curved leader. Béziers are for leaders and nothing else.

```xml
<path d="M96,740 Q96,700 138,694" fill="none"
      stroke="#979ea8" stroke-width="1"
      marker-end="url(#ah-hair)"/>
<text x="96" y="756" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="middle">one per zone</text>
```

**No `stroke-linecap="round"` here either.** A leader carries a marker, so the same rule as `c-elbow` applies: the round cap is centred on the endpoint that `refX="10"` already puts the arrowhead tip on, and it protrudes past the tip. `lint-svg.py` fails it as `ARROW_CAP`. Round caps belong on the open-ended parts only: bus bars, brackets, threshold rules, a cylinder's cap arc.

**The control-point rule.** One quadratic, always. If the leader leaves the label vertically, the control point is `(start.x, end.y)`. If it leaves horizontally, it is `(end.x, start.y)`. Either way the curve is a quarter turn: it leaves the label along one axis and arrives at the target along the other.

The label is italic 15.56 or 13.33 in `#6f7681`, set on white, 12 to 16 clear of the curve's start. Italic marks it as text about the picture rather than the name of a thing. **Korean leaders are set upright in the same grey**, because Pretendard ships no italic and Hangul in Inter Italic looks wrong.
