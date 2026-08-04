# Diagram design tokens

The fixed vocabulary. Every value here is measured from a corpus of 53 professionally-authored diagrams, cross-checked by four independent forensic passes. Do not invent values. Do not interpolate between them.

Where a number has a range, the range is real variance in the source corpus, not permission to pick freely.

## Canvas

```
viewBox="0 0 1000 H"      H <= 560
```

Width is always **1000**. Height flexes to the content, capped at 560.

This is not arbitrary. Measured against the real build pipeline: the engine inlines each SVG into the slide DOM and stamps an inline `max-width:100%`, which overrides the theme's `section svg { max-width:70% }`. At `1000 x H, H <= 560` the render is exactly 1:1: **1 SVG user unit = 1 CSS px**. So `font-size="17.78"` is 17.78px on screen. Above H=560 the whole figure scales down (H=700 -> 0.815) and the type scale stops being true.

In a `side-by-side` layout the same figure renders at **0.566**. Author a simpler figure for that slot, or budget type at `13 / 0.566 ~= 23`.

Emit a full-bleed white background rect as the first element. There is no dark mode in this deck (`prefers-color-scheme` appears zero times in the theme); diagrams only need to work on white.

Height guidance: 300-400 for an inline figure, 440-560 for a full-slide figure. Crop tight. The corpus median bbox coverage is 0.978. Leave ~8px of margin and no more.

## Type

```
font-family="'Inter Display', Pretendard, sans-serif"
```

Use the theme stack verbatim. `Inter Display`, `Pretendard` and `D2Coding` are bundled in `themes/bai-flat/fonts/` and declared as `@font-face` in the theme, so they resolve identically on every machine regardless of what is installed. `Apple SD Gothic Neo`, Helvetica, Arial and `system-ui` are system faces that happen to be present on the current build machine.

**Verified ABSENT: `Noto Sans KR`, `Symbols Nerd Font`.** Do not name them. Pretendard covers Latin *and* Hangul in one superfamily, which is why the corpus sets mixed `DRF 및 Fairness 적용` runs in a single font at a single size with no fallback list.

Monospace: use `D2Coding, monospace`. D2Coding is bundled, so it no longer falls back to whatever the machine happens to resolve, which was the direct cause of the worst text-overflow defect in the corpus. Older figures authored against the Menlo fallback budget are now *narrower* than their boxes rather than wider, so they are safe but loose; re-measure only if a box looks visibly empty.

### Size ladder

| px | pt | role |
|-------|----|------|
| 13.33 | 12 | parentheticals, unit suffixes |
| 15.56 | 14 | small annotation |
| **17.78** | 16 | **default**: body, sub-components, arrow labels, italic zone labels |
| 20.00 | 18 | subordinate component name |
| 22.22 | 20 | first-class component name |
| 26.67 | 24 | reserved. See the note below before using it |

**Three distinct sizes per diagram. Four is the hard maximum.** Corpus median is 3.

**Panel labels are NOT 26.67.** Set them at 15.56 or 17.78 bold in a text grey (`#4c535d`). At 26.67 a panel label reads as an in-canvas title, which this file forbids, and it breaks the flat-scale rule below. 26.67 and above exist only for poster-scale artwork that is not going on a slide.

**The scale is deliberately flat.** Title-to-body ratio across 53 files has a median of **1.18**. Modal size is 18px; 93% of all glyphs sit between 13 and 23px. Hierarchy is carried by weight, colour and italic, never by size.

### Weights

**400 and 700 only.** No 300, no 500, no 600. Plus italics of each.

Pretendard ships no italic, so italic runs resolve to Inter Italic. Consequence from the corpus: **italic never touches Hangul.** Korean annotations are set upright in grey instead.

### Semantics: rules, not tendencies

