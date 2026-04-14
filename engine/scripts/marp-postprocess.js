#!/usr/bin/env node
'use strict'

/**
 * Marp slide HTML post-processing script
 *
 * Post-processes the final HTML output from Marp CLI:
 * 1. Inlines CSS url() referenced theme assets (images) as data URIs.
 * 2. Inlines <img src="..."> local file paths as data URIs.
 *
 * This makes built HTML files fully self-contained and portable.
 *
 * NOTE: SVG <img> -> inline <svg> conversion is handled at the engine level
 *       in marp.config.js. This script inlines raster images the engine missed.
 *
 * Usage:
 *   node scripts/marp-postprocess.js <html-file> [--theme-dir <dir>]
 *
 * --theme-dir: theme assets directory (default: themes/bai-flat)
 */

const fs = require('fs')
const path = require('path')

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

function parseArgs() {
  const args = process.argv.slice(2)
  const result = { htmlFile: null, themeDir: path.resolve(__dirname, '../../themes/bai-flat') }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--theme-dir' && args[i + 1]) {
      result.themeDir = path.resolve(args[++i])
    } else if (!args[i].startsWith('-')) {
      result.htmlFile = path.resolve(args[i])
    }
  }
  return result
}

/**
 * Inlines CSS url() referenced raster images (JPG/PNG/GIF/WebP) as data URIs.
 * SVG is inlined as data URI in CSS backgrounds.
 */
function inlineCssAssets(html, themeDir) {
  return html.replace(
    /url\("([^"]+\.(png|jpe?g|gif|svg|webp))"\)/gi,
    (match, filename) => {
      if (filename.startsWith('data:') || filename.includes('://')) return match
      const filePath = path.resolve(themeDir, filename)
      if (!fs.existsSync(filePath)) return match
      const ext = path.extname(filename).toLowerCase()
      if (ext === '.svg') {
        const svgContent = fs.readFileSync(filePath, 'utf8')
        const encoded = encodeURIComponent(svgContent)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22')
        return `url("data:image/svg+xml,${encoded}")`
      }
      const mime = MIME_TYPES[ext]
      if (!mime) return match
      const data = fs.readFileSync(filePath).toString('base64')
      return `url("data:${mime};base64,${data}")`
    }
  )
}

/**
 * Inlines <img src="..."> local file paths as data URIs.
 * Absolute-path local files only (relative -> absolute conversion already done
 * by marp.config.js). Raster images only (SVGs already inlined by engine).
 */
function inlineImgSrc(html) {
  return html.replace(
    /(<img\s[^>]*\bsrc=")([^"]+)("[^>]*\/?>)/gi,
    (match, prefix, src, suffix) => {
      if (src.startsWith('data:') || src.includes('://')) return match
      if (!src.startsWith('/')) return match
      const filePath = decodeURIComponent(src)
      if (!fs.existsSync(filePath)) return match
      const ext = path.extname(filePath).toLowerCase()
      const mime = MIME_TYPES[ext]
      if (!mime) return match
      const data = fs.readFileSync(filePath).toString('base64')
      return `${prefix}data:${mime};base64,${data}${suffix}`
    }
  )
}

function main() {
  const { htmlFile, themeDir } = parseArgs()
  if (!htmlFile) {
    console.error('Usage: node scripts/marp-postprocess.js <html-file> [--theme-dir <dir>]')
    process.exit(1)
  }
  if (!fs.existsSync(htmlFile)) {
    console.error(`File not found: ${htmlFile}`)
    process.exit(1)
  }

  let html = fs.readFileSync(htmlFile, 'utf8')
  const origLen = html.length

  html = inlineCssAssets(html, themeDir)
  html = inlineImgSrc(html)

  fs.writeFileSync(htmlFile, html, 'utf8')

  const delta = html.length - origLen
  const sign = delta >= 0 ? '+' : ''
  console.error(`[marp-postprocess] ${path.basename(htmlFile)}: ${sign}${(delta / 1024).toFixed(0)}KB (assets inlined)`)
}

main()
