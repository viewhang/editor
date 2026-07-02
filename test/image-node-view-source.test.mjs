import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('../src/extensions/image/node-view.vue', import.meta.url),
  'utf8',
)

test('image node view handles VueUse image errors locally', () => {
  assert.match(source, /const EMPTY_IMAGE_SOURCE\s*=/)
  assert.match(source, /const imageLoadOptions = computed\(\(\) => \(\{/)
  assert.match(source, /src:\s*imageSrcRef\.value \|\| EMPTY_IMAGE_SOURCE/)
  assert.match(source, /useImage\(\s*imageLoadOptions\s*,/)
  assert.match(source, /imageSrc && isLoading\.value/)
  assert.match(source, /imageSrc && error\.value/)
  assert.match(source, /onError:\s*\(\)\s*=>\s*\{\}/)
})

test('image node view watches persistent file id changes', () => {
  assert.match(source, /\(\)\s*=>\s*\[attrs\.id,\s*attrs\.src,\s*attrs\.uploaded\]/)
})
