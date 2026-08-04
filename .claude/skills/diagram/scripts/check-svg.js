#!/usr/bin/env node
/*
 * check-svg.js -- geometric self-check for hand-authored SVG diagrams.
 *
 * Loads the SVG *inlined into a page DOM* (the same way engine/marp.config.js
 * inlines it), lets Chrome do real text layout, then measures every text node
 * with getBoundingClientRect and reports:
 *
 *   OUT_OF_VIEWBOX  error   element extends past the SVG viewport
 *   TEXT_OVERFLOW   error   text wider/taller than the shape that contains it
 *   OCCLUDED_TEXT   error   text painted before an opaque shape that covers it
 *   FO_OVERFLOW     error   foreignObject content taller than its box
 *   TEXT_COLLIDE    warn    two text nodes overlap each other
 *   TINY_TEXT       warn    computed font-size below --min-font
 *   FONT_FALLBACK   warn    the first family in the stack did not resolve
 *
 * The @font-face block from the theme is injected into the page, so a family
 * the theme bundles resolves the same way on any machine. A FONT_FALLBACK
 * warning therefore means the stack names something neither bundled nor
 * installed, not merely something this particular machine happens to lack.
 * THEME_DIR overrides which theme is read.
 *
 * Requires the repo's bundled puppeteer (node_modules/puppeteer). Set
 * PUPPETEER_PATH to override the lookup.
 *
 * Usage:
 *   node check-svg.js <file.svg> [more.svg ...] [--min-font 11] [--pad 4]
 *                     [--json] [--css <deck.css>] [--png <out.png|dir>]
 *
 * Exit: 0 clean, 1 at least one error-severity finding, 2 bad usage or crash.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULTS = { minFont: 11, pad: 4, fallbackWidth: 1000, fallbackHeight: 600 };
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const THEME_DIR = process.env.THEME_DIR || path.join(REPO_ROOT, 'themes', 'bai-flat');

/**
 * Lifts the @font-face block out of the theme so a diagram is measured against
 * the bundled files rather than whatever the machine happens to have installed.
 * url() is rewritten absolute exactly as engine/scripts/merge-theme.js does for
 * the build, because a relative path has nothing to resolve against here.
 */
function themeFontFaces(themeDir) {
  const themeCss = path.join(themeDir, 'theme.css');
  let css;
  try {
    css = fs.readFileSync(themeCss, 'utf8');
  } catch (e) {
    console.error(`check-svg: cannot read ${themeCss} (${e.message}); ` +
      'FONT_FALLBACK will reflect system fonts, not the bundled ones');
    return '';
  }
  const blocks = css.match(/@font-face\s*\{[^}]*\}/gi) || [];
  if (!blocks.length) {
    console.error(`check-svg: no @font-face in ${themeCss}; ` +
      'FONT_FALLBACK will reflect system fonts, not the bundled ones');
    return '';
  }
  return blocks
    .map(block => block.replace(/url\("([^"]+)"\)/g, (match, target) => {
      if (target.startsWith('data:') || target.startsWith('/') || target.includes('://')) return match;
      return `url("file://${path.resolve(themeDir, target)}")`;
    }))
    .join('');
}

