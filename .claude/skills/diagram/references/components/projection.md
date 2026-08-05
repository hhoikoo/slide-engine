# The projection

Shared geometry for the isometric group, not a part on its own. The parts are listed in `../components.md`.

**45 degree cavalier oblique, not a true isometric.** Horizontal stays horizontal, vertical stays vertical, and the depth axis recedes **up and to the right at exactly 45 degrees with no foreshortening**. The horizontal-to-vertical ratio on the depth axis is therefore **1:1**: one unit back is one unit right and one unit up. Equivalent to `matrix(1,0,-1,1,tx,ty)` on an axis-aligned rect.

**Never emit a `transform`.** Compute the coordinates and write the path. The house style has no transforms anywhere, and a transformed subtree breaks the linter's geometry checks and the paint-order reasoning.

The whole projection reduces to one substitution. A ground rect of width `W` and depth `D`, with its back-left corner at `(X,Y)`, becomes:

```
M{X},{Y} l{-D},{D} h{W} l{D},{-D} z

  back-left    (X, Y)          back-right   (X+W, Y)
  front-left   (X-D, Y+D)      front-right  (X+W-D, Y+D)
  bbox         (W+D) x D, x from X-D to X+W
```

Build any new object from that. A vertical extrusion of height `H` from an edge is `v{H}`; a depth edge is always `l{-D},{D}` going front, `l{D},{-D}` going back. There is nothing else to know.

**Labels are never skewed.** All 132 label runs in the source figure carry an identity transform. Plane names go horizontal to the left of the stack. Object names go horizontal above the object. Plane-content names go horizontal below the front edge. Nothing follows the 45 degree axis, ever.
