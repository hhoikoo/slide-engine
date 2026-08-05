# c-cylinder

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

Datastore. Two paths: the body, which carries the fill and the outer outline, then the visible cap arc on top of it.

```xml
<path d="M424,264 a68,14 0 0 1 136,0 v32 a68,14 0 0 1 -136,0 z" fill="#ffffff"
      stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
<path d="M424,264 a68,14 0 0 0 136,0" fill="none"
      stroke="#000000" stroke-width="2" stroke-linecap="round"/>
```

Read it as: start at the left of the top ellipse, sweep 1 over the top, drop `v{body}`, sweep 1 under the bottom, close. Then repeat the first arc with sweep 0 to draw the front half of the top ellipse.

You set `rx` (half the width) and the body height. **`ry / rx = 0.21`**, from `tokens.md`. At `rx=68` that is `ry=14`. Overall height is `body + 2 x ry`.

**Keep `body` at 48 or more, and centre the label at `top_ellipse_centre + ry + body / 2`**, the vertical middle of the straight body rather than a fraction of the whole glyph. The cap arc's lowest point sits at `top_ellipse_centre + ry`, so anchoring off `ry` is what guarantees the clearance. The older `top_ellipse_centre + body x 0.7` rule ignores `ry` entirely: it holds at a tall body and puts the baseline straight through the cap arc once `body` drops toward the `ry` scale, which `check-svg.js` fails as `TEXT_ON_STROKE`. A cylinder shorter than 48 in the body cannot hold a label at all; widen it or label it outside.
