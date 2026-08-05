# c-bracket

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

Marks a span across a row: "these three are one shard", "this range is the budget".

```xml
<path d="M360,700 V706 H656 V700" fill="none"
      stroke="#3a414a" stroke-width="1" stroke-linejoin="round"/>
<text x="508" y="726" font-size="15.56" font-style="italic" fill="#6f7681"
      text-anchor="middle">one shard</text>
```

Depth is 6, weight is 1, and it sits 12 below the row it brackets. The label is centred under it, italic grey, 20 below the bracket line. Flip the two `V` runs upward to bracket from above.
