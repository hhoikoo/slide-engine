# c-iso-grid

One part of the diagram component library. Shared rules, registers and the copy-do-not-reference constraint are in `../components.md`.

Units of capacity, tiled across a plane. Square ground cells, so `w = d`.

```xml
<path d="M704,1620 l-16,16 h16 l16,-16 z" fill="#fff3d9"
      stroke="#e8822a" stroke-width="1" stroke-linejoin="round"/>
<path d="M720,1620 l-16,16 h16 l16,-16 z" fill="#fff3d9"
      stroke="#e8822a" stroke-width="1" stroke-linejoin="round"/>
<path d="M688,1636 l-16,16 h16 l16,-16 z" fill="#ffffff"
      stroke="#b4bdc8" stroke-width="1" stroke-linejoin="round"/>
```

The back-left corner of cell `(i,j)` is at **`(X + w x i - w x j, Y + w x j)`**, where `i` runs along the width axis and `j` along the depth axis. Cells tile exactly: the right edge of `(i,j)` is the left edge of `(i+1,j)`, and the front edge of `(i,j)` is the back edge of `(i,j+1)`.

Cell side 16 for a grid that reads at slide size; an `n x n` grid then occupies `2n x 16` wide by `(n+1) x 16` tall. Stroke at 1, not 2: the cells are small and 2 turns the grid into a solid mesh. Free cells white with a `#b4bdc8` outline, used cells in the accent pale with the accent mid outline. The 4:1 slab ratio does not apply here, because a cell is a tile and not a surface.

Count in the label, below the front edge, not by making the reader count cells.
