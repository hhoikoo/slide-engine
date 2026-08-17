#!/usr/bin/env node
'use strict'

/**
 * Mock compile script
 *
 * Compiles a compact mock spec into an .excalidraw scene.
 *
 *   node engine/scripts/mock-compile.js <spec.yaml> <out.excalidraw>
 *
 * The spec names only what carries meaning. Every boilerplate key, and both
 * halves of every binding (container/label, arrow/box), are generated here, so
 * a hand-written spec cannot half-break a pair.
 *
 * The spec is a write-time and edit-time projection. It is NOT committed and it
 * is NOT the source of truth: the .excalidraw file is. To change a mock that
 * already exists, re-derive its spec with `mock-project.js --spec`, edit that,
 * and recompile. Editing coordinates in the .excalidraw directly leaves bound
 * labels and arrows pointing at where things used to be.
 *
 * Author on the house canvas. `tokens.md` fixes diagrams at viewBox 1000 x H with
 * H <= 560, because at that size one SVG unit is one CSS px in the build. A mock
 * on any other canvas forces the figure author to rescale every coordinate, at
 * which point "solid is binding placement" stops meaning anything.
 *
 * Spec format:
 *
 *   name: f03                # optional; emits a frame with this label
 *   canvas: [1000, 500]      # defaults to the house canvas, [1000, 500]
 *   boxes:
 *     - id: ingress
 *       at: [60, 120]
 *       size: [180, 90]
 *       stroke: solid        # solid | dashed | dotted
 *       label: Ingress stack # optional, bound to the box
 *   arrows:
 *     - from: ingress
 *       to: spine
 *   labels:
 *     - at: [60, 40]
 *       text: f03 placement spec
 */

const fs = require('fs')
const yaml = require('js-yaml')

const STROKES = ['solid', 'dashed', 'dotted']
const SHAPES = { box: 'rectangle', ellipse: 'ellipse', diamond: 'diamond' }

const [specPath, outPath] = process.argv.slice(2)
if (!specPath || !outPath) {
  console.error('usage: mock-compile.js <spec.yaml> <out.excalidraw>')
  process.exit(2)
}

let spec
try {
  spec = yaml.load(fs.readFileSync(specPath, 'utf-8'))
} catch (e) {
  console.error(`mock-compile: cannot read ${specPath}: ${e.message}`)
  process.exit(1)
}
if (!spec || typeof spec !== 'object') {
  console.error(`mock-compile: ${specPath} is empty or not a mapping`)
  process.exit(1)
}

const die = (msg) => {
  console.error(`mock-compile: ${msg}`)
  process.exit(1)
}

// Deterministic ids and seeds. Excalidraw only needs these to be stable within
// a scene, and determinism keeps recompiles out of the diff.
let seq = 0
const nextSeed = () => ++seq * 7919

// Per-character advances in em, from tokens.md. Hangul is 0.864, not the 0.55
// a Latin-only estimate assumes, so a Korean label wrapped on character count
// runs about 60% wider than its box.
const advance = (text) => {
  let em = 0
  for (const ch of String(text)) {
    em += /[ᄀ-ᇿ㄰-㆏가-힯]/.test(ch) ? 0.88 : 0.55
  }
  return em
}

const textWidth = (text, fontSize) => advance(text) * fontSize

/**
 * Approximate Excalidraw's bound-text wrapping so the label lands where the
 * real editor would put it. Exact metrics are the editor's job; this only has
 * to be close enough that the mock reads correctly before a human opens it.
 */
