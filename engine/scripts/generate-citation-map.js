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
// Idempotent, including across edits. Numbers already assigned on a previous run
// are recovered from research/citation-map.md and kept, so a citation added later
// gets the next free number instead of restarting at [1] and colliding with the
// markers already rewritten into the slides.

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

// A references slide holds this many entries before spilling onto the next one.
const REFS_PER_SLIDE = 12

const researchDocs = parseResearchDocs()
const citationMapPath = path.join(researchDir, 'citation-map.md')
const sectionFiles = fs.readdirSync(sectionsDir)
  .filter(f => f.endsWith('.md'))
  .sort()

const refSectionFile = sectionFiles.find(f => /references/i.test(f))

// A previous run rewrote its markers from [research:id] to [n], so the slides no
// longer say which research doc a number belongs to. The map is the only record.
function parseCitationMap() {
  const idToCitation = {}
  const order = []
  if (!fs.existsSync(citationMapPath)) return { idToCitation, order }

  const rows = []
  for (const line of fs.readFileSync(citationMapPath, 'utf-8').split('\n')) {
    const m = line.match(/^\|\s*\[(\d+)\]\s*\|\s*(\d+)\s*\|/)
    if (m) rows.push({ n: parseInt(m[1], 10), id: m[2] })
  }
  rows.sort((a, b) => a.n - b.n)
  for (const row of rows) {
    if (idToCitation[row.id]) continue
    idToCitation[row.id] = row.n
    order.push(row.id)
  }
  return { idToCitation, order }
}

const prior = parseCitationMap()
const idToCitation = { ...prior.idToCitation }
const citationOrder = [...prior.order]
let nextCitation = citationOrder.length
  ? Math.max(...Object.values(idToCitation)) + 1
  : 1

for (const file of sectionFiles) {
  if (refSectionFile && file === refSectionFile) continue
  const content = fs.readFileSync(path.join(sectionsDir, file), 'utf-8')
  const re = new RegExp(MARKER_RE.source, 'g')
  let match
  while ((match = re.exec(content)) !== null) {
    const id = match[1]
    if (idToCitation[id]) continue
    idToCitation[id] = nextCitation++
    citationOrder.push(id)
  }
}

if (citationOrder.length === 0) {
  console.log('No citation markers found in sections/. Nothing to do.')
  process.exit(0)
}

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
  const file = firstAppearance[String(n)]
  if (!file) {
    console.warn(`Warning: [${n}] (research:${id}) is no longer cited in any slide. `
      + 'Its number is kept so existing markers stay valid; remove the row from '
      + 'research/citation-map.md to retire it.')
  }
  mapLines.push(`| [${n}] | ${id} | ${title} | ${file || '?'} |`)
}

fs.writeFileSync(path.join(researchDir, 'citation-map.md'), mapLines.join('\n') + '\n', 'utf-8')
console.log(`Generated research/citation-map.md with ${citationOrder.length} citations`)

// Generate references section file. The references file is excluded from the
// numbering scan: counting it would push the name one higher on every run.
const sectionNums = sectionFiles
  .filter(f => f !== refSectionFile)
  .map(f => parseInt(f.match(/^(\d+)/)?.[1], 10))
  .filter(n => !isNaN(n))
const nextNum = sectionNums.length ? Math.max(...sectionNums) + 1 : 0
const refFileName = `${String(nextNum).padStart(2, '0')}-references.md`

if (refSectionFile && refSectionFile !== refFileName) {
  fs.unlinkSync(path.join(sectionsDir, refSectionFile))
  console.log(`Removed old references file: ${refSectionFile}`)
}

function entryFor(id) {
  const n = idToCitation[id]
  const doc = researchDocs[id] || {}
  const authors = doc.authors || 'Unknown'
  const title = doc.title || '(untitled)'

  let entry = `[${n}] ${authors}`
  if (doc.year) entry += ` (${doc.year})`
  entry += `. "${title}"`
  if (doc.source) entry += `. ${doc.source}`
  if (doc.url) entry += `. ${doc.url}`
  return entry
}

const slides = []
for (let i = 0; i < citationOrder.length; i += REFS_PER_SLIDE) {
  const chunk = citationOrder.slice(i, i + REFS_PER_SLIDE)
  slides.push([
    '<!-- _class: references -->',
    '',
    '## References',
    '',
    ...chunk.map(id => `- ${entryFor(id)}`),
  ].join('\n'))
}

fs.writeFileSync(
  path.join(sectionsDir, refFileName),
  slides.join('\n\n---\n\n') + '\n',
  'utf-8'
)
console.log(`Generated sections/${refFileName} (${slides.length} slide(s), `
  + `${citationOrder.length} citations)`)
