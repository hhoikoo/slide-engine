#!/usr/bin/env node
'use strict'

/**
 * Mock projection script
 *
 * Projects an .excalidraw scene down to the keys that carry meaning.
 *
 *   node engine/scripts/mock-project.js <file.excalidraw>            # readable form
 *   node engine/scripts/mock-project.js <file.excalidraw> --spec     # recompilable spec
 *   node engine/scripts/mock-project.js <file.excalidraw> --payload  # framed for /diagram
 *
 * Excalidraw rewrites version, versionNonce and updated on every element it
 * touches, so a raw diff of a hand-edit is mostly churn. Projecting first makes
 * a mock diffable, cheap to read, and usable as a figure-authoring payload
 * without spending an image on it.
 *
 * --spec emits a spec that mock-compile.js can recompile. That round trip is
 * what makes AI edits safe: re-derive the spec from the CURRENT file, change
 * the spec, recompile, and every binding is regenerated. Editing coordinates in
 * the .excalidraw directly leaves bound labels and arrows behind.
 */

const fs = require('fs')

const BOX_TYPES = ['rectangle', 'ellipse', 'diamond']

const args = process.argv.slice(2)
const file = args.find((a) => !a.startsWith('--'))
const flags = new Set(args.filter((a) => a.startsWith('--')))

if (!file) {
  console.error('usage: mock-project.js <file.excalidraw> [--spec | --payload]')
  process.exit(2)
}

let scene
try {
  scene = JSON.parse(fs.readFileSync(file, 'utf-8'))
} catch (e) {
  console.error(`mock-project: cannot read ${file}: ${e.message}`)
  process.exit(1)
}

const elements = (scene.elements || []).filter((e) => !e.isDeleted)
const round = (v) => Math.round(v || 0)

// Excalidraw gives anything drawn by hand a random id like `6ndbZEkbnh9-nwdJ14Wyx`,
// which carries nothing a reader or a figure author can use. Rename those to
// readable ones, and carry the map through arrow bindings so nothing dangles.
const READABLE = /^[a-z][a-z0-9_]*$/
const rename = new Map()
const counters = {}
for (const e of elements) {
  if (e.type === 'frame' || READABLE.test(e.id || '')) continue
  if (e.type === 'text' && e.containerId) continue
  const stem =
    e.type === 'arrow' ? 'arrow' : e.strokeStyle === 'dotted' ? 'note' : e.strokeStyle === 'dashed' ? 'brief' : 'box'
  counters[stem] = (counters[stem] || 0) + 1
  rename.set(e.id, `${stem}${counters[stem]}`)
}
const idOf = (id) => rename.get(id) || id

// A bound label is reported on its container, never on its own.
const labelFor = new Map()
for (const e of elements) {
  if (e.type === 'text' && e.containerId) {
    labelFor.set(e.containerId, e.originalText || e.text)
  }
}

const frame = elements.find((e) => e.type === 'frame')
const boxes = elements.filter((e) => BOX_TYPES.includes(e.type))
const arrows = elements.filter((e) => e.type === 'arrow')
const freeLabels = elements.filter((e) => e.type === 'text' && !e.containerId)

// A note the author phrased as a question has no answerer inside an autonomous
// run, and a hedged one can quietly instruct the agent to contradict its own
// goal. Split those out so the caller escalates instead of guessing.
// Three shapes: a question mark, a request for a confirmation the agent cannot
// get, or a hedge that leaves the decision open.
const NEEDS_HUMAN =
  /\b(confirm|verify|check with|ask|decide|tbd|unsure|not sure|maybe|perhaps|possibly|consider|either way|or should|revisit)\b/i
const isQuestion = (t) => {
  const s = String(t || '').trim()
  return /\?\s*$/.test(s) || NEEDS_HUMAN.test(s)
}
// Both note surfaces: a dotted box, and a free-floating label, which belongs to
// no stroke class and is therefore also an author note.
const questions = [
  ...boxes.filter((e) => e.strokeStyle === 'dotted').map((e) => labelFor.get(e.id)),
  ...freeLabels.map((e) => e.originalText || e.text),
].filter(isQuestion)