function wrapLabel(text, width, fontSize) {
  const max = Math.max(fontSize, width - 16)
  const lines = []
  let line = ''
  for (const word of String(text).split(/\s+/)) {
    const candidate = line ? line + ' ' + word : word
    if (line && textWidth(candidate, fontSize) > max) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

const hasFrame = Boolean(spec.name)
const [canvasW, canvasH] = spec.canvas || [1000, 500]

// The house canvas, enforced here so a mock cannot be authored into a shape the
// figure can never take.
if (canvasH > 560) {
  die(`canvas height ${canvasH} exceeds the house cap of 560 (tokens.md)`)
}
if (canvasW !== 1000) {
  console.error(
    `mock-compile: warning: canvas width ${canvasW} is not the house width of 1000; ` +
      `every coordinate will need rescaling downstream`
  )
}

function element(type, extra) {
  return {
    type,
    version: 1,
    versionNonce: nextSeed(),
    isDeleted: false,
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    seed: nextSeed(),
    groupIds: [],
    frameId: hasFrame ? 'frame0' : null,
    roundness: null,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
    ...extra,
  }
}

const elements = []
const byId = new Map()

// ---- frame -----------------------------------------------------------------

if (hasFrame) {
  elements.push(
    element('frame', {
      id: 'frame0',
      x: 0,
      y: 0,
      width: canvasW,
      height: canvasH,
      strokeColor: '#bbb',
      frameId: null,
      name: String(spec.name),
    })
  )
}

// ---- boxes and their bound labels ------------------------------------------

for (const box of spec.boxes || []) {
  if (!box.id) die('every box needs an id')
  if (byId.has(box.id)) die(`duplicate box id: ${box.id}`)
  if (!Array.isArray(box.at) || !Array.isArray(box.size)) {
    die(`box ${box.id} needs at: [x, y] and size: [w, h]`)
  }
  const stroke = box.stroke || 'solid'
  if (!STROKES.includes(stroke)) {
    die(`box ${box.id} has stroke: ${stroke}, expected one of ${STROKES.join(', ')}`)
  }

  const [x, y] = box.at
  const [w, h] = box.size
  const el = element(SHAPES[box.shape || 'box'] || 'rectangle', {
    id: box.id,
    x,
    y,
    width: w,
    height: h,
    strokeStyle: stroke,
  })
  elements.push(el)
  byId.set(box.id, el)

  if (box.label !== undefined && box.label !== null && box.label !== '') {
    const fontSize = box.fontSize || (h < 60 ? 16 : 20)
    const lineHeight = 1.25
    const lines = wrapLabel(box.label, w, fontSize)
    const textHeight = lines.length * fontSize * lineHeight
    const textId = `${box.id}_label`

    elements.push(
      element('text', {
        id: textId,
        x: x + 8,
        y: y + (h - textHeight) / 2,
        width: w - 16,
        height: textHeight,
        fontSize,
        fontFamily: 1,
        text: lines.join('\n'),
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: box.id,
        originalText: String(box.label),
        lineHeight,
      })
    )
    // the other half of the binding
    el.boundElements.push({ type: 'text', id: textId })
  }
}

// ---- arrows ----------------------------------------------------------------

for (const arrow of spec.arrows || []) {
  const from = byId.get(arrow.from)
  const to = byId.get(arrow.to)
  if (!from) die(`arrow references unknown box: ${arrow.from}`)
  if (!to) die(`arrow references unknown box: ${arrow.to}`)

  const gap = 5
  const startX = from.x + from.width + gap
  const startY = from.y + from.height / 2
  const endX = to.x - gap
  const endY = to.y + to.height / 2
  const id = `arrow_${arrow.from}_${arrow.to}`

  if (endX - startX < 10) {
    console.error(
      `mock-compile: warning: ${arrow.from} -> ${arrow.to} has only ` +
        `${Math.round(endX - startX)}px of shaft; the boxes are nearly touching`
    )
  }

  elements.push(
    element('arrow', {
      id,
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      roundness: { type: 2 },
      points: [
        [0, 0],
        [endX - startX, endY - startY],
      ],
      lastCommittedPoint: null,
      startBinding: { elementId: from.id, focus: 0, gap },
      endBinding: { elementId: to.id, focus: 0, gap },
      startArrowhead: null,
      endArrowhead: 'arrow',
    })
  )
  from.boundElements.push({ type: 'arrow', id })
  to.boundElements.push({ type: 'arrow', id })
}

// ---- free labels -----------------------------------------------------------

let labelSeq = 0
for (const label of spec.labels || []) {
  if (!Array.isArray(label.at)) die('every label needs at: [x, y]')
  const [x, y] = label.at
  const fontSize = label.fontSize || 20
  elements.push(
    element('text', {
      id: label.id || `label${labelSeq++}`,
      x,
      y,
      width: textWidth(label.text, fontSize),
      height: fontSize * 1.25,
      fontSize,
      fontFamily: 1,
      text: String(label.text),
      textAlign: 'left',
      verticalAlign: 'top',
      containerId: null,
      originalText: String(label.text),
      lineHeight: 1.25,
    })
  )
}

// Nothing validated coordinates before, so a note could sit off the canvas and
// silently widen the exported bounds, changing the figure's aspect ratio.
for (const el of elements) {
  if (el.type === 'frame') continue
  const right = el.x + (el.width || 0)
  const bottom = el.y + (el.height || 0)
  if (el.x < 0 || el.y < 0 || right > canvasW || bottom > canvasH) {
    console.error(
      `mock-compile: warning: ${el.id} lies outside the ${canvasW}x${canvasH} canvas ` +
        `(${Math.round(el.x)},${Math.round(el.y)} to ${Math.round(right)},${Math.round(bottom)}); ` +
        `the export will widen to include it`
    )
  }
}

const scene = {
  type: 'excalidraw',
  version: 2,
  source: 'slide-engine/mock-compile',
  elements,
  appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
  files: {},
}

fs.writeFileSync(outPath, JSON.stringify(scene, null, 2) + '\n')
console.log(`mock-compile: ${elements.length} elements -> ${outPath}`)
