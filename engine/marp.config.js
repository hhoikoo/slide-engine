"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cjkFriendlyMod = require("markdown-it-cjk-friendly");
const cjkFriendly = cjkFriendlyMod.default || cjkFriendlyMod;

// Marp CLI engine extension
//
// 1. Image path resolution: converts relative paths in markdown images to absolute paths.
//    Images display correctly even when HTML output is generated in output/.
//
// 2. Progress bar: injects .progress-bar into <section> elements after render().
//    Uses inline style without runtime JS, works identically in PDF/HTML.
//
// 3. Auto-shrink: auto-scales slide content via CSS zoom when it overflows section height.
//    - Skips title, divider, no-shrink class slides (all other layouts supported)
//    - Applies zoom to direct children, preserving two-col CSS child selectors
//    - Detects both section-level overflow and grid cell internal overflow
//    - Ignores sub-4px overflow (rendering rounding errors)
//    - Skips overflow: hidden/auto children from internal overflow detection
//    - Binary search for optimal scale to prevent excessive shrinking
//    - Minimum 65% (MIN_SCALE)
//    - Runs after font loading for accurate height measurement
//
// 4. SVG inlining: converts <img src="*.svg"> to inline <svg>,
//    with viewBox/width/height normalization, style scoping, and ID scoping.
//    Processed at engine level so it applies to both PDF/HTML builds.
//
// 5. Theme asset inlining (HTML post-processing):
//    CSS url() referenced theme images are injected by Marp CLI after engine render,
//    so scripts/marp-postprocess.js post-processes the final HTML file.
//    Automatically called after build in the Makefile html target.

/** MIME type mapping */
const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

/** Theme assets directory -- resolved from THEME_DIR env var or fallback */
const THEME_DIR = process.env.THEME_DIR
  || path.resolve(__dirname, "../themes/bai-flat");
const THEME_ASSETS_DIR = path.join(THEME_DIR, "assets");

/**
 * Resolves markdown image paths to absolute paths.
 * - "/assets/..." -> theme assets directory
 * - relative paths -> resolved against source markdown file directory
 * Handles URL-encoded Korean filenames.
 *
 * @param {string} html  rendered HTML
 * @param {string} srcDir  source markdown file directory (absolute path)
 * @returns {string}
 */
function resolveImagePaths(html, srcDir) {
  if (!srcDir) return html;
  return html.replace(
    /(<img\s[^>]*\bsrc=")([^"]+)(")/gi,
    (match, prefix, src, suffix) => {
      // skip data URIs and external URLs
      if (src.startsWith("data:") || src.includes("://")) {
        return match;
      }
      const decoded = decodeURIComponent(src);
      // /assets/... -> theme assets directory
      if (decoded.startsWith("/assets/")) {
        const absPath = path.join(
          THEME_ASSETS_DIR,
          decoded.slice("/assets/".length),
        );
        if (!fs.existsSync(absPath)) return match;
        return prefix + absPath + suffix;
      }
      // skip other absolute paths
      if (src.startsWith("/")) {
        return match;
      }
      // relative path -> absolute path relative to source file
      const absPath = path.resolve(srcDir, decoded);
      if (!fs.existsSync(absPath)) return match;
      return prefix + absPath + suffix;
    },
  );
}

/**
 * Finds <section> elements in Marp-rendered HTML and injects
 * progress bar HTML at the end of each section.
 * @param {string} html
 * @returns {string}
 */
function injectProgressBars(html) {
  const sectionRe = /(<section\b[^>]*>)([\s\S]*?)(<\/section>)/g;
  const allMatches = [...html.matchAll(sectionRe)];
  const total = allMatches.length;
  if (total === 0) return html;

  let result = "";
  let prevIndex = 0;
  for (let i = 0; i < allMatches.length; i++) {
    const m = allMatches[i];
    const pct = (((i + 1) / total) * 100).toFixed(2);
    const progressHtml = `<div class="progress-track"><div class="progress-bar" style="width:${pct}%"></div></div>`;
    result += html.slice(prevIndex, m.index);
    result += m[1] + m[2] + progressHtml + m[3];
    prevIndex = m.index + m[0].length;
  }
  result += html.slice(prevIndex);
  return result;
}

