#!/usr/bin/env node
'use strict'

// generate-citation-map.js -- assign citation numbers to research references in section files.
//
// Scans sections/*.md for <sup>[research:{id}]</sup> markers, assigns [1], [2]...
// by order of first appearance, rewrites markers in-place, generates
// research/citation-map.md, and generates a references section file.
//
// Usage: node generate-citation-map.js <presentation-dir>
//
// Idempotent: running twice produces the same result.

const fs = require('fs')
const path = require('path')

const presDir = process.argv[2]
if (!presDir) {
  console.error('Usage: generate-citation-map.js <presentation-dir>')
  process.exit(1)
}

const sectionsDir = path.join(presDir, 'sections')
const researchDir = path.join(presDir, 'research')

if (!fs.existsSync(sectionsDir)) {
  console.error(`sections/ not found in ${presDir}`)
  process.exit(1)
}

// Parse research doc frontmatter to get id -> metadata mapping
function parseResearchDocs() {
  const docs = {}
  if (!fs.existsSync(researchDir)) return docs

  const files = fs.readdirSync(researchDir)
    .filter(f => f.endsWith('.md') && f !== 'citation-map.md')
    .sort()

  for (const file of files) {
    const content = fs.readFileSync(path.join(researchDir, file), 'utf-8')
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (!fmMatch) continue

    const fm = fmMatch[1]
    const id = fm.match(/^id:\s*(\d+)/m)?.[1]
    const title = fm.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1]
    const authors = fm.match(/^authors:\s*\[(.+?)\]/m)?.[1]?.replace(/"/g, '')
    const year = fm.match(/^year:\s*(\d+)/m)?.[1]
    const source = fm.match(/^source:\s*"?(.+?)"?\s*$/m)?.[1]
    const url = fm.match(/^url:\s*"?(.+?)"?\s*$/m)?.[1]

    if (id) {
      docs[id] = { title, authors, year, source, url, file }
    }
  }
  return docs
}

const MARKER_RE = /<sup>\[research:(\d+)\]<\/sup>/g

const researchDocs = parseResearchDocs()
const sectionFiles = fs.readdirSync(sectionsDir)
  .filter(f => f.endsWith('.md'))
  .sort()

const refSectionFile = sectionFiles.find(f => /references/i.test(f))

// First pass: collect research IDs in order of first appearance
const citationOrder = []
const seenIds = new Set()

for (const file of sectionFiles) {
  if (refSectionFile && file === refSectionFile) continue
  const content = fs.readFileSync(path.join(sectionsDir, file), 'utf-8')
  const re = new RegExp(MARKER_RE.source, 'g')
  let match
  while ((match = re.exec(content)) !== null) {
    const id = match[1]
    if (!seenIds.has(id)) {
      seenIds.add(id)
      citationOrder.push(id)
    }
  }
}

if (citationOrder.length === 0) {
  console.log('No citation markers found in sections/. Nothing to do.')
  process.exit(0)
}

// Build id -> citation number mapping
const idToCitation = {}
citationOrder.forEach((id, i) => {
  idToCitation[id] = i + 1
})

// Second pass: rewrite markers in section files
for (const file of sectionFiles) {
  if (refSectionFile && file === refSectionFile) continue
  const filePath = path.join(sectionsDir, file)
  const original = fs.readFileSync(filePath, 'utf-8')
  const rewritten = original.replace(MARKER_RE, (_, id) => {
    const n = idToCitation[id]
    if (n) return `<sup>[${n}]</sup>`
    return `<sup>[research:${id}]</sup>`
  })
  if (rewritten !== original) {
    fs.writeFileSync(filePath, rewritten, 'utf-8')
    console.log(`Rewrote citations in ${file}`)
  }
}

// Generate citation-map.md
const mapLines = [
  '| Citation | Research ID | Title | First appears in |',
  '|----------|------------|-------|-----------------|',
]

// Re-scan to find first appearance file after rewriting
const firstAppearance = {}
for (const file of sectionFiles) {
  if (refSectionFile && file === refSectionFile) continue
  const content = fs.readFileSync(path.join(sectionsDir, file), 'utf-8')
  const re = /<sup>\[(\d+)\]<\/sup>/g
  let match
  while ((match = re.exec(content)) !== null) {
    const n = match[1]
    if (!firstAppearance[n]) {
      firstAppearance[n] = file
    }
  }
}

for (const id of citationOrder) {
  const n = idToCitation[id]
  const doc = researchDocs[id] || {}
  const title = doc.title || '(unknown)'
  const file = firstAppearance[String(n)] || '?'
  mapLines.push(`| [${n}] | ${id} | ${title} | ${file} |`)
}

fs.writeFileSync(path.join(researchDir, 'citation-map.md'), mapLines.join('\n') + '\n', 'utf-8')
console.log(`Generated research/citation-map.md with ${citationOrder.length} citations`)

// Generate references section file
const sectionNums = sectionFiles
  .map(f => parseInt(f.match(/^(\d+)/)?.[1], 10))
  .filter(n => !isNaN(n))
const nextNum = Math.max(...sectionNums) + 1
const refFileName = `${String(nextNum).padStart(2, '0')}-references.md`

if (refSectionFile && refSectionFile !== refFileName) {
  fs.unlinkSync(path.join(sectionsDir, refSectionFile))
  console.log(`Removed old references file: ${refSectionFile}`)
}

const refLines = [
  '<!-- _class: references -->',
  '',
  '## References',
  '',
]

for (const id of citationOrder) {
  const n = idToCitation[id]
  const doc = researchDocs[id] || {}
  const authors = doc.authors || 'Unknown'
  const title = doc.title || '(untitled)'
  const source = doc.source || ''
  const year = doc.year || ''
  const url = doc.url || ''

  let entry = `[${n}] ${authors}`
  if (year) entry += ` (${year})`
  entry += `. "${title}"`
  if (source) entry += `. ${source}`
  if (url) entry += `. ${url}`

  refLines.push(`- ${entry}`)
}

fs.writeFileSync(path.join(sectionsDir, refFileName), refLines.join('\n') + '\n', 'utf-8')
console.log(`Generated sections/${refFileName}`)
