#!/usr/bin/env python3
"""Static compliance linter for hand-authored slide SVGs.

Parses the SVG with the standard library only (no browser, no dependencies) and
checks it against the diagram design tokens: type ladder, weight set, palette,
hue budget, stroke set, corner register, text budget, canvas size, and the
paint-order trap.

Geometric questions that need real text layout (does this label fit its box?)
belong to check-svg.js, not here.

Usage:
  python3 lint-svg.py <file.svg> [more.svg ...]
  python3 lint-svg.py --dir <folder>        # every *.svg under folder, recursive
  python3 lint-svg.py --json <file.svg>     # machine-readable
  python3 lint-svg.py --quiet --dir <dir>   # one summary line per file

Exit: 0 clean, 1 at least one FAIL, 2 bad usage or unparseable input.

A file may declare intentional categorical colour with a comment:
  <!-- categorical: 6 -->
which raises the hue budget to that number. A matrix whose cell fill carries the
value declares:
  <!-- fill-as-value -->
which raises the saturated-area cap.
"""

import argparse
import json
import math
import os
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, OrderedDict

# --- token spec -------------------------------------------------------------

CANVAS_WIDTH = 1000
CANVAS_MAX_HEIGHT = 560

TYPE_LADDER = (13.33, 15.56, 17.78, 20.0, 22.22, 26.67)
TYPE_LADDER_TOLERANCE = 0.06
MAX_DISTINCT_FONT_SIZES = 4
ALLOWED_FONT_WEIGHTS = {"400", "700", "normal", "bold"}

STROKE_WIDTHS = {1.0, 2.0, 3.0, 4.0, 5.0, 7.0}
PRODUCT_RADIUS = 6.0

MAX_HUES = 3
MAX_SATURATED_AREA_SHARE = 0.20
SATURATION_FLOOR = 0.15

# The pale stop of every accent triple is an area fill, so all six have to reach
# the saturated-area estimate. They span L 0.906 to L 0.971, and a ceiling inside
# that range exempts whichever hues happen to sit above it. Pure white carries no
# saturation, so SATURATION_FLOOR excludes it without help from the ceiling.
LIGHTNESS_FLOOR = 0.06
LIGHTNESS_CEILING = 0.985

# Saturated area is measured by marking a grid rather than summing shape areas,
# so overlapping fills are charged once. The cell matches the house 4px grid.
COVERAGE_CELL = 4

# A matrix that encodes its values as cell fill spends area on colour by design
# and cannot meet the budget written for decorative tints.
FILL_AS_VALUE_AREA_SHARE = 0.45

WORDS_PER_NODE_FAIL = 6
WORDS_PER_NODE_WARN = 4
TOTAL_WORDS_WARN = 35

TITLE_SIZE_RATIO = 1.3
TITLE_BAND = 0.12

# Ink, neutral ramp, accent triples and text greys from the token spec.
TOKEN_COLORS = {
    "#000000": "ink/outline",
    "#3a414a": "ink/connector",
    "#333333": "text/annotation",
    "#4c535d": "text/zone",
    "#5a6c86": "text/secondary",
    "#6f7681": "text/scene",
    "#ffffff": "ramp/00",
    "#f2f3f5": "ramp/01",
    "#eef0f3": "ramp/02",
    "#dfe3e8": "ramp/03",
    "#dbdee3": "ramp/04",
    "#ced4db": "ramp/05",
    "#b4bdc8": "ramp/06",
    "#aeb8c3": "ramp/07",
    "#979ea8": "ramp/08",
    "#7d8998": "ramp/09",
    "#fff3d9": "amber/pale",
    "#fc9432": "amber/mid",
    "#e8822a": "amber/mid-theme",
    "#39b176": "green/mid-theme",
    "#cc4e00": "amber/dark",
    "#edf5ff": "blue/pale",
    "#6db1ff": "blue/mid",
    "#1071e5": "blue/dark",
    "#cfe4ff": "blue/area",
    "#d7faf5": "teal/pale",
    "#00c2a8": "teal/mid",
    "#008573": "teal/dark",
    "#e3fae3": "green/pale",
    "#008a0e": "green/dark",
    "#fff0fb": "pink/pale",
    "#ff80df": "pink/mid",
    "#d916a8": "pink/dark",
    "#e81313": "red/defect",
    "#d64545": "house/danger",
}

# Corpus colours the theme supersedes at the same stop in the triple. Only amber
# qualifies: the theme's #39b176 fills green's absent mid stop, so it does not
# replace #008a0e, which is the dark stop used for text.
PREFERRED = {
    "#fc9432": "#e8822a",
}

