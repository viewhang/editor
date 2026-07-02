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

test('image node view renders the persisted src directly', () => {
  assert.match(source, /const imageSrcRef = computed\(\(\) => normalizeImageSource\(attrs\.src\)\)/)
  assert.match(source, /\(\)\s*=>\s*attrs\.src/)
  assert.doesNotMatch(source, /fileResolver\.resolve/)
  assert.doesNotMatch(source, /resolveImageSource/)
})

test('image node view writes uploaded urls back to image attrs', () => {
  assert.match(source, /const uploadedAttrs = buildUploadedImageAttrs\(result\)/)
  assert.match(source, /updateAttributesWithoutHistory\(\s*editor\.value,\s*uploadedAttrs,\s*getPos\(\),\s*\)/)
})

test('image node view guards image load before the img ref is ready', () => {
  assert.match(source, /const imageElement = imageRef/)
  assert.match(source, /if \(!imageElement\) \{\s*return\s*\}/)
  assert.match(source, /const \{ clientWidth = 1, clientHeight = 1 \} = imageElement/)
})

test('image node view selects the editor node directly when interacting with the image', () => {
  assert.match(source, /@click\.capture="selectImageNode"/)
  assert.match(source, /const selectImageNode = \(\) => \{/)
  assert.match(source, /editor\.value\?\.commands\.setNodeSelection\(pos\)/)
  assert.match(source, /selectImageNode\(\)\s*if \(!attrs\.draggable\)/)
})