- **Bold = the name of a thing.** Structural rank. Never emphasis.
- **Italic = a role, not an instance.** The corpus's single most distinctive habit. Zone labels, scene labels, container names, annotations, scope names. Italic marks text that describes the *picture* rather than naming a *component*.
- **Mono = literal identifiers only.** Config keys, ports, paths, sockets, host:port pairs, API symbols, opaque ids. Never prose, never a component name. Across 74 mono runs in the reference corpus there is not one prose fragment.
- **Mono is set at the same size as the proportional text beside it**, never larger. It sits at or below its neighbours on the ladder, so the contrast comes from the letterforms rather than from scale.
- **Mono takes the colour its encoding assigns**, or inherits the default ink. It never gets a code-grey of its own: in the corpus 42 of 74 runs inherit black, 20 are `#333`, and the remaining 12 carry the figure's own accent.
- **Arrow labels: 17.78px, bold, set directly on white.** Never a filled pill, never a plate.
- **An arrow label needs a gutter wide enough to hold it.** The 12-16px-above-the-line rule assumes a long connector run. Between two boxes on the same row at the usual 28-48px inter-container gutter, a 2-4 word label at 17.78px is 100-160px wide, so placing it 12-16px above the line puts it inside the flanking boxes. Either widen that one gutter to fit the label, move the label clear of the boxes' vertical band entirely, or leave the arrow unlabelled and let the two box names carry it. Do not shrink the label to make it fit.

Other metrics: `line-height` 1.20x Latin, ~1.45x Korean. `letter-spacing: 0`, every advance in the corpus is an exact integer font unit. No ALL-CAPS.

### Text width estimation

There is no wrapping in SVG `<text>`. Size boxes from this formula, measured against 571 real
labels in the actual render stack:

```
width ~= font-size x (0.55 x latin_chars + 0.88 x hangul_chars)
mono:    font-size x (0.50 x latin_chars + 1.00 x hangul_chars)
```

Per-character advances in em: lowercase 0.490, caps 0.652, digits 0.558, **Hangul 0.864**. Note Hangul is 0.864 em in the proportional stack, not the commonly-assumed 1.0 full-width.

D2Coding is a true 1:2 halfwidth monospace, measured against the bundled file: **every** Latin letter, digit, symbol and space is exactly 0.500 em and every Hangul syllable or jamo is exactly 1.000 em, unchanged at weight 700. Mono Hangul is therefore full-width and 16% wider than Hangul in the proportional stack, which is the one case where a Korean mono run needs more room than the same string set in Pretendard.

The formula over-estimates (median +9.2%, p95 +25.6%), so the slack becomes padding. That is intentional, err wide.

Korean and English labels occupy **the same width at the same size** (measured per-label ratio 0.87-1.34 across a matched KO/EN diagram pair whose paths are byte-identical). Box widths need no localisation change.

## Ink

Two inks, two jobs. Do not interchange them.

| ink | used for |
|---|---|
| `#000000` | box outlines, primary label text |
| `#3a414a` | connectors, and **never black** |

### Neutral ramp

These are **not greys**. It is a blue-tinted ramp at hue ~213. Using true grey is itself a tell.

```
#ffffff  #f2f3f5  #eef0f3  #dfe3e8  #dbdee3  #ced4db  #b4bdc8
#aeb8c3  #979ea8  #7d8998  #6f7681  #5a6c86  #3a414a  #333333  #000000
```

Text greys: `#333333` annotation, `#4c535d` and `#6f7681` zone/scene labels, `#5a6c86` secondary.

Eight pure neutrals (S<10%) account for 38.4% of all colour instances in the corpus. Four hexes carry 56.3% of all colour use.

### Accent hues, pale / mid / dark triples

Each hue ships as three stops. **Pale = area fill. Mid = stroke. Dark = text.**

| hue | pale | mid | dark |
|-------|-----------|-----------|-----------|
| amber | `#fff3d9` | `#fc9432` | `#cc4e00` |
| blue | `#edf5ff` | `#6db1ff` | `#1071e5` |
| teal | `#d7faf5` | `#00c2a8` | `#008573` |
| green | `#e3fae3` | (none) | `#008a0e` |
| pink | `#fff0fb` | `#ff80df` | `#d916a8` |
| red | (none) | (none) | `#e81313` |