# The bai-flat :root palette is loaded from the theme at run time and merged in.
DEFAULT_THEME_CSS = "themes/bai-flat/theme.css"

EM_DASH = "\u2014"
EN_DASH = "\u2013"
BANNED_PUNCTUATION = (
    (EM_DASH, "em dash"),
    (EN_DASH, "en dash"),
    ("\u00b7", "middle dot"),
    ("\u30fb", "katakana middle dot"),
)
EN_DASH_NUMERIC = re.compile(r"\d\s*%s\s*\d" % EN_DASH)
EMOJI = re.compile(
    "["
    "\U0001f000-\U0001faff"   # emoticons, pictographs, transport, symbols
    "\u2600-\u27bf"           # misc symbols and dingbats
    "\u2b00-\u2bff"           # misc symbols and arrows
    "\ufe0f"                   # variation selector 16
    "]"
)
# Chat-window paste artifacts. Any hit is a defect, per .claude/rules/text-syntax.md.
PROVENANCE = (
    "oaicite", "oai_citation", "contentReference", "citeturn", "turn0search",
    "turn0image", "utm_source=chatgpt.com", "[cite:", "start_span", "end_span",
    "grok-card", "grok_render_citation", "ppl-ai-file-upload", "[attached_file:",
    "As an AI language model", "as of my last knowledge update", "[Your Name]",
)

SVG_NS = "http://www.w3.org/2000/svg"
CATEGORICAL = re.compile(r"<!--\s*categorical\s*:\s*(\d+)\s*-->", re.I)
FILL_AS_VALUE = re.compile(r"<!--\s*fill-as-value\s*-->", re.I)

NAMED_COLORS = {
    "white": "#ffffff", "black": "#000000", "red": "#ff0000", "grey": "#808080",
    "gray": "#808080", "none": None, "transparent": None, "currentcolor": None,
    "context-stroke": None, "context-fill": None, "inherit": None,
}

SHAPE_TAGS = ("rect", "circle", "ellipse", "path", "polygon", "polyline", "line")

# Path and points data pack numbers without separators ("12.258.001" is two).
NUMBER = re.compile(r"[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?")

# --- helpers ----------------------------------------------------------------


def local(tag):
    return tag.split("}")[-1] if "}" in tag else tag


def iter_all(root):
    yield root
    for child in root:
        yield from iter_all(child)


def to_float(value, default=None):
    if value is None:
        return default
    try:
        return float(re.sub(r"[^0-9.eE+-]", "", str(value)) or "nan")
    except ValueError:
        return default


def norm_color(value):
    if value is None:
        return None
    v = value.strip().lower()
    if v in NAMED_COLORS:
        return NAMED_COLORS[v]
    if v.startswith("url("):
        return None
    if re.fullmatch(r"#[0-9a-f]{3}", v):
        return "#" + "".join(c * 2 for c in v[1:])
    if re.fullmatch(r"#[0-9a-f]{6}", v):
        return v
    if re.fullmatch(r"#[0-9a-f]{8}", v):
        return v[:7]
    m = re.fullmatch(
        r"rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+[\d.%]+)?\s*\)", v)
    if m:
        return "#%02x%02x%02x" % tuple(int(float(x)) for x in m.groups())
    return v


def style_value(element, prop):
    style = element.get("style")
    if not style:
        return None
    m = re.search(r"(?:^|;)\s*%s\s*:\s*([^;]+)" % re.escape(prop), style)
    return m.group(1).strip() if m else None


def resolve(element, parents, prop):
    """Walk the ancestor chain for an SVG presentation attribute."""
    current = element
    while current is not None:
        value = current.get(prop) or style_value(current, prop)
        if value is not None:
            return value
        current = parents.get(id(current))
    return None


def hsl(hex_color):
    r, g, b = (int(hex_color[i:i + 2], 16) / 255.0 for i in (1, 3, 5))
    hi, lo = max(r, g, b), min(r, g, b)
    lightness = (hi + lo) / 2
    if hi == lo:
        return 0.0, 0.0, lightness
    delta = hi - lo
    sat = delta / (2 - hi - lo) if lightness > 0.5 else delta / (hi + lo)
    if hi == r:
        hue = ((g - b) / delta) % 6
    elif hi == g:
        hue = (b - r) / delta + 2
    else:
        hue = (r - g) / delta + 4
    return hue * 60, sat, lightness


# Upper bound of each hue family, in degrees.
HUE_BINS = (
    (15, "red"), (45, "orange"), (70, "yellow"), (160, "green"),
    (200, "teal"), (250, "blue"), (290, "violet"), (345, "pink"),
)