function resolvePuppeteer() {
  const tried = [];
  const fromEnv = process.env.PUPPETEER_PATH;
  if (fromEnv) {
    tried.push(fromEnv);
    try { return require(fromEnv); } catch (e) { /* fall through to the search */ }
  }
  for (const start of [__dirname, process.cwd()]) {
    let dir = start;
    for (;;) {
      const candidate = path.join(dir, 'node_modules', 'puppeteer');
      if (fs.existsSync(candidate)) {
        tried.push(candidate);
        try { return require(candidate); } catch (e) { /* keep walking */ }
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  tried.push('puppeteer (resolver paths)');
  try { return require('puppeteer'); } catch (e) { /* reported below */ }
  throw new Error(`puppeteer not found. Looked in:\n  ${tried.join('\n  ')}\n` +
    'Run `npm install` at the repo root or set PUPPETEER_PATH.');
}

function parseArgs(argv) {
  const opts = { ...DEFAULTS, json: false, css: null, png: null, files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--min-font') opts.minFont = parseFloat(argv[++i]);
    else if (a === '--pad') opts.pad = parseFloat(argv[++i]);
    else if (a === '--json') opts.json = true;
    else if (a === '--css') opts.css = argv[++i];
    else if (a === '--png') opts.png = argv[++i];
    else if (a.startsWith('--')) throw new Error(`unknown option ${a}`);
    else opts.files.push(a);
  }
  if (!opts.files.length) throw new Error('give at least one .svg');
  if (!(opts.minFont >= 0) || !(opts.pad >= 0)) throw new Error('--min-font and --pad take numbers');
  return opts;
}

function pngTarget(opts, file) {
  if (!opts.png) return null;
  if (opts.files.length === 1) return path.resolve(opts.png);
  const dir = path.resolve(opts.png);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${path.basename(file, path.extname(file))}.png`);
}

const PROBE = function (cfg) {
  const svg = document.querySelector('svg');
  const findings = [];
  const vb = svg.viewBox.baseVal;
  const svgRect = svg.getBoundingClientRect();
  // user-units-per-CSS-px, so every measurement can be reported in viewBox units
  const sx = vb && vb.width ? vb.width / svgRect.width : 1;
  const sy = vb && vb.height ? vb.height / svgRect.height : 1;

  const toUser = (r) => ({
    x: +((r.left - svgRect.left) * sx).toFixed(2),
    y: +((r.top - svgRect.top) * sy).toFixed(2),
    w: +(r.width * sx).toFixed(2),
    h: +(r.height * sy).toFixed(2),
    get right() { return this.x + this.w; },
    get bottom() { return this.y + this.h; },
  });

  const vbW = vb && vb.width ? vb.width : svgRect.width;
  const vbH = vb && vb.height ? vb.height : svgRect.height;
  const vpArea = vbW * vbH;

  const texts = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim());
  const fos = [...svg.querySelectorAll('foreignObject')];

  // Container candidates: filled/stroked shapes that are not the background plate.
  const SHAPES = 'rect,circle,ellipse,polygon,path';
  const containers = [...svg.querySelectorAll(SHAPES)]
    .map((el, order) => {
      const r = toUser(el.getBoundingClientRect());
      return { el, r, area: r.w * r.h, tag: el.tagName, order };
    })
    .filter(c => c.area > 0 && c.area < vpArea * 0.9);

  const desc = (el) => {
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
    return t.length > 44 ? t.slice(0, 41) + '...' : t;
  };

  // getBoundingClientRect on <text> returns the *line box* (~1.2em tall), which
  // makes every snugly-fitted label look like it overflows. Canvas
  // actualBoundingBoxAscent/Descent give the real glyph ink extents, so rebuild
  // the vertical span from the baseline for single-line labels.
  const ctx = document.createElement('canvas').getContext('2d');
  const inkVSpan = (el, cs) => {
    if (el.querySelectorAll('tspan').length > 1) return null; // multi-line: trust the layout box
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = ctx.measureText(el.textContent);
    if (!(m.actualBoundingBoxAscent >= 0) || !(m.actualBoundingBoxDescent >= 0)) return null;
    return { asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent };
  };

  const boxes = [];
  for (const t of texts) {
    const cs = getComputedStyle(t);
    const r = toUser(t.getBoundingClientRect());
    if (r.w === 0 && r.h === 0) continue;
    const fsPx = parseFloat(cs.fontSize);
    const fsUser = fsPx * sx;
    boxes.push({ el: t, r, txt: desc(t), fs: +fsUser.toFixed(2) });

    if (fsUser < cfg.minFont - 0.01) {
      findings.push({ level: 'warn', code: 'TINY_TEXT', text: desc(t),
        detail: `font-size ${fsUser.toFixed(1)} < ${cfg.minFont} user units` });
    }

    const over = [];
    if (r.x < -0.5) over.push(`left by ${(-r.x).toFixed(1)}`);
    if (r.y < -0.5) over.push(`top by ${(-r.y).toFixed(1)}`);
    if (r.right > vbW + 0.5) over.push(`right by ${(r.right - vbW).toFixed(1)}`);
    if (r.bottom > vbH + 0.5) over.push(`bottom by ${(r.bottom - vbH).toFixed(1)}`);
    if (over.length) {
      findings.push({ level: 'error', code: 'OUT_OF_VIEWBOX', text: desc(t),
        detail: `escapes viewBox ${over.join(', ')}`,
        box: `x=${r.x} y=${r.y} w=${r.w} h=${r.h}` });
    }

    // Smallest container holding either the text's centre or its anchor point.
    // Checking the anchor too catches labels that have already slid so far out
    // of their box that the centre no longer lands inside it.
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    let ax = cx, ay = cy, anchorOk = false;
    try {
      const m = t.getScreenCTM();
      if (m && t.hasAttribute('x') && t.hasAttribute('y')) {
        const p = svg.createSVGPoint();
        p.x = parseFloat(t.getAttribute('x') || 0);
        p.y = parseFloat(t.getAttribute('y') || 0);
        const q = p.matrixTransform(m);
        ax = (q.x - svgRect.left) * sx;
        ay = (q.y - svgRect.top) * sy;
        anchorOk = true;
      }
    } catch (e) { /* keep the centre as the anchor */ }
    const inside = (c, px, py) => px >= c.r.x && px <= c.r.right && py >= c.r.y && py <= c.r.bottom;
    // Only shapes that could plausibly be a label's box count as containers.
    // Rules, tick bars and thin accent strips are narrower/shorter than the
    // text they sit beside and would otherwise produce constant false alarms.
    const hits = containers
      .filter(c => c.r.h >= r.h * 1.15 && c.r.w >= r.w * 0.35)
      .filter(c => inside(c, cx, cy) || inside(c, ax, ay))
      // Equal-area candidates mean a card stack ("N of these"). The label belongs
      // to the card the viewer sees, which is the last one painted.
      .sort((a, b) => (a.area - b.area) || (b.order - a.order));
    if (hits.length) {
      const c = hits[0];
      const ink = anchorOk ? inkVSpan(t, cs) : null;
      // Real glyph top/bottom when we can get them, else the layout box with
      // a descent allowance.
      const inkTop = ink ? ay - ink.asc * sy : r.y + fsUser * 0.2;
      const inkBottom = ink ? ay + ink.desc * sy : r.bottom - fsUser * 0.05;
      const dl = c.r.x + cfg.pad - r.x;
      const dr = r.right - (c.r.right - cfg.pad);
      const dt = c.r.y + cfg.pad - inkTop;
      const db = inkBottom - (c.r.bottom - cfg.pad);
      const bad = [];
      if (dl > 0) bad.push(`left ${dl.toFixed(1)}`);
      if (dr > 0) bad.push(`right ${dr.toFixed(1)}`);
      if (dt > 0) bad.push(`top ${dt.toFixed(1)}`);
      if (db > 0) bad.push(`bottom ${db.toFixed(1)}`);
      if (bad.length) {
        findings.push({ level: 'error', code: 'TEXT_OVERFLOW', text: desc(t),
          detail: `spills out of <${c.tag}> (${c.r.w}x${c.r.h} at ${c.r.x},${c.r.y}) past pad=${cfg.pad}: ${bad.join(', ')}`,
          box: `text w=${r.w} h=${r.h}` });
      }
    }
  }

  // foreignObject: does the HTML content overflow the fixed-size box?
  for (const fo of fos) {
    const inner = fo.firstElementChild;
    if (!inner) continue;
    const foH = fo.getBBox ? fo.getBBox().height : 0;
    if (inner.scrollHeight > inner.clientHeight + 2 || inner.scrollHeight > foH + 2) {
      findings.push({ level: 'error', code: 'FO_OVERFLOW', text: desc(fo),
        detail: `foreignObject content ${inner.scrollHeight}px tall vs box ${Math.round(foH)}` });
    }
  }

  // Occlusion: text painted before an opaque shape that covers it. SVG has no
  // z-index -- document order IS paint order -- so a label emitted before its
  // container group silently disappears under it.
  const inDocOrder = [...svg.querySelectorAll('*')];
  const idx = new Map(inDocOrder.map((el, i) => [el, i]));
  const opaqueCovers = inDocOrder.filter(el => {
    if (!/^(rect|circle|ellipse|polygon|path)$/i.test(el.tagName)) return false;
    const cs = getComputedStyle(el);
    if (cs.fill === 'none' || cs.fill === '') return false;
    if (parseFloat(cs.fillOpacity) < 0.95) return false;
    if (parseFloat(cs.opacity) < 0.95) return false;
    if (/rgba\([^)]*,\s*0?\.\d+\)/.test(cs.fill)) return false;
    return true;
  }).map(el => ({ el, i: idx.get(el), r: toUser(el.getBoundingClientRect()) }))
    .filter(c => c.r.w * c.r.h < vpArea * 0.999);

  for (const b of boxes) {
    const ti = idx.get(b.el);
    const covered = opaqueCovers.find(c =>
      c.i > ti &&
      c.r.x <= b.r.x + 0.5 && c.r.y <= b.r.y + 0.5 &&
      c.r.right >= b.r.right - 0.5 && c.r.bottom >= b.r.bottom - 0.5);
    if (covered) {
      findings.push({ level: 'error', code: 'OCCLUDED_TEXT', text: b.txt,
        detail: `painted before an opaque <${covered.el.tagName}> (${covered.r.w}x${covered.r.h} at ${covered.r.x},${covered.r.y}) that fully covers it -- move the text later in document order` });
    }
  }

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i].r, b = boxes[j].r;
      const ox = Math.min(a.right, b.right) - Math.max(a.x, b.x);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y);
      if (ox > 1.5 && oy > 1.5) {
        findings.push({ level: 'warn', code: 'TEXT_COLLIDE',
          text: `${boxes[i].txt}  <->  ${boxes[j].txt}`,
          detail: `overlap ${ox.toFixed(1)}x${oy.toFixed(1)} user units` });
      }
    }
  }

  // Font resolution. document.fonts.check() lies about local system fonts
  // (returns true for anything that falls back), so measure instead: render a
  // probe string in `"Family", monospace` and in bare `monospace`. Identical
  // widths against two different generic fallbacks means Family did not resolve.
  const probeWidth = (family) => {
    const c = document.createElement('canvas').getContext('2d');
    c.font = `40px ${family}`;
    return c.measureText('MWQ@ilj0—한글가나').width;
  };
  const fontResolves = (name) => {
    if (/^(sans-serif|serif|monospace|system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|math|emoji|cursive|fantasy)$/i.test(name)) return true;
    const q = `"${name.replace(/"/g, '')}"`;
    return probeWidth(`${q}, monospace`) !== probeWidth('monospace')
        || probeWidth(`${q}, serif`) !== probeWidth('serif');
  };
  const stacks = new Set();
  for (const t of texts) stacks.add(getComputedStyle(t).fontFamily);
  for (const fo of fos) {
    const inner = fo.firstElementChild;
    if (inner) stacks.add(getComputedStyle(inner).fontFamily);
  }
  const fontReport = [];
  for (const stack of stacks) {
    const fams = stack.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    const first = fams[0];
    const ok = fontResolves(first);
    const resolvedTo = fams.find(fontResolves) || 'generic default';
    fontReport.push({ stack, first, resolved: ok, resolvedTo });
    if (!ok) {
      findings.push({ level: 'warn', code: 'FONT_FALLBACK',
        text: first, detail: `"${first}" not installed; this machine renders it as "${resolvedTo}"` });
    }
  }

  return {
    viewBox: `${vbW}x${vbH}`,
    renderedCssPx: `${svgRect.width.toFixed(0)}x${svgRect.height.toFixed(0)}`,
    textNodes: texts.length,
    foreignObjects: fos.length,
    containers: containers.length,
    fonts: fontReport,
    findings,
  };
};

