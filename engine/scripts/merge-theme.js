#!/usr/bin/env node
'use strict'

/**
 * Theme CSS merge script
 *
 * Merges base theme and local theme overrides.
 * - Resolves base theme url() relative paths to absolute paths against theme dir
 * - Resolves local theme url() relative paths against slides directory
 * - Local theme CSS custom properties override base theme declarations
 *
 * Usage:
 *   node scripts/merge-theme.js \
 *     --base <base-theme.css> \
 *     --local <local-theme.css> \
 *     --theme-dir <theme-dir> \
 *     --slides-dir <slides-dir> \
 *     --output <merged.css>
 */

const fs = require('fs')
const path = require('path')

function parseArgs() {
  const args = process.argv.slice(2)
  const result = {}
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--base': result.base = path.resolve(args[++i]); break
      case '--local': result.local = path.resolve(args[++i]); break
      case '--theme-dir': result.themeDir = path.resolve(args[++i]); break
      case '--slides-dir': result.slidesDir = path.resolve(args[++i]); break
      case '--output': result.output = path.resolve(args[++i]); break
    }
  }
  return result
}

/**
 * Resolves base theme url() relative paths to absolute paths against the theme directory.
 * Skips absolute paths, data: URIs, and protocol URLs.
 */
function resolveBaseUrls(css, themeDir) {
  return css.replace(
    /url\("([^"]+)"\)/g,
    (match, urlPath) => {
      if (urlPath.startsWith('/') || urlPath.startsWith('data:') || urlPath.includes('://')) {
        return match
      }
      return `url("${path.resolve(themeDir, urlPath)}")`
    }
  )
}

/**
 * Resolves local theme url() relative paths to absolute paths against slides directory.
 * Skips absolute paths, data: URIs, and protocol URLs.
 */
function resolveLocalUrls(css, slidesDir) {
  return css.replace(
    /url\("([^"]+)"\)/g,
    (match, urlPath) => {
      if (urlPath.startsWith('/') || urlPath.startsWith('data:') || urlPath.includes('://')) {
        return match
      }
      return `url("${path.resolve(slidesDir, urlPath)}")`
    }
  )
}

function main() {
  const opts = parseArgs()
  if (!opts.base || !opts.output || !opts.themeDir) {
    console.error('Usage: node scripts/merge-theme.js --base <css> [--local <css>] --theme-dir <dir> [--slides-dir <dir>] --output <css>')
    process.exit(1)
  }

  let baseCss = fs.readFileSync(opts.base, 'utf8')
  baseCss = resolveBaseUrls(baseCss, opts.themeDir)

  if (opts.local && fs.existsSync(opts.local)) {
    let localCss = fs.readFileSync(opts.local, 'utf8')
    if (opts.slidesDir) {
      localCss = resolveLocalUrls(localCss, opts.slidesDir)
    }
    const merged = baseCss + '\n' + localCss
    fs.writeFileSync(opts.output, merged, 'utf8')
    console.error(`[merge-theme] ${path.basename(opts.local)} merged`)
  } else {
    fs.writeFileSync(opts.output, baseCss, 'utf8')
  }
}

main()
