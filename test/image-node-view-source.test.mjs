import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// 读取图片节点组件源码以验证渲染与事件处理
const source = readFileSync(
  new URL('../src/extensions/image/node-view.vue', import.meta.url),
  'utf8',
)

test('image node view handles native image errors locally', () => {
  const body = source.match(/const onError = \(\) => \{([\s\S]*?)\n\}/)[1]
  let nodeError = false
  const result = new Function('attrs', 'setNodeErrorState', `
    let isLoading = true
    let previewImageSrc = null
    ${body}
    return { isLoading, previewImageSrc }
  `)({ src: '/image.png' }, (error) => { nodeError = error })

  assert.equal(nodeError, true)
  assert.deepEqual(result, { isLoading: false, previewImageSrc: '/image.png' })
  assert.match(source, /@error="onError"/)
})

test('image node view renders the persisted src directly', () => {
  assert.match(source, /const imageSrc = \$computed\(\(\) => normalizeImageSource\(attrs\.src\)\)/)
  assert.match(source, /:src="imageSrc"/)
  assert.match(source, /v-else-if="imageSrc"/)
  assert.match(source, /\(\)\s*=>\s*attrs\.src/)
  assert.doesNotMatch(source, /fileResolver\.resolve/)
  assert.doesNotMatch(source, /resolveImageSource/)
})

test('image node view writes uploaded urls back to image attrs', () => {
  assert.match(source, /const uploadedAttrs = buildUploadedImageAttrs\(result\)/)
  assert.match(source, /queueNodeAttrsWithoutHistory\(uploadedAttrs\)/)
})

test('image node view guards image load before the img ref is ready', async () => {
  const body = source.match(/const onLoad = async \(\) => \{([\s\S]*?)\n\}/)[1]
  const onLoad = new Function('imageRef', `return async () => { ${body} }`)(null)
  await assert.doesNotReject(onLoad)
})

test('image node view selects the editor node directly when interacting with the image', () => {
  assert.match(source, /@click\.capture="wrapperClick"/)
  assert.match(source, /const setImageNodeSelection = \(\) => \{/)
  assert.match(source, /selectNodePos\(editor\.value, getPos\)/)
  assert.match(source, /setImageNodeSelection\(\)\s*selected = true\s*event\.stopPropagation\(\)/)
})