/**
 * Injects auto-scale script for slide content overflow.
 *
 * Applies CSS zoom to direct child elements individually.
 * No wrapper div is created, so section.two-col > h1 CSS child selectors are preserved.
 *
 * Overflow detection (4px threshold):
 *  - section.scrollHeight > clientHeight + 4px: normal slides
 *  - child.scrollHeight > child.clientHeight + 4px: grid cell internal overflow
 *    (e.g., two-col 1fr rows where section height is fixed but cell content overflows)
 *    Skips children with overflow: hidden/auto/scroll (self-handling)
 *
 * Disable: <!-- _class: no-shrink -->
 */
function injectAutoScaleScript(html) {
  const script = `<script>
(function () {
  'use strict';
  var MIN_SCALE = 0.65;
  var OVERFLOW_THRESHOLD = 4; // px -- ignore overflow below this (rendering rounding)
  var SKIP_CLASSES = ['title', 'divider', 'no-shrink'];

  function getChildren(section) {
    var progressTrack = section.querySelector('.progress-track');
    return Array.from(section.children).filter(function (el) {
      if (el === progressTrack) return false;
      if (el.classList.contains('image')) return false;
      if (getComputedStyle(el).position === 'absolute') return false;
      return true;
    });
  }

  function getSectionOverflow(section) {
    return section.scrollHeight - section.clientHeight;
  }

  function getChildOverflow(children) {
    var maxOverflow = 0;
    children.forEach(function (el) {
      if (el.clientHeight > 0) {
        var overflow = el.scrollHeight - el.clientHeight;
        var ov = getComputedStyle(el).overflow;
        if (ov === 'hidden' || ov === 'auto' || ov === 'scroll') return;
        if (overflow > maxOverflow) maxOverflow = overflow;
      }
    });
    return maxOverflow;
  }

  function isOverflowing(section, children) {
    if (getSectionOverflow(section) > OVERFLOW_THRESHOLD) return true;
    return getChildOverflow(children) > OVERFLOW_THRESHOLD;
  }

  function computeInitialScale(section, children) {
    var sectionOverflow = getSectionOverflow(section);
    if (sectionOverflow > OVERFLOW_THRESHOLD) {
      var style = window.getComputedStyle(section);
      var pt = parseFloat(style.paddingTop) || 0;
      var pb = parseFloat(style.paddingBottom) || 0;
      var availH = section.clientHeight - pt - pb;
      var contentH = section.scrollHeight - pt - pb;
      return Math.max(availH / contentH, MIN_SCALE);
    }
    var ratio = children.reduce(function (min, el) {
      var ov = getComputedStyle(el).overflow;
      if (ov === 'hidden' || ov === 'auto' || ov === 'scroll') return min;
      if (el.clientHeight > 0 && el.scrollHeight - el.clientHeight > OVERFLOW_THRESHOLD) {
        return Math.min(min, el.clientHeight / el.scrollHeight);
      }
      return min;
    }, 1);
    return Math.max(ratio, MIN_SCALE);
  }

  function applyZoom(children, scale) {
    children.forEach(function (child) {
      child.style.zoom = scale.toFixed(4);
    });
  }

  function getSideBySideTextDiv(section) {
    if (!section.classList.contains('side-by-side')) return null;
    var divs = Array.from(section.children).filter(function (el) {
      return el.tagName === 'DIV' && !el.classList.contains('image')
        && !el.classList.contains('progress-track')
        && getComputedStyle(el).position !== 'absolute';
    });
    return divs.length === 1 ? divs[0] : null;
  }

  function scaleSection(section) {
    var textDiv = getSideBySideTextDiv(section);
    if (textDiv) {
      var targets = Array.from(textDiv.children);
      if (targets.length === 0) return;
      if (textDiv.scrollHeight - textDiv.clientHeight <= OVERFLOW_THRESHOLD) return;

      var scale = Math.max(textDiv.clientHeight / textDiv.scrollHeight, MIN_SCALE);
      applyZoom(targets, scale);

      var lo = scale;
      var hi = 1.0;
      for (var i = 0; i < 8; i++) {
        var mid = (lo + hi) / 2;
        if (hi - lo < 0.005) break;
        applyZoom(targets, mid);
        if (textDiv.scrollHeight - textDiv.clientHeight > OVERFLOW_THRESHOLD) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      applyZoom(targets, lo);
      return;
    }

    var children = getChildren(section);
    if (children.length === 0) return;
    if (!isOverflowing(section, children)) return;

    var scale = computeInitialScale(section, children);
    applyZoom(children, scale);

    var lo = scale;
    var hi = 1.0;
    for (var i = 0; i < 8; i++) {
      var mid = (lo + hi) / 2;
      if (hi - lo < 0.005) break;
      applyZoom(children, mid);
      if (isOverflowing(section, children)) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    applyZoom(children, lo);
  }

  function run() {
    document.querySelectorAll('section').forEach(function (section) {
      if (SKIP_CLASSES.some(function (cls) { return section.classList.contains(cls); })) return;
      scaleSection(section);
    });
  }

  function ready(fn) {
    var exec = (document.fonts && document.fonts.ready)
      ? function () { document.fonts.ready.then(fn); }
      : fn;
    if (document.readyState === 'complete') {
      exec();
    } else {
      window.addEventListener('load', exec);
    }
  }

  ready(run);
})();
</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", script + "\n</body>");
  }
  return html + "\n" + script;
}

/**
 * Normalizes inline SVG size attributes.
 * - viewBox missing but width/height present -> add viewBox
 * - width/height missing but viewBox present -> add width/height from viewBox
 * Ensures CSS max-width/max-height scaling works correctly.
 */
function normalizeSvgDimensions(svgContent) {
  const svgTagMatch = svgContent.match(/^(<svg\s)([^>]*)(>)/);
  if (!svgTagMatch) return svgContent;
  const attrs = svgTagMatch[2];
  const hasViewBox = /viewBox\s*=/i.test(attrs);
  const wMatch = attrs.match(/\bwidth="(\d+(?:\.\d+)?)"/);
  const hMatch = attrs.match(/\bheight="(\d+(?:\.\d+)?)"/);
  const hasNumericSize = wMatch && hMatch;

  if (!hasViewBox && hasNumericSize) {
    const viewBox = `viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`;
    return svgContent.replace(/^<svg\s/, `<svg ${viewBox} `);
  }

  if (hasViewBox && !hasNumericSize) {
    const vbMatch = attrs.match(
      /viewBox="\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/,
    );
    if (vbMatch) {
      svgContent = svgContent.replace(/(<svg\s[^>]*?)\bwidth="[^"]*"/, "$1");
      svgContent = svgContent.replace(/(<svg\s[^>]*?)\bheight="[^"]*"/, "$1");
      return svgContent.replace(
        /^<svg\s/,
        `<svg width="${vbMatch[1]}" height="${vbMatch[2]}" `,
      );
    }
  }

  return svgContent;
}

/**
 * Scopes inline SVG <style> class names with a unique prefix
 * to prevent style collisions between multiple SVGs.
 */
function scopeSvgStyles(svgContent) {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let allStyleContent = "";
  let hasStyles = false;
  svgContent.replace(styleRegex, (_m, content) => {
    hasStyles = true;
    allStyleContent += content;
  });
  if (!hasStyles) return svgContent;

  const prefix = `_${crypto.randomBytes(3).toString("hex")}_`;

  const classNames = [];
  const classRegex = /\.([a-zA-Z_][\w-]*)/g;
  let m;
  while ((m = classRegex.exec(allStyleContent)) !== null) {
    if (!classNames.includes(m[1])) classNames.push(m[1]);
  }
  if (classNames.length === 0) return svgContent;

  classNames.sort((a, b) => b.length - a.length);

  for (const cls of classNames) {
    const escaped = cls.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    svgContent = svgContent.replace(
      new RegExp(`\\.${escaped}(?=[^\\w-])`, "g"),
      `.${prefix}${cls}`,
    );
    svgContent = svgContent.replace(
      new RegExp(`(class="[^"]*?)\\b${escaped}\\b([^"]*?")`, "g"),
      `$1${prefix}${cls}$2`,
    );
  }

  return svgContent;
}

/**
 * Scopes inline SVG IDs and their references (xlink:href, url(), href)
 * with a unique prefix to prevent ID collisions between multiple SVGs.
 */
function scopeSvgIds(svgContent) {
  const idRegex = /\bid="([^"]+)"/g;
  const ids = [];
  let m;
  while ((m = idRegex.exec(svgContent)) !== null) {
    ids.push(m[1]);
  }
  if (ids.length === 0) return svgContent;

  const prefix = `_${crypto.randomBytes(3).toString("hex")}_`;

  ids.sort((a, b) => b.length - a.length);

  for (const id of ids) {
    const escaped = id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    svgContent = svgContent.replace(
      new RegExp(`\\bid="${escaped}"`, "g"),
      `id="${prefix}${id}"`,
    );
    svgContent = svgContent.replace(
      new RegExp(`xlink:href="#${escaped}"`, "g"),
      `xlink:href="#${prefix}${id}"`,
    );
    svgContent = svgContent.replace(
      new RegExp(`(\\bhref=")#${escaped}"`, "g"),
      `$1#${prefix}${id}"`,
    );
    svgContent = svgContent.replace(
      new RegExp(`url\\(#${escaped}\\)`, "g"),
      `url(#${prefix}${id})`,
    );
  }

  return svgContent;
}

