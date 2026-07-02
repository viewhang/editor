import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('../src/extensions/image/node-view.vue', import.meta.url),
  'utf8',
)

test('image node view handles VueUse image errors locally', () => {
  assert.match(source, /useImage\(\s*\{\s*src:\s*imageSrcRef\s*\}\s*,/)
  assert.match(source, /onError:\s*\(\)\s*=>\s*\{\}/)
})

test('image node view watches persistent file id changes', () => {
  assert.match(source, /\(\)\s*=>\s*\[attrs\.id,\s*attrs\.src,\s*attrs\.uploaded\]/)
})
