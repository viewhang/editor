import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildDiagramFrameSrc,
  getDiagramConfigurePayload,
} from '../src/utils/diagram-editor-options.js'

test('diagram editor frame URL contains a single language parameter', () => {
  const src = buildDiagramFrameSrc({
    domain: '/diagrams/',
    params: {
      ui: 'atlas',
      proto: 'json',
      libraries: 1,
      configure: 1,
      noSaveBtn: 1,
      lang: 'zh',
    },
    locale: 'zh-CN',
  })

  assert.equal(src, '/diagrams/?ui=atlas&proto=json&libraries=1&configure=1&noSaveBtn=1&lang=zh')
})

test('diagram editor falls back to the current editor locale for language', () => {
  const src = buildDiagramFrameSrc({
    domain: '/diagrams/',
    params: { ui: 'atlas' },
    locale: 'zh-CN',
  })

  assert.equal(src, '/diagrams/?ui=atlas&lang=zh')
})

test('diagram editor sends an object for the configure action', () => {
  assert.deepEqual(getDiagramConfigurePayload({ configure: 1 }), {})
  assert.deepEqual(getDiagramConfigurePayload({ configure: { defaultFonts: ['Arial'] } }), {
    defaultFonts: ['Arial'],
  })
})