`#e81313` is for defect and error notes only. `#cfe4ff` is an available mid-blue area fill. `#f2f3f5` is the neutral container band.

**Yellow and cyan appear in 0.8% of the corpus and are never used as a line colour.** Don't.

### Harmonising with the deck theme: a decision, not a measurement

Everything above is measured from the reference corpus. This subsection is a judgment call, made once so diagrams don't clash with the deck they sit in. It is recorded as a decision so it can be revisited.

`themes/bai-flat/theme.css` defines its own palette, and it partly agrees and partly conflicts:

| theme token | value | resolution |
|---|---|---|
| `--color-border` | `#dde3ea` | **agrees**: already blue-tinted, sits in our ramp |
| `--color-border-strong` | `#b8c2cc` | **agrees**: same |
| `--color-accent-amber` | `#e8822a` | **use this as the amber mid**, in place of `#fc9432`. Visually equivalent, and it is the deck's own token |
| `--color-lablup` | `#39b176` | **use this as the green mid**: the golden green triple had no mid stop |
| `--color-brand` | `#ff8001` | **do not use in diagrams.** Reserved for deck chrome (progress bar, rules). A diagram fill in the exact brand orange competes with the slide furniture |
| `--color-fg` | `#111111` | fine as an alternative to `#000000` for text; keep `#000000` for outlines |
| `--color-fg-muted` | `#666666` | **conflicts: do not use in diagrams** |
| `--color-fg-subtle` | `#999999` | **conflicts: do not use in diagrams** |

**On the grey conflict**: the theme's muted and subtle text colours are true greys. Inside a diagram, true grey against a blue-tinted neutral ramp reads as the generated-output tell this whole spec exists to avoid. Use the blue-tinted ramp (`#6f7681`, `#979ea8`) for diagram text instead. This is defensible rather than arbitrary. The theme's own *non-text* neutrals (its borders) are already blue-tinted, so the ramp is consistent with the theme everywhere except two body-text tokens that were never intended for figure interiors.

Net effect on the accent table above: amber mid becomes `#e8822a`, green mid becomes `#39b176`, everything else stands. Blue, teal and pink have no theme equivalent and keep their corpus values.

### Colour budget: the three hard limits

1. **2-3 hues per diagram.** Four or more only when colour is genuinely categorical, one hue per member of a set (per tenant, per job, per request). Corpus: Page 2 = 2, proxy-impl = 3, RGC = 3, Workload Mapping = 6 (six tenants: the legitimate categorical case).

2. **Saturated area under 20% of canvas.** Measured: proxy-impl 1.8%, Page 2 9.7%, RGC 18%. The neutral-to-coloured pixel ratio on typical diagrams runs **95:5**.

3. **Colour encodes exactly one variable per diagram.** Unanimous across all four forensic passes. If you cannot name that variable in one word: *ownership*, *tenant*, *layer*, *novelty*: the diagram has no colour system and you must remove colour until it does.

Spend saturation on the **smallest** elements: a 2px stroke, one word of text. Never on large fills.

Emphasis ladder, in the corpus's order of actual use:
1. hue
2. same-hue 3px stroke
3. mark-shape change (a star among dots)
4. red text

**Size is never used for emphasis.** Do not scale a box up to make it matter more.

## Two registers: pick one per diagram, never mix

The corpus splits 1183 rounded / 1034 sharp rects, and the split is **by file, never within a file**.

| | **Product register** | **Whiteboard register** |
|---|---|---|
| corners | `rx="6"` | sharp, `rx="0"` |
| fills | pale hue tints | white |
| outlines | `#000` or same-hue-darker | `#000` |
| use for | architecture, integration, platform | mechanism, dataflow, algorithm |

Everything else in this file applies to both.

## Geometry