// An element outside the frame silently widens the export and changes the
// figure's aspect ratio.
if (frame) {
  for (const e of [...boxes, ...arrows, ...freeLabels]) {
    if (
      e.x < frame.x ||
      e.y < frame.y ||
      e.x + (e.width || 0) > frame.x + frame.width ||
      e.y + (e.height || 0) > frame.y + frame.height
    ) {
      console.error(
        `mock-project: warning: ${idOf(e.id)} lies outside frame "${frame.name}"; ` +
          `the exported SVG will not match the frame's aspect ratio`
      )
    }
  }
}

// ---- --spec: a recompilable spec -------------------------------------------

if (flags.has('--spec')) {
  const out = []
  if (frame) {
    out.push(`name: ${frame.name}`)
    out.push(`canvas: [${round(frame.width)}, ${round(frame.height)}]`)
  }

  if (boxes.length) {
    out.push('boxes:')
    for (const e of boxes) {
      out.push(`  - id: ${idOf(e.id)}`)
      out.push(`    at: [${round(e.x)}, ${round(e.y)}]`)
      out.push(`    size: [${round(e.width)}, ${round(e.height)}]`)
      out.push(`    stroke: ${e.strokeStyle}`)
      if (labelFor.has(e.id)) {
        out.push(`    label: ${JSON.stringify(labelFor.get(e.id))}`)
      }
    }
  }

  const bound = arrows.filter((e) => e.startBinding && e.endBinding)
  if (bound.length) {
    out.push('arrows:')
    for (const e of bound) {
      out.push(`  - from: ${idOf(e.startBinding.elementId)}`)
      out.push(`    to: ${idOf(e.endBinding.elementId)}`)
    }
  }
  if (bound.length !== arrows.length) {
    console.error(
      `mock-project: warning: ${arrows.length - bound.length} unbound arrow(s) dropped from the spec`
    )
  }

  if (freeLabels.length) {
    out.push('labels:')
    for (const e of freeLabels) {
      out.push(`  - at: [${round(e.x)}, ${round(e.y)}]`)
      out.push(`    text: ${JSON.stringify(e.originalText || e.text)}`)
    }
  }

  console.log(out.join('\n'))
  process.exit(0)
}

// ---- readable form, sorted so diffs are stable ------------------------------

const lines = []

if (frame) lines.push(`canvas ${round(frame.width)}x${round(frame.height)} "${frame.name}"`)

for (const e of boxes) {
  const label = labelFor.get(e.id)
  lines.push(
    `${e.strokeStyle} ${idOf(e.id)}: ${round(e.x)},${round(e.y)} ` +
      `${round(e.width)}x${round(e.height)}` +
      (label ? ` | ${JSON.stringify(label)}` : '')
  )
}

for (const e of arrows) {
  const from = e.startBinding ? idOf(e.startBinding.elementId) : 'free'
  const to = e.endBinding ? idOf(e.endBinding.elementId) : 'free'
  lines.push(`arrow: ${from} -> ${to}`)
}

// A free-floating label belongs to no stroke class, so it was ambiguous whether
// it should be drawn. It is an author note.
for (const e of freeLabels) {
  lines.push(
    `note (free label, never drawn): ${round(e.x)},${round(e.y)} | ` +
      JSON.stringify(e.originalText || e.text)
  )
}

const body = lines.sort().join('\n')

if (flags.has('--payload')) {
  // Every line here answers a question a figure agent actually got wrong or had
  // to guess at on the first real run.
  console.log('MOCK SPEC.')
  console.log('- Solid binds POSITION and relative order, not extent. Grow a region if the real')
  console.log('  component needs more room than the sketch allots.')
  console.log('- Dashed is a brief: read it, pick from the component library, draw the REAL')
  console.log('  object. Do not trace the sketch.')
  console.log('- Dotted is an author note: read it and act on it, never draw it.')
  console.log('- A free-floating label belongs to no stroke class, so it is an author note too.')
  console.log('- Rescale all coordinates to the house canvas in tokens.md. The mock canvas is a')
  console.log('  proportion, not a viewBox.')
  console.log('- Label text is a brief, not binding copy. Rewrite it into house register.')
  if (questions.length) {
    console.log('')
    console.log('UNRESOLVED, RAISE TO THE USER. Do not guess and do not silently act on these:')
    for (const q of questions) console.log(`- ${q}`)
  }
  console.log('')
  console.log(body)
} else {
  console.log(body)
}
