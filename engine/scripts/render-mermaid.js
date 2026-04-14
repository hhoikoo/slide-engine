#!/usr/bin/env node
'use strict'

// render-mermaid.js -- render ```mermaid blocks in slides.md to SVG images.
//
// Scans the assembled slides.md for mermaid code blocks, renders each to SVG
// via mmdc (mermaid-cli), and replaces the block with an image reference.
//
// Usage: node render-mermaid.js <presentation-dir>
//
// Requires: mmdc (from @mermaid-js/mermaid-cli). Skips gracefully if not found.

const fs = require('fs')
const path = require('path')
const { execSync, execFileSync } = require('child_process')

const presDir = process.argv[2]
if (!presDir) {
  console.error('Usage: render-mermaid.js <presentation-dir>')
  process.exit(1)
}

const slidesPath = path.join(presDir, 'slides.md')
const outputDir = path.join(presDir, 'images', 'generated')

if (!fs.existsSync(slidesPath)) {
  process.exit(0)
}

const slides = fs.readFileSync(slidesPath, 'utf-8')
const mermaidRe = /```mermaid\n([\s\S]*?)\n```/g

if (!mermaidRe.test(slides)) {
  process.exit(0)
}
mermaidRe.lastIndex = 0

// Find mmdc
function findMmdc() {
  try {
    execSync('mmdc --version', { stdio: 'ignore' })
    return 'mmdc'
  } catch {}
  try {
    execSync('npx --no-install mmdc --version', { stdio: 'ignore' })
    return 'npx --no-install mmdc'
  } catch {}
  return null
}

const mmdc = findMmdc()
if (!mmdc) {
  console.error('render-mermaid: mmdc not found (install @mermaid-js/mermaid-cli). Skipping.')
  process.exit(0)
}

fs.mkdirSync(outputDir, { recursive: true })

let counter = 0
const result = slides.replace(mermaidRe, (_, content) => {
  counter++
  const svgFile = `mermaid-${counter}.svg`
  const svgPath = path.join(outputDir, svgFile)
  const tmpInput = path.join(outputDir, `.mermaid-tmp-${counter}.mmd`)

  fs.writeFileSync(tmpInput, content, 'utf-8')
  try {
    execSync(`${mmdc} -i "${tmpInput}" -o "${svgPath}" --quiet`, { stdio: 'ignore' })
    console.log(`render-mermaid: rendered ${svgFile}`)
  } catch (err) {
    console.error(`render-mermaid: failed to render block ${counter}, leaving as-is`)
    fs.unlinkSync(tmpInput)
    return '```mermaid\n' + content + '\n```'
  }
  fs.unlinkSync(tmpInput)
  return `![](images/generated/${svgFile})`
})

fs.writeFileSync(slidesPath, result, 'utf-8')