- **`rx="6"`** throughout the product register. Corpus: r=6 is 74.7% of all arcs and 91% of real rounded rects. Inline chips use `rx="2"`. The **only** other radius is the stadium (`rx = height/2`), which means **external system** and nothing else.
- **`stroke-width="2"`** for box outlines. Corpus distribution over 3487 strokes: 2 = 65.8%, 3 = 16.8%, 1 = 11.3%, 4 = 4.0%, 5 = 1.8%, 7 = 0.4%.
- **`stroke-linejoin="round"` and `stroke-linecap="round"`**, 100% of the corpus.
- **Fill lightness median L71, stroke lightness median L37**, keep ~34 points of separation. Two valid pairings: neutral outline (ΔL 46-100, dominant) or same-hue-darker outline (ΔL 15-25).
- **All dimensions in multiples of 4.** Box widths cluster on multiples of 8: 40, 48, 92, 120, 172, 248, 264, 284, 304, 328, 368.
- Absolute x/y need not snap to a grid, but **relative geometry must be exact**: repeated siblings share identical width and pitch to the pixel.
- Box padding 16-18px horizontal. Leaf text centred both axes; container titles top-anchored.
- Container inset ~12-16px on the sides, **~38px top band** reserved for the container's label.
- Gutters 8-16px intra-container, 28-48px inter-container. Related boxes may stack flush at 0. Three label-sized boxes plus two 28-48px gutters will not always fit inside a boundary's inner width; when they do not, widen the boundary or drop to two columns rather than squeezing the boxes below their label width.

## Connectors

**One arrowhead, everywhere.** Filled triangle, 14.26 long x 9.27 base (1.54:1, ~36° apex). 224 of 229 measured heads are identical to within 0.03px. Use the half-scale variant (~7.3 x 4.6) on 1px and dotted lines.

```xml
<marker id="ah" viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/>
</marker>
```

Two cautions, both tested:
- `markerUnits` defaults to `strokeWidth`, which scales the head with the line. Keep the default. `userSpaceOnUse` at stroke-width 8 causes the line to swallow the arrowhead.
- **`context-stroke` works in Chrome but Safari has not shipped it.** Deployed HTML is Safari-exposed, so for published decks define one marker per colour instead. The engine ID-scopes markers, so ids may be reused across files.

Routing: **orthogonal, with 6px rounded elbows**, elbow radius matches box `rx`. 1091 of 1129 measured elbows are r=6, the most consistent micro-detail in the whole corpus. Corpus routing mix is 77% orthogonal, 16% diagonal, 7% curved; no file is curve-dominant. Béziers are for annotation leader lines only.

```
M650,325 H728 Q740,325 740,337 V413 Q740,425 752,425 H824
```

The quadratic control point is the un-rounded vertex. Always `fill="none"`.

Inset the arrow endpoint by `4 + stroke-width` from the target's border so the head doesn't overlap it.

### Line semantics

| style | means |
|---|---|
| solid | actual flow |
| **dashed `6 4`** | logical / proposed / **container boundary** |
| dotted, 2px on 4px pitch | telemetry |
| `#dfe3e8` at full weight | the path not taken (ghost route) |

A dashed *border* marks a boundary. A dashed *arrow* means logical-not-physical. Dash is `3 x stroke-width` on, `2 x stroke-width` off.

Weights in play, maximum three: 1 (annotation leaders), 2 (default), 3-4 (the one flow being argued), 5-7 (fabric/bus bars). ISO 128-2 wants at least 2:1 between thick and thin; 2-vs-4 satisfies it.

## Shape vocabulary

| shape | means |
|---|---|
| rounded rect `rx=6` | component |
| stadium `rx=h/2` | external system / endpoint |
| dashed rect, unfilled | logical boundary, zone, plane |
| solid band `#f2f3f5` | grouping container |
| sharp rect | data row / table cell |
| diamond | routing decision |
| cylinder | datastore |
| cloud | internet |
| wavy-bottom note | request / document |
| isometric cube | container / pod / session |
| isometric rhombus | GPU / unit of capacity |
| parallelogram | job / workload |
| half-circle stub on an edge | port / slot |
| card-stack, offset (+15,+8) | "N of these" |