# Palette roles that are neutral by definition. The house ramp is blue-tinted at
# hue 213, so saturation alone would misread it as a colour.
NEUTRAL_ROLES = ("ink/", "ramp/", "text/", "theme/fg", "theme/bg", "theme/border")


def coverage_share(boxes, canvas_w, canvas_h):
    """Fraction of the canvas any of `boxes` covers, counting overlap once.

    A card stack is three rects laid nearly on top of each other; summing their
    areas reports three times the colour a reader sees. Marking a grid instead
    charges each region once, whatever is stacked on it.
    """
    if not boxes or canvas_w <= 0 or canvas_h <= 0:
        return 0.0
    cols = int(math.ceil(canvas_w / COVERAGE_CELL))
    rows = int(math.ceil(canvas_h / COVERAGE_CELL))
    covered = set()
    for x0, y0, x1, y1 in boxes:
        c0 = max(0, int(math.floor(min(x0, x1) / COVERAGE_CELL)))
        c1 = min(cols, int(math.ceil(max(x0, x1) / COVERAGE_CELL)))
        r0 = max(0, int(math.floor(min(y0, y1) / COVERAGE_CELL)))
        r1 = min(rows, int(math.ceil(max(y0, y1) / COVERAGE_CELL)))
        for r in range(r0, r1):
            for c in range(c0, c1):
                covered.add((r, c))
    return len(covered) * COVERAGE_CELL ** 2 / (canvas_w * canvas_h)


def hue_name(hex_color, palette=None):
    """Hue family for a saturated colour, or None for neutrals and extremes."""
    role = (palette or {}).get(hex_color, "")
    if role.startswith(NEUTRAL_ROLES):
        return None
    hue, sat, lightness = hsl(hex_color)
    if sat < SATURATION_FLOOR or not LIGHTNESS_FLOOR <= lightness <= LIGHTNESS_CEILING:
        return None
    for upper, name in HUE_BINS:
        if hue < upper:
            return name
    return "red"


def shape_bbox(element, tag):
    """Static bounding box in user units. Transforms are ignored."""
    get = element.get
    if tag == "rect":
        x, y = to_float(get("x"), 0.0), to_float(get("y"), 0.0)
        w, h = to_float(get("width"), 0.0), to_float(get("height"), 0.0)
        if w is None or h is None:
            return None
        return (x, y, x + w, y + h)
    if tag == "circle":
        cx, cy, r = to_float(get("cx"), 0.0), to_float(get("cy"), 0.0), to_float(get("r"), 0.0)
        return (cx - r, cy - r, cx + r, cy + r)
    if tag == "ellipse":
        cx, cy = to_float(get("cx"), 0.0), to_float(get("cy"), 0.0)
        rx, ry = to_float(get("rx"), 0.0), to_float(get("ry"), 0.0)
        return (cx - rx, cy - ry, cx + rx, cy + ry)
    if tag in ("polygon", "polyline"):
        nums = [float(n) for n in NUMBER.findall(get("points") or "")]
        pts = list(zip(nums[0::2], nums[1::2]))
        if not pts:
            return None
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        return (min(xs), min(ys), max(xs), max(ys))
    if tag == "path":
        return path_bbox(get("d") or "")
    return None


# Parameter count per path command. Arc takes seven, three of which are radii and
# flags, so treating a path's numbers as alternating x/y coordinates inflates the
# box by whatever the radii happen to be.
PATH_ARITY = {"m": 2, "l": 2, "h": 1, "v": 1, "c": 6, "s": 4, "q": 4, "t": 2, "a": 7, "z": 0}
PATH_TOKEN = re.compile(r"([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)")


