# c-ellipsis-h, c-ellipsis-v

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

Elision. Three columns plus a literal `…` rather than drawing all N; `⋮` for elided rows.

```xml
<text x="676" y="1814" font-size="26.67" font-weight="700" fill="#000000"
      text-anchor="middle" dominant-baseline="central">…</text>
<text x="804" y="1824" font-size="26.67" font-weight="700" fill="#000000"
      text-anchor="middle" dominant-baseline="central">⋮</text>
```

26.67 bold in `#000000`, on the row's centre line, at the same pitch the real items use. **This is the only licensed use of 26.67** and it costs you a rung of the four-size budget, so count it. `writing-shortform.md` bans `…` meaning "and so on" in a label; this is different, it is a drawn element standing in for items, not punctuation.