### The oblique plane

Measured from the one figure in the corpus that draws surfaces rather than boxes. Every number here is forensic; do not re-derive the projection.

**The projection is a 45 degree cavalier oblique, not a true isometric.** Horizontal stays horizontal, vertical stays vertical, the depth axis recedes **up and to the right** at exactly 45 degrees with no foreshortening. All 52 slabs in the source measure `|dx/dy| = 1.0000`. Equivalent to `matrix(1,0,-1,1,tx,ty)` on an axis-aligned rect, but emit the path directly. **No `transform` attribute anywhere**: the house style computes coordinates, it does not transform them.

```
plane, back-left corner (X,Y), width W, depth D:
  M{X},{Y} l{-D},{D} h{W} l{D},{-D} z

  back-left (X,Y)   back-right (X+W,Y)
  front-left (X-D,Y+D)   front-right (X+W-D,Y+D)
  bbox (W+D) x D, x from X-D to X+W
```

- **W:D between 4:1 and 5:1** for a slab that reads as a surface. **10:1** for a thin fabric sliver. Nothing squarer than 4:1; it stops looking like a plane and starts looking like a lid.
- **Stack pitch is pure vertical translation.** Same x, y stepped, never both. Source: pitch 9 on depth 20-22, so **pitch is 40-45% of the depth** and adjacent slabs overlap by 55-60%. Less overlap and the group stops reading as one stack.
- **Unless different objects sit on different slabs.** Then the pitch has a second constraint, and it wins. A base line lands at `D/2`; slab edges land at `pitch`, `2 x pitch`, `D`, `D + pitch`. When `pitch` is near `D/2` those coincide, the base line falls on a neighbouring slab's edge and the object reads as standing on the wrong plane. Keep `|D/2 - pitch|` and `|D/2 - 2 x pitch|` at **12px or more**. `D=48, pitch=36` satisfies it and is the exemplar's geometry; `D=56, pitch=32` does not, and puts every base line 4px off an edge.
- **Paint the top slab first, the bottom slab last.** The lowest slab overpaints the ones above it. Backwards for shelves, correct for the thing this actually looks like: a deck fanned toward the reader.
- **Translucent fills scale opacity against area.** A narrow sliver takes `fill-opacity` **0.54-0.55**; a full-size boundary plane takes **0.16-0.21**. The saturated ink stays roughly constant whatever the slab's size.
- **The outline carries the identity, not the fill.** Same-hue-darker stroke, fully opaque. Where two translucent fills cross, the blend is muddy but the two outlines still trace two slabs. Drop the outlines and the stack collapses into a smear.
- **Three translucent slabs is the ceiling.** Three plus one boundary plane reads. The source panel that pushes to five is measurably its worst.

**Cube.** Front-face top-left `(x,yt)`, width `W`, height `H`, depth `d`:

```
top    M{x+d},{yt-d} l{-d},{d} h{W} l{d},{-d} z      fill #ffffff
side   M{x+W+d},{yt-d} l{-d},{d} v{H} l{d},{-d} z    fill #ced4db
front  M{x},{yt} h{W} v{H} h{-W} z                    fill #f2f3f5
all three stroked #000000 stroke-width 2
```

`d = 0.38 to 0.43 x W`, never 1.0: the depth is shortened, the 45 degree angle is not. `H` between 0.89 and 1.00 of `W`. Face lightness runs top > front > side across 16 points of the neutral ramp (L100, L96, L84). No hue on a cube, ever.

**Cylinder is not projected.** It stays the flat datastore glyph standing upright, `ry / rx = 0.21`. A circle correctly projected onto this ground plane comes out as a tilted ellipse and reads as a mistake. The cylinder is a symbol, not a solid.