def arc_extremes(x0, y0, rx, ry, rot, large_arc, sweep, x1, y1):
    """Endpoints plus whichever axis extremes the arc actually sweeps through.

    Unrotated arcs are solved exactly via the SVG endpoint-to-centre conversion.
    A rotated arc falls back to the endpoints padded by the radii, which contains
    the true curve.
    """
    if rx == 0 or ry == 0:
        return [(x0, y0), (x1, y1)]
    if rot % 180 != 0:
        return [(x0 - rx, y0 - ry), (x0 + rx, y0 + ry),
                (x1 - rx, y1 - ry), (x1 + rx, y1 + ry)]

    hx, hy = (x0 - x1) / 2.0, (y0 - y1) / 2.0
    scale = (hx * hx) / (rx * rx) + (hy * hy) / (ry * ry)
    if scale > 1:
        root = math.sqrt(scale)
        rx, ry = rx * root, ry * root

    denom = rx * rx * hy * hy + ry * ry * hx * hx
    if denom == 0:
        return [(x0, y0), (x1, y1)]
    num = max(0.0, rx * rx * ry * ry - denom)
    coef = math.sqrt(num / denom)
    if large_arc == sweep:
        coef = -coef
    ccx = coef * rx * hy / ry + (x0 + x1) / 2.0
    ccy = -coef * ry * hx / rx + (y0 + y1) / 2.0

    t0 = math.atan2((y0 - ccy) / ry, (x0 - ccx) / rx)
    t1 = math.atan2((y1 - ccy) / ry, (x1 - ccx) / rx)
    delta = t1 - t0
    if sweep and delta < 0:
        delta += 2 * math.pi
    elif not sweep and delta > 0:
        delta -= 2 * math.pi

    points = [(x0, y0), (x1, y1)]
    for k in range(-2, 3):
        for base in (0.0, math.pi / 2, math.pi, 3 * math.pi / 2):
            t = base + k * 2 * math.pi
            step = t - t0
            if (0 <= step <= delta) if delta >= 0 else (delta <= step <= 0):
                points.append((ccx + rx * math.cos(t), ccy + ry * math.sin(t)))
    return points


def path_bbox(d):
    """Conservative bounding box for path data, tracking the current point.

    Curves are bounded by their control-point hull and arcs by the endpoint plus
    radii, both of which contain the true curve.
    """
    tokens = [(c, n) for c, n in PATH_TOKEN.findall(d)]
    xs, ys, args = [], [], []
    cmd = None
    cx = cy = 0.0
    start_x = start_y = 0.0

    def flush():
        nonlocal cmd, cx, cy, start_x, start_y, args
        if cmd is None:
            return
        low = cmd.lower()
        rel = cmd.islower()
        arity = PATH_ARITY[low]
        if arity == 0:
            cx, cy = start_x, start_y
            xs.append(cx); ys.append(cy)
            args = []
            return
        while len(args) >= arity:
            chunk, args = args[:arity], args[arity:]
            if low == "h":
                cx = cx + chunk[0] if rel else chunk[0]
            elif low == "v":
                cy = cy + chunk[0] if rel else chunk[0]
            elif low == "a":
                rx, ry, rot, laf, sf = abs(chunk[0]), abs(chunk[1]), chunk[2], chunk[3], chunk[4]
                ex, ey = chunk[5], chunk[6]
                nx, ny = (cx + ex, cy + ey) if rel else (ex, ey)
                for px, py in arc_extremes(cx, cy, rx, ry, rot, laf, sf, nx, ny):
                    xs.append(px); ys.append(py)
                cx, cy = nx, ny
            else:
                pts = list(zip(chunk[0::2], chunk[1::2]))
                for px, py in pts:
                    ax, ay = (cx + px, cy + py) if rel else (px, py)
                    xs.append(ax); ys.append(ay)
                lx, ly = pts[-1]
                cx, cy = (cx + lx, cy + ly) if rel else (lx, ly)
            xs.append(cx); ys.append(cy)
            if low == "m":
                start_x, start_y = cx, cy
                cmd = "l" if rel else "L"
                low = "l"
        args = []

    for char, num in tokens:
        if char:
            flush()
            cmd = char
            if char.lower() == "z":
                flush()
                cmd = None
        else:
            args.append(float(num))
    flush()
    if not xs:
        return None
    return (min(xs), min(ys), max(xs), max(ys))


def shape_area(element, tag, bbox):
    if tag == "rect":
        return (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
    if tag == "circle":
        r = to_float(element.get("r"), 0.0)
        return math.pi * r * r
    if tag == "ellipse":
        return math.pi * to_float(element.get("rx"), 0.0) * to_float(element.get("ry"), 0.0)
    if tag == "polygon":
        nums = [float(n) for n in NUMBER.findall(element.get("points") or "")]
        pts = list(zip(nums[0::2], nums[1::2]))
        if len(pts) < 3:
            return 0.0
        acc = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1]
                  for i in range(len(pts)))
        return abs(acc) / 2
    # Path fills are irregular; half the bbox is the working estimate.
    return (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) * 0.5


def is_opaque(element, parents):
    fill = norm_color(resolve(element, parents, "fill"))
    if not fill or not fill.startswith("#"):
        return False
    for prop in ("fill-opacity", "opacity"):
        value = to_float(resolve(element, parents, prop), 1.0)
        if value is not None and value < 0.95:
            return False
    return True