async function checkFile(browser, opts, file) {
  const abs = path.resolve(file);
  let svgSrc = fs.readFileSync(abs, 'utf8')
    .replace(/<\?xml[^?]*\?>\s*/gi, '')
    .replace(/<!DOCTYPE[^>]*>\s*/gi, '');

  // Render at the SVG's natural size: the deck maps 1 user unit -> 1 CSS px.
  const vbm = svgSrc.match(/viewBox\s*=\s*"\s*[\d.+-]+\s+[\d.+-]+\s+([\d.]+)\s+([\d.]+)/i);
  const W = vbm ? Math.ceil(parseFloat(vbm[1])) : opts.fallbackWidth;
  const H = vbm ? Math.ceil(parseFloat(vbm[2])) : opts.fallbackHeight;
  svgSrc = svgSrc.replace(/^\s*<svg/i, `<svg width="${W}" height="${H}"`);

  const deckCss = opts.css ? fs.readFileSync(path.resolve(opts.css), 'utf8') : '';
  const html = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:#fff}${opts.fontFaces}${deckCss}</style>
<div id="host">${svgSrc}</div>`;

  // A file:// document is required here: a setContent page cannot fetch file://
  // font URLs, so the faces would error out and the diagram would be measured
  // against a system fallback instead of the bundled files.
  const pageFile = path.join(opts.scratchDir, 'page.html');
  fs.writeFileSync(pageFile, html);

  const page = await browser.newPage();
  try {
    await page.setViewport({ width: W + 40, height: H + 40, deviceScaleFactor: 1 });
    await page.goto(`file://${pageFile}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(PROBE, { minFont: opts.minFont, pad: opts.pad });
    result.file = abs;
    const png = pngTarget(opts, file);
    if (png) {
      await page.screenshot({ path: png });
      result.png = png;
    }
    return result;
  } finally {
    await page.close();
  }
}