**Seating: `y_base = y_plane_top + D/2`.** An object's base line sits at the vertical middle of its plane's depth band. Verified to within 4px on every object in the source. This is the whole trick: the band **brackets** the base, so the far half hides behind the object and the near half runs in front of it and stays visible below. Base on the back edge floats. Base on the front edge looks glued to the lip. Only the middle rests. Paint every object after every plane.

**Labels are never skewed.** All 132 label runs in the source carry an identity linear transform. Nothing follows the 45 degree axis. Plane names go horizontal to the left of the stack; object names horizontal above the objects; plane-content names horizontal below the front edge; parentheticals on a second line at 13.33.

## Text budget

- **2-4 words per text node.** Measured 2.15 words per run (corpus median), 2.5-4.4 across the deep-dived files.
- 57-96% of text nodes are a single line.
- **Noun phrases only.** Across fourteen deep-dived files there are roughly three full sentences total: each a deliberate defect note, each at the smallest size in its file.
- **No terminal periods on fragments.**
- ~106 text tokens per file, ~36 lines.

### No title

**The slide headline is the title.** Do not put one in the canvas.

Backed by AIAA (*"do not repeat all or part of the figure caption or subcaption within the figure itself"*) and by Nature, which puts the title in the caption. C4 requires in-canvas titles, but only because C4 diagrams are standalone artifacts read without surrounding prose; that is the opposite of a slide figure.

**The one exception**: multi-panel comparisons get short *panel labels*: `AS-IS` / `TO-BE`, `<Native Setup>` / `<Phase 1>`. Text only, differentiating the panels, never restating the caption (Freshwater Science figure guidelines).

### No legend

The corpus contains **zero legends**. Label the thing in place: an italic grey label on a hairline curved leader line, pointing at the actual element. Direct labelling beats a legend because a legend forces the reader to shuttle attention back and forth (Wilke, *Fundamentals of Data Visualization*).

No captions, no footnotes, no numbered badges.

Use `…` or `⋮` in place of drawing more boxes.

## Composition motifs

- **Nesting = containment, literally.** A box drawn inside a box needs no arrow to say "part of".
- **Small multiples.** Repeated panels with pixel-identical internal geometry, so the *diff* between panels is the message. The right tool for AS-IS/TO-BE, phase progressions, comparisons.
- **Before/after transitions use a chunky filled block arrow**, never a line arrow. A line arrow means dataflow; a block arrow means "and then the world changed".
- **"N of these"** is drawn as three columns plus a literal `…`, or offset stacked rects, or empty ghost columns. Never draw all N.
- **Inactive or superseded** is grey plus dotted, or a strikethrough on the label.
- **Boundaries** are a dashed `rx=6` rect, `6 4` dashing. Blue = network, grey = logical, red = optional.
- **Matrices carry no cell borders, no header rules, no zebra striping.** Build them from overlapping grouping frames, solid columns crossed with dashed rows. The strongest corpus example goes further and makes the row *fill* the mapping, so the table holds no text at all.
- **Logos and icons sit outside or on top of** the box they qualify, never inside it. 28-43px.

## Forbidden

No gradients. No drop shadows. No filters. No glow. No left-border accent stripes. No top accent bands. No tinted rounded callout asides. No badge or pill chips: the stadium means external system and nothing else. No emoji. No 3D except a deliberate isometric scene. No opacity as decoration. No in-canvas title. No legend. No centred-everything layout. No true grey. No yellow or cyan line colour.

## Emission order (avoids a real, observed bug)

SVG has no z-index; paint order is document order. A label emitted before a rect that overlaps it is painted over and **invisible in the deck**: this is a real defect in a shipped figure, and the LLM4SVG paper names mis-handled paint order as a known model failure mode.

A label painted *last* can still be illegible if a line is drawn underneath it: a cylinder's cap arc running through its own label is the canonical case. Emission order does not fix that; move the label or resize the shape. `check-svg.js` reports it as `TEXT_ON_STROKE`.

**Emit in this order, always:**
1. background rect
2. `<defs>` (markers)
3. containers and grouping bands
4. boxes
5. connectors
6. **all text, last**