def load_theme_palette(theme_css):
    """Read the bai-flat :root --color-* declarations."""
    if not theme_css or not os.path.isfile(theme_css):
        return {}
    with open(theme_css, encoding="utf-8") as handle:
        css = handle.read()
    root = re.search(r":root\s*\{(.*?)\}", css, re.S)
    if not root:
        return {}
    found = {}
    for name, value in re.findall(r"--color-([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})", root.group(1)):
        color = norm_color(value)
        if color:
            found[color] = "theme/%s" % name
    return found


def default_theme_css():
    env = os.environ.get("SLIDE_ENGINE_THEME_CSS")
    if env:
        return env
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
    return os.path.join(root, DEFAULT_THEME_CSS)


# --- analysis ---------------------------------------------------------------


class Report:
    def __init__(self, path):
        self.path = path
        self.checks = []
        self.facts = OrderedDict()

    def add(self, level, code, message):
        self.checks.append({"level": level, "code": code, "message": message})

    def fail(self, code, message):
        self.add("fail", code, message)

    def warn(self, code, message):
        self.add("warn", code, message)

    @property
    def fails(self):
        return [c for c in self.checks if c["level"] == "fail"]

    @property
    def warns(self):
        return [c for c in self.checks if c["level"] == "warn"]

    def as_dict(self):
        data = OrderedDict()
        data["file"] = self.path
        data["result"] = "fail" if self.fails else "pass"
        data["fail_count"] = len(self.fails)
        data["warn_count"] = len(self.warns)
        data.update(self.facts)
        data["checks"] = self.checks
        return data


def collect(root, raw):
    """Flatten the tree into the records every check reads."""
    parents = {}
    for parent in iter_all(root):
        for child in parent:
            parents[id(child)] = parent

    order = {}
    elements = []
    for index, element in enumerate(iter_all(root)):
        order[id(element)] = index
        elements.append(element)

    data = {
        "parents": parents, "order": order, "elements": elements,
        "tags": Counter(), "fills": Counter(), "strokes": Counter(),
        "stroke_widths": Counter(), "font_sizes": Counter(), "font_weights": Counter(),
        "radii": Counter(), "stadium_radii": 0, "texts": [], "shapes": [],
        "raw": raw,
    }

    for element in elements:
        tag = local(element.tag)
        data["tags"][tag] += 1

        width = element.get("stroke-width") or style_value(element, "stroke-width")
        if width:
            value = to_float(width)
            if value is not None:
                data["stroke_widths"][value] += 1

        if tag in SHAPE_TAGS:
            fill = norm_color(resolve(element, parents, "fill"))
            stroke = norm_color(resolve(element, parents, "stroke"))
            if fill and fill.startswith("#"):
                data["fills"][fill] += 1
            if stroke and stroke.startswith("#"):
                data["strokes"][stroke] += 1
            bbox = shape_bbox(element, tag)
            if bbox:
                data["shapes"].append({
                    "el": element, "tag": tag, "bbox": bbox,
                    "index": order[id(element)],
                    "opaque": is_opaque(element, parents),
                    "fill": fill,
                    "area": shape_area(element, tag, bbox),
                })

        if tag == "rect":
            rx = to_float(element.get("rx"))
            ry = to_float(element.get("ry"))
            radius = rx if rx is not None else ry
            height = to_float(element.get("height"), 0.0) or 0.0
            if radius:
                if abs(radius - height / 2) < 0.6:
                    data["stadium_radii"] += 1
                else:
                    data["radii"][round(radius, 2)] += 1

        if tag in ("text", "tspan"):
            size = to_float(resolve(element, parents, "font-size"))
            if size is not None:
                data["font_sizes"][round(size, 2)] += 1
            weight = resolve(element, parents, "font-weight")
            if weight:
                data["font_weights"][weight.strip()] += 1

        if tag == "text":
            content = re.sub(r"\s+", " ", "".join(element.itertext())).strip()
            if not content:
                continue
            x = to_float(element.get("x"))
            y = to_float(element.get("y"))
            if x is None or y is None:
                child = next((c for c in element if local(c.tag) == "tspan"), None)
                if child is not None:
                    x = to_float(child.get("x"), x)
                    y = to_float(child.get("y"), y)
            data["texts"].append({
                "el": element, "text": content, "x": x, "y": y,
                "size": to_float(resolve(element, parents, "font-size"), 0.0),
                "index": order[id(element)],
            })

    return data