/**
 * Converts <img src="*.svg"> to inline <svg> elements.
 * Removes external file dependency and applies viewBox/width/height normalization,
 * style scoping, and ID scoping.
 *
 * Must be called after resolveImagePaths() (requires absolute paths).
 */
function inlineSvgImages(html) {
  return html.replace(
    /<img\s+([^>]*?)src="([^"]+\.svg)"([^>]*?)\/?>/gi,
    (match, before, src, after) => {
      if (src.startsWith("data:") || src.includes("://")) return match;
      if (before.includes('class="emoji"') || after.includes('class="emoji"'))
        return match;
      const filePath = decodeURIComponent(src);
      if (!fs.existsSync(filePath)) return match;
      let svgContent = fs.readFileSync(filePath, "utf8");
      svgContent = svgContent.replace(/<\?xml[^?]*\?>\s*/gi, "");
      svgContent = svgContent.replace(/<!DOCTYPE[^>]*>\s*/gi, "");
      svgContent = normalizeSvgDimensions(svgContent);
      svgContent = scopeSvgStyles(svgContent);
      svgContent = scopeSvgIds(svgContent);
      const altMatch = (before + after).match(/alt="([^"]*)"/);
      if (altMatch) {
        svgContent = svgContent.replace(
          /^<svg/,
          `<svg role="img" aria-label="${altMatch[1]}"`,
        );
      }
      const svgSizeStyle =
        "max-width: 100%; max-height: 100%; height: auto;";

      const styleMatch = (before + after).match(/style="([^"]*)"/);
      const mergedStyle = styleMatch
        ? `${svgSizeStyle} ${styleMatch[1]}`
        : svgSizeStyle;
      svgContent = svgContent.replace(
        /^<svg/,
        `<svg style="${mergedStyle}"`,
      );
      return svgContent;
    },
  );
}

/**
 * Extracts source markdown file path from CLI arguments.
 * @returns {string|null}
 */
function findSourceFile() {
  const args = process.argv.slice(2);
  for (let i = args.length - 1; i >= 0; i--) {
    const arg = args[i];
    if (!arg.startsWith("-") && /\.md$/i.test(arg)) {
      return path.resolve(arg);
    }
  }
  return null;
}

module.exports = {
  engine: ({ marp }) => {
    marp.use(cjkFriendly);

    const srcFile = findSourceFile();
    const srcDir = srcFile ? path.dirname(srcFile) : null;

    // Disable Marpit fragment plugin: no sequential list item appearance
    marp.markdown.core.ruler.disable("marpit_fragment");

    const origRender = marp.render.bind(marp);
    marp.render = (markdown, opts) => {
      const result = origRender(markdown, opts);
      result.html = resolveImagePaths(result.html, srcDir);
      result.html = inlineSvgImages(result.html);
      result.html = injectProgressBars(result.html);
      result.html = injectAutoScaleScript(result.html);
      return result;
    };
    return marp;
  },
};