function printResult(r) {
  console.log(`\n=== ${path.basename(r.file)} ===`);
  console.log(`viewBox ${r.viewBox} | rendered ${r.renderedCssPx} css px | ${r.textNodes} text, ${r.foreignObjects} foreignObject, ${r.containers} container shapes`);
  for (const fr of r.fonts) {
    console.log(`  font  ${fr.resolved ? 'OK  ' : 'MISS'} first="${fr.first}" -> "${fr.resolvedTo}"`);
  }
  if (r.png) console.log(`  png   ${r.png}`);
  if (!r.findings.length) { console.log('  no findings'); return; }
  const order = { error: 0, warn: 1 };
  r.findings.sort((a, b) => order[a.level] - order[b.level] || a.code.localeCompare(b.code));
  for (const f of r.findings) {
    console.log(`  [${f.level.toUpperCase()}] ${f.code}: "${f.text}"`);
    console.log(`          ${f.detail}${f.box ? '  (' + f.box + ')' : ''}`);
  }
}

(async () => {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`check-svg: ${e.message}`);
    console.error('usage: node check-svg.js <file.svg> [...] [--min-font N] [--pad N] [--json] [--css deck.css] [--png out.png|dir]');
    process.exit(2);
  }

  opts.fontFaces = themeFontFaces(THEME_DIR);
  opts.scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-svg.'));

  const puppeteer = resolvePuppeteer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
  });
  const results = [];
  let failed = false;
  try {
    for (const f of opts.files) {
      const r = await checkFile(browser, opts, f);
      if (r.findings.some(x => x.level === 'error')) failed = true;
      results.push(r);
    }
  } finally {
    await browser.close();
    fs.rmSync(opts.scratchDir, { recursive: true, force: true });
  }

  if (opts.json) {
    console.log(JSON.stringify(results, null, 1));
  } else {
    results.forEach(printResult);
    const errors = results.reduce((n, r) => n + r.findings.filter(f => f.level === 'error').length, 0);
    const warns = results.reduce((n, r) => n + r.findings.filter(f => f.level === 'warn').length, 0);
    console.log(`\n--- ${results.length} files, ${errors} errors, ${warns} warnings ---\n`);
  }
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(`check-svg: ${e.message}`); process.exit(2); });