def check_canvas(report, root, data):
    view_box = root.get("viewBox")
    width = height = None
    if view_box:
        parts = re.split(r"[\s,]+", view_box.strip())
        if len(parts) == 4:
            width, height = to_float(parts[2]), to_float(parts[3])
    if width is None:
        width, height = to_float(root.get("width")), to_float(root.get("height"))

    report.facts["viewBox"] = view_box or "(none)"
    report.facts["size"] = [width, height]

    if not view_box:
        report.fail("CANVAS", "no viewBox; the engine cannot size the figure")
        return width, height
    if width != CANVAS_WIDTH:
        report.fail("CANVAS", "viewBox width %g, expected %d (1 unit = 1 deck px)"
                    % (width, CANVAS_WIDTH))
    if height is not None and height > CANVAS_MAX_HEIGHT:
        report.fail("CANVAS", "viewBox height %g > %d; the deck will downscale the figure"
                    % (height, CANVAS_MAX_HEIGHT))
    return width, height


def check_type(report, data):
    sizes = sorted(data["font_sizes"], reverse=True)
    report.facts["font_sizes"] = sizes
    report.facts["distinct_font_sizes"] = len(sizes)

    if len(sizes) > MAX_DISTINCT_FONT_SIZES:
        report.fail("TYPE_COUNT", "%d distinct font sizes (max %d): %s"
                    % (len(sizes), MAX_DISTINCT_FONT_SIZES,
                       ", ".join("%g" % s for s in sizes)))

    off_ladder = [s for s in sizes
                  if not any(abs(s - rung) <= TYPE_LADDER_TOLERANCE for rung in TYPE_LADDER)]
    if off_ladder:
        report.warn("TYPE_LADDER", "off-ladder sizes %s; ladder is %s"
                    % (", ".join("%g" % s for s in off_ladder),
                       "/".join("%g" % r for r in TYPE_LADDER)))

    weights = sorted(data["font_weights"])
    report.facts["font_weights"] = weights
    bad = [w for w in weights if w not in ALLOWED_FONT_WEIGHTS]
    if bad:
        report.fail("TYPE_WEIGHT", "font-weight %s; only 400 and 700 exist"
                    % ", ".join(bad))


def check_palette(report, data, palette, height):
    colors = Counter()
    colors.update(data["fills"])
    colors.update(data["strokes"])
    report.facts["distinct_colors"] = len(colors)

    off = [c for c in colors if c not in palette]
    report.facts["off_palette"] = sorted(off)
    if off:
        report.fail("PALETTE", "%d colour%s outside the token palette: %s"
                    % (len(off), "" if len(off) == 1 else "s", ", ".join(sorted(off))))

    # The palette is the union of the corpus tokens and the theme's :root values,
    # so two spellings of one hue both validate and the set drifts apart silently.
    superseded = [(c, PREFERRED[c]) for c in colors if c in PREFERRED]
    if superseded:
        report.warn("PALETTE_ALIAS", "%s; prefer the theme token so figures stay consistent"
                    % ", ".join("%s -> %s" % pair for pair in sorted(superseded)))

    hues = sorted({h for h in (hue_name(c, palette) for c in colors) if h})
    report.facts["hues"] = hues
    declared = CATEGORICAL.search(data["raw"])
    budget = int(declared.group(1)) if declared else MAX_HUES
    report.facts["hue_budget"] = budget
    if len(hues) > budget:
        detail = "declared categorical: %d" % budget if declared else "budget %d" % MAX_HUES
        report.fail("HUE_BUDGET", "%d hues (%s), %s"
                    % (len(hues), ", ".join(hues), detail))

    canvas_h = height or CANVAS_MAX_HEIGHT
    tinted = [s["bbox"] for s in data["shapes"]
              if s["fill"] and s["fill"].startswith("#") and hue_name(s["fill"], palette)]
    share = coverage_share(tinted, CANVAS_WIDTH, canvas_h)
    report.facts["saturated_area_share"] = round(share, 3)
    cap = MAX_SATURATED_AREA_SHARE
    fill_as_value = FILL_AS_VALUE.search(data["raw"])
    if fill_as_value:
        cap = FILL_AS_VALUE_AREA_SHARE
        report.facts["saturated_area_cap"] = cap
    if share > cap:
        detail = "declared fill-as-value" if fill_as_value else "the budget"
        report.warn("SATURATION", "saturated fills cover an estimated %.0f%% of the canvas, over %s of %.0f%%"
                    % (share * 100, detail, cap * 100))


def check_strokes(report, data):
    widths = sorted(data["stroke_widths"])
    report.facts["stroke_widths"] = widths
    bad = [w for w in widths if w not in STROKE_WIDTHS]
    if bad:
        report.fail("STROKE_WIDTH", "stroke-width %s; allowed %s"
                    % (", ".join("%g" % w for w in bad),
                       "/".join("%g" % w for w in sorted(STROKE_WIDTHS))))


