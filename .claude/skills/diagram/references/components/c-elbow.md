# c-elbow

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

The orthogonal connector. 77% of corpus routing is orthogonal and 1091 of 1129 elbows are r=6, so this is the most consistent detail in the whole style.

```xml
<path d="M440,536 H474 Q480,536 480,542 V600 Q480,606 486,606 H514" fill="none"
      stroke="#3a414a" stroke-width="2" stroke-linejoin="round"
      marker-end="url(#ah-ink)"/>
```

**The control-point rule, which is the whole part.** At each corner, name the un-rounded vertex `V`. Then: stop 6 units short of `V` on the axis you arrived along, emit `Q{Vx},{Vy}` with the control point exactly on `V`, and land 6 units past `V` on the axis you leave along. So a corner at `(480,536)` turning from rightwards to downwards is `H474 Q480,536 480,542`. The control point is always the vertex itself, never an offset from it, and the two 6s are always the same 6 as the box `rx`.

**No `stroke-linecap="round"` on a path that carries a marker.** A round cap is centred on the path's endpoint and `refX="10"` puts the arrowhead's tip on that same point, so the cap protrudes past the tip as a visible nub. Keep `stroke-linejoin="round"` for the elbows; drop the linecap. Round caps are for open-ended lines only: leaders, bus bars, span rules. `lint-svg.py` fails this as `ARROW_CAP`.

Always `fill="none"`. **Inset the endpoint by `4 + stroke-width` from the target border**, so 6 at stroke-width 2; the arrowhead then lands on the border instead of over it. Dash the whole path `6 4` to mean logical rather than physical.
