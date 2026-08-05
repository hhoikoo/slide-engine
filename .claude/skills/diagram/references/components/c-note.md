# c-note

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

A request, a document, a message. Rounded top, wavy bottom.

```xml
<path d="M822,252 H970 Q976,252 976,258 V300 c-20,10 -60,-10 -80,0 c-20,10 -60,-10 -80,0 V258 Q816,252 822,252 Z"
      fill="#ffffff" stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
```

Parameterised on `(x,y,w,h)` with the flat bottom at `yb = y + h - 8`:

```
M{x+6},{y} H{x+w-6} Q{x+w},{y} {x+w},{y+6} V{yb}
c-{w/8},10 -{3w/8},-10 -{w/2},0
c-{w/8},10 -{3w/8},-10 -{w/2},0
V{y+6} Q{x},{y} {x+6},{y} Z
```

Two symmetric cubics make two humps. The wave carries about 7 either side of `yb`, so budget `h` as the distance to the flat part, not to the lowest ink. Keep the label above `yb`.