def check_corners(report, data):
    radii = sorted(data["radii"])
    report.facts["corner_radii"] = radii
    report.facts["stadium_rects"] = data["stadium_radii"]
    if PRODUCT_RADIUS in radii and len(radii) > 1:
        others = [r for r in radii if r != PRODUCT_RADIUS]
        report.fail("CORNER_REGISTER",
                    "rx=6 mixed with %s; a file is either all rx=6 or all sharp"
                    % ", ".join("rx=%g" % r for r in others))
    elif radii and PRODUCT_RADIUS not in radii:
        report.warn("CORNER_REGISTER",
                    "rounded corners at %s; the product register is rx=6"
                    % ", ".join("rx=%g" % r for r in radii))


def check_text(report, data):
    texts = data["texts"]
    report.facts["text_nodes"] = len(texts)
    total_words = 0
    for node in texts:
        words = node["text"].split()
        total_words += len(words)
        if len(words) > WORDS_PER_NODE_FAIL:
            report.fail("TEXT_BUDGET", "%d words in one label: %r"
                        % (len(words), node["text"]))
        elif len(words) > WORDS_PER_NODE_WARN:
            report.warn("TEXT_BUDGET", "%d words in one label: %r"
                        % (len(words), node["text"]))
        stripped = node["text"].rstrip()
        if stripped.endswith(".") and not stripped.endswith("..."):
            report.fail("TERMINAL_PERIOD", "label ends in a period: %r" % node["text"])

        for char, name in BANNED_PUNCTUATION:
            if char in node["text"]:
                if char == EN_DASH and EN_DASH_NUMERIC.search(node["text"]):
                    continue
                report.fail("PUNCTUATION", "%s in label: %r" % (name, node["text"]))
        if EMOJI.search(node["text"]):
            report.fail("PUNCTUATION", "emoji in label: %r" % node["text"])

    report.facts["word_count"] = total_words
    if total_words > TOTAL_WORDS_WARN:
        report.warn("TEXT_BUDGET", "%d words on the canvas (soft cap %d); move prose to the slide"
                    % (total_words, TOTAL_WORDS_WARN))


def check_title(report, data, height):
    sizes = [n["size"] for n in data["texts"] if n["size"]]
    if not sizes or height is None:
        return
    modal = Counter(sizes).most_common(1)[0][0]
    largest = max(sizes)
    if largest < modal * TITLE_SIZE_RATIO:
        return
    band = height * TITLE_BAND
    top = [n for n in data["texts"]
           if n["size"] == largest and n["y"] is not None and n["y"] <= band]
    if top:
        report.warn("IN_CANVAS_TITLE",
                    "%r is %.1fx the modal size at y=%g; the slide headline is the title"
                    % (top[0]["text"], largest / modal, top[0]["y"]))


def check_effects(report, data):
    banned = {
        "linearGradient": "gradient", "radialGradient": "gradient",
        "filter": "filter", "feDropShadow": "drop shadow",
        "feGaussianBlur": "blur", "feOffset": "offset shadow",
    }
    found = sorted({label for tag, label in banned.items() if data["tags"].get(tag)})
    if re.search(r'\bfilter\s*[=:]\s*["\']?\s*(url|drop-shadow|blur)', data["raw"], re.I):
        found.append("filter reference")
    if found:
        report.fail("EFFECTS", "%s present; the house style has none"
                    % ", ".join(sorted(set(found))))


def check_provenance(report, data):
    hits = [marker for marker in PROVENANCE if marker.lower() in data["raw"].lower()]
    if hits:
        report.fail("PROVENANCE", "generation artifact in the file: %s" % ", ".join(hits))


def check_arrowheads(report, data):
    """A round linecap is centred on the path endpoint, and refX=10 puts the
    arrowhead's tip on that same point, so the cap protrudes past the tip as a
    visible nub. Round caps belong on open-ended lines only."""
    bad = []
    for element in data["elements"]:
        attrib = element.attrib
        if not any(key.startswith("marker-") for key in attrib):
            continue
        if attrib.get("stroke-linecap") == "round":
            bad.append(local(element.tag))
    if bad:
        report.fail("ARROW_CAP",
                    "%d marker-terminated path(s) also set stroke-linecap=\"round\"; "
                    "the cap protrudes past the arrowhead tip. Drop the linecap on any "
                    "path carrying a marker (keep stroke-linejoin=\"round\" for elbows)"
                    % len(bad))


