# c-iso-cube

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A container, pod or session inside an isometric scene. This is the `isometric cube` of the shape vocabulary; there is no separate flat version. Symbol, `W=88`, `d=36`, `H=84`.

```xml
<use href="#c-iso-cube" x="650" y="1382" width="128" height="124"/>
```

Front-face top-left lands at `(x+2, y+38)`. The base line, the one that seats on a plane, lands at `y+122`.

To build one at another size, from front-face top-left `(x,yt)`, width `W`, height `H`, depth `d`:

```
top    M{x+d},{yt-d} l{-d},{d} h{W} l{d},{-d} z      fill #ffffff
side   M{x+W+d},{yt-d} l{-d},{d} v{H} l{d},{-d} z    fill #ced4db
front  M{x},{yt} h{W} v{H} h{-W} z                   fill #f2f3f5
```

All three stroked `#000000` at 2. **`d` is 0.38 to 0.43 of `W`, never 1.0**: the depth is shortened even though the 45 degree angle is not. `H` is 0.89 to 1.00 of `W`. Face lightness runs top, then front, then side, across 16 points of the neutral ramp. **No hue on a cube, ever.**
