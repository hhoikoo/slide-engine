# c-arrowhead

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

One triangle everywhere. Defined as markers, not symbols, and copied into your `<defs>`.

```xml
<marker id="ah-ink" viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#3a414a"/>
</marker>
<marker id="ah-ink-thick" viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth="3" markerHeight="3" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#3a414a"/>
</marker>
<marker id="ah-hair" viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#979ea8"/>
</marker>
```

**Sizing.** `markerUnits` defaults to `strokeWidth` and must stay there. The rendered head length is therefore `markerWidth x stroke-width`. Hold that product at **12 for the full head** and at **7 for the half head** on 1px annotation leaders and dotted lines. So `markerWidth=6` at stroke-width 2, `markerWidth=3` at stroke-width 4, `markerWidth=7` at stroke-width 1. Set `markerHeight` to the same number. Do not switch to `userSpaceOnUse`: at stroke-width 8 the line swallows the head.

**One marker per colour.** `context-stroke` works in Chrome but Safari has not shipped it, and deployed HTML is Safari-exposed. `components.svg` carries `ah-ink`, `ah-ink-thick`, `ah-hair`, `ah-blue`, `ah-amber` and `ah-ghost`; copy the ones you use and delete the rest.