def check_paint_order(report, data):
    for node in data["texts"]:
        if node["x"] is None or node["y"] is None:
            continue
        for shape in data["shapes"]:
            if shape["index"] <= node["index"] or not shape["opaque"]:
                continue
            x0, y0, x1, y1 = shape["bbox"]
            if (x1 - x0) * (y1 - y0) > CANVAS_WIDTH * CANVAS_MAX_HEIGHT * 0.98:
                continue
            if x0 <= node["x"] <= x1 and y0 - node["size"] <= node["y"] <= y1:
                report.warn("PAINT_ORDER",
                            "%r is emitted before an opaque <%s> at (%g,%g %gx%g) that covers it; "
                            "move all text last"
                            % (node["text"], shape["tag"], x0, y0, x1 - x0, y1 - y0))
                break


def analyze(path, palette):
    report = Report(path)
    try:
        with open(path, encoding="utf-8") as handle:
            raw = handle.read()
    except OSError as error:
        report.fail("READ", str(error))
        return report
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as error:
        report.fail("PARSE", "XML parse error: %s" % error)
        return report

    try:
        data = collect(root, raw)
        width, height = check_canvas(report, root, data)
        check_type(report, data)
        check_palette(report, data, palette, height)
        check_strokes(report, data)
        check_corners(report, data)
        check_text(report, data)
        check_title(report, data, height)
        check_effects(report, data)
        check_provenance(report, data)
        check_arrowheads(report, data)
        check_paint_order(report, data)
    except Exception as error:
        report.fail("LINTER", "%s while linting %s; the file may use SVG syntax the linter "
                              "cannot read" % (error.__class__.__name__, path))
    return report


# --- output -----------------------------------------------------------------


def format_report(report):
    lines = ["", "=== %s ===" % report.path]
    facts = report.facts
    if "viewBox" in facts:
        lines.append("  canvas    viewBox %s" % facts["viewBox"])
    if "distinct_font_sizes" in facts:
        lines.append("  type      %d sizes: %s | weights: %s"
                     % (facts["distinct_font_sizes"],
                        ", ".join("%g" % s for s in facts["font_sizes"]) or "-",
                        ", ".join(facts["font_weights"]) or "-"))
    if "distinct_colors" in facts:
        lines.append("  colour    %d colours, %d off-palette | hues: %s | saturated area ~%.0f%%"
                     % (facts["distinct_colors"], len(facts["off_palette"]),
                        ", ".join(facts["hues"]) or "none",
                        facts["saturated_area_share"] * 100))
    if "stroke_widths" in facts:
        lines.append("  geometry  stroke-widths %s | radii %s | stadium %d"
                     % (", ".join("%g" % w for w in facts["stroke_widths"]) or "-",
                        ", ".join("%g" % r for r in facts["corner_radii"]) or "sharp",
                        facts["stadium_rects"]))
    if "text_nodes" in facts:
        lines.append("  text      %d nodes, %d words"
                     % (facts["text_nodes"], facts["word_count"]))

    if not report.checks:
        lines.append("  PASS      no findings")
        return "\n".join(lines)

    for check in sorted(report.checks, key=lambda c: (c["level"] != "fail", c["code"])):
        lines.append("  [%s] %-16s %s"
                     % ("FAIL" if check["level"] == "fail" else "warn",
                        check["code"], check["message"]))
    lines.append("  %s      %d fail, %d warn"
                 % ("FAIL" if report.fails else "PASS", len(report.fails), len(report.warns)))
    return "\n".join(lines)


def collect_files(args):
    files = list(args.files)
    if args.dir:
        for base, _, names in os.walk(args.dir):
            files += sorted(os.path.join(base, n) for n in names if n.lower().endswith(".svg"))
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="*", help="SVG files to lint")
    parser.add_argument("--dir", help="lint every *.svg under this folder, recursively")
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument("--quiet", action="store_true", help="one summary line per file")
    parser.add_argument("--theme-css", default=default_theme_css(),
                        help="theme stylesheet whose :root --color-* values join the palette")
    args = parser.parse_args()

    files = collect_files(args)
    if not files:
        parser.error("give at least one .svg or --dir")

    palette = dict(TOKEN_COLORS)
    palette.update(load_theme_palette(args.theme_css))

    reports = [analyze(path, palette) for path in files]
    failed = sum(1 for r in reports if r.fails)

    if args.json:
        print(json.dumps([r.as_dict() for r in reports], indent=1, ensure_ascii=False))
    elif args.quiet:
        for report in reports:
            print("%-4s %-3d fail %-3d warn  %s"
                  % ("FAIL" if report.fails else "PASS",
                     len(report.fails), len(report.warns), report.path))
        print("\n%d files, %d failing" % (len(reports), failed))
    else:
        for report in reports:
            print(format_report(report))
        print("\n--- %d files, %d failing ---\n" % (len(reports), failed))

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
