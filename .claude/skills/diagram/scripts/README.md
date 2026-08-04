# Diagram scripts

Three checks for hand-authored slide SVGs. Run them in this order: `lint-svg.py` (instant, no browser), `check-svg.js` (real Chrome layout), `render-svg.sh` (look at it yourself).

## lint-svg.py

Static compliance against the design tokens in `../references/tokens.md`. Standard library only, no browser, no npm.

```bash
python3 .claude/skills/diagram/scripts/lint-svg.py <file.svg> [more.svg ...]
python3 .claude/skills/diagram/scripts/lint-svg.py --dir presentations/p010/images/figures
python3 .claude/skills/diagram/scripts/lint-svg.py --json <file.svg>
python3 .claude/skills/diagram/scripts/lint-svg.py --quiet --dir presentations
```

| Option | Effect |
|---|---|
| `--dir <path>` | lint every `*.svg` under the path, recursively |
| `--json` | full findings and measured facts as JSON |
| `--quiet` | one `PASS`/`FAIL` line per file plus a total |
| `--theme-css <path>` | stylesheet whose `:root --color-*` values join the palette (default: `themes/bai-flat/theme.css`, override with `SLIDE_ENGINE_THEME_CSS`) |

Fail codes:

| Code | Fires when |
|---|---|
| `CANVAS` | no viewBox, viewBox width is not 1000, or height is over 560 |
| `TYPE_COUNT` | more than 4 distinct font sizes |
| `TYPE_WEIGHT` | any font-weight other than 400 or 700 |
| `PALETTE` | a fill or stroke colour outside the token palette, listed by hex |
| `HUE_BUDGET` | more than 3 hue families, unless the file declares `<!-- categorical: N -->` |
| `STROKE_WIDTH` | a stroke-width outside {1, 2, 3, 4, 5, 7} |
| `CORNER_REGISTER` | `rx=6` mixed with another nonzero radius. Stadium pills (`rx = h/2`) are exempt, being a distinct shape token |
| `TEXT_BUDGET` | a single label over 6 words |
| `TERMINAL_PERIOD` | a label ending in a period |
| `PUNCTUATION` | em dash, middle dot, or emoji in a label. En dash passes only between digits |
| `PROVENANCE` | a chat-window paste artifact anywhere in the file (`oaicite`, `citeturn`, `utm_source=chatgpt.com`, `[cite:`, `[Your Name]`, and the rest of the list in `.claude/rules/text-syntax.md`) |
| `EFFECTS` | gradient, filter, blur, or drop shadow |

Warn codes: `TYPE_LADDER` (size off 13.33/15.56/17.78/20/22.22/26.67), `TEXT_BUDGET` (a label over 4 words, or over 35 words on the canvas), `SATURATION` (saturated fills estimated over 20% of the canvas), `CORNER_REGISTER` (rounded corners at a radius other than 6), `IN_CANVAS_TITLE` (largest label is 1.3x the modal size and sits in the top 12%), `PAINT_ORDER` (a label emitted before an opaque shape whose box contains its anchor).

`PAINT_ORDER` reads static coordinates and ignores `transform`, so it is the cheap version of `check-svg.js`'s `OCCLUDED_TEXT`. Trust the browser one.

## check-svg.js

Geometric check with real text layout. Inlines the SVG into a page DOM the way `engine/marp.config.js` does, then measures every text node in Chrome. Needs the repo's bundled puppeteer.

```bash
node .claude/skills/diagram/scripts/check-svg.js <file.svg> [more.svg ...]
node .claude/skills/diagram/scripts/check-svg.js <file.svg> --png /tmp/f07.png
node .claude/skills/diagram/scripts/check-svg.js <a.svg> <b.svg> --png /tmp/shots
```

| Option | Effect |
|---|---|
| `--min-font <n>` | `TINY_TEXT` floor in user units (default 11) |
| `--pad <n>` | container padding allowance before a label counts as overflowing (default 4) |
| `--css <deck.css>` | load a stylesheet into the page, to reproduce cascade effects on `foreignObject` |
| `--png <path>` | screenshot. One file: the path is the PNG. Several files: the path is a directory, one PNG per input |
| `--json` | findings as JSON |

Errors: `OUT_OF_VIEWBOX`, `TEXT_OVERFLOW`, `OCCLUDED_TEXT`, `FO_OVERFLOW`. Warnings: `TEXT_COLLIDE`, `TINY_TEXT`, `FONT_FALLBACK`.

`FONT_FALLBACK` reports what *this machine* renders, so a missing family means the same substitution happens in the build. `D2Coding` is not installed here; every figure using it renders in the wider Menlo, which is what pushes monospace labels out of their boxes.

Set `PUPPETEER_PATH` to override the puppeteer lookup, which otherwise walks up from the script and from the working directory.

## render-svg.sh

Rasterize to PNG for visual review, at a given longest edge.

```bash
.claude/skills/diagram/scripts/render-svg.sh <in.svg> <out.png> [max-dimension]
.claude/skills/diagram/scripts/render-svg.sh figures/f07.svg /tmp/f07.png        # 1400 default
.claude/skills/diagram/scripts/render-svg.sh figures/f07.svg /tmp/f07.png 800
```

Prints `<absolute-png-path> <width>x<height>`. Scratch files live in a per-run `mktemp -d`, so parallel renders are safe.

Chrome is resolved from `CHROME`, then `/Applications/Google Chrome.app`, then `google-chrome`/`chromium` on PATH, then the puppeteer build in `node_modules`.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | no failures. `lint-svg.py` may still have printed warnings; `render-svg.sh` wrote the PNG |
| 1 | `lint-svg.py`: at least one FAIL. `check-svg.js`: at least one error-level finding. `render-svg.sh`: Chrome produced no image |
| 2 | bad usage, unreadable input, missing puppeteer, or no Chrome |

## Dependencies

`python3` (standard library only), `node` with the repo's `node_modules/puppeteer`, and a Chrome or Chromium binary.
