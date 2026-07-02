import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('../src/extensions/image/index.js', import.meta.url),
  'utf8',
)

test('image extension parses persisted boolean attributes as booleans', () => {
  assert.match(source, /parseImageBooleanAttribute/)

  for (const attr of [
    'vnode',
    'draggable',
    'rotatable',
    'equalProportion',
    'flipX',
    'flipY',
    'uploaded',
    'error',
    'inline',
  ]) {
    assert.match(
      source,
      new RegExp(`${attr}: \\{[\\s\\S]*?parseHTML: \\(element\\) => parseImageBooleanAttribute\\(element, '${attr}',`),
    )
  }
})
