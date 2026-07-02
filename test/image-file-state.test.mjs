import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildUploadedImageAttrs,
  canUseRawImageSource,
  getRenderableImageSource,
  normalizeImageSource,
  parseImageBooleanAttribute,
  parseImageSource,
  sanitizeImageHTMLAttributes,
  shouldResolveImageSource,
} from '../src/extensions/image/file-state.js'
import { createFileResolver } from '../src/utils/file-resolver.js'

test('persists uploaded images by file id instead of download url', () => {
  assert.deepEqual(
    buildUploadedImageAttrs({
      id: '822570771095557',
      url: 'http://172.28.30.155:9527/epoch-wiki/files/download/822570771095557',
    }),
    {
      id: '822570771095557',
      src: null,
      uploaded: true,
    },
  )
})

test('keeps url only when upload result has no persistent id', () => {
  assert.deepEqual(
    buildUploadedImageAttrs({
      url: 'https://cdn.example.com/image.png',
    }),
    {
      src: 'https://cdn.example.com/image.png',
      uploaded: true,
    },
  )
})

test('rejects empty image upload result before mutating document attrs', () => {
  assert.throws(
    () => buildUploadedImageAttrs({}),
    /Image upload result must include id or url/,
  )
})

test('resolves uploaded image source when only file id is stored', () => {
  assert.equal(shouldResolveImageSource({ id: '822570771095557', src: null, uploaded: true }), true)
  assert.equal(shouldResolveImageSource({ id: 'local-preview', src: 'blob:http://localhost/preview', uploaded: false }), false)
  assert.equal(shouldResolveImageSource({ id: null, src: null, uploaded: true }), false)
})

test('does not fallback to persisted src when caller disables fallback', async () => {
  const resolver = createFileResolver({
    options: {
      value: {
        onFileLoad: async () => undefined,
      },
    },
  })

  const resolved = await resolver.resolve(
    {
      id: '822570771095557',
      src: 'http://old-host/epoch-wiki/files/download/822570771095557',
      nodeType: 'image',
    },
    {
      reason: 'display',
      allowFallback: false,
    },
  )

  assert.equal(resolved.url, null)
})

test('calls onFileLoad for id-only uploaded images', async () => {
  const calls = []
  const resolver = createFileResolver({
    options: {
      value: {
        onFileLoad: async (file) => {
          calls.push(file)
          return { url: `/epoch-wiki/files/download/${file.id}` }
        },
      },
    },
  })

  const resolved = await resolver.resolve(
    {
      id: '822586469134341',
      src: null,
      uploaded: true,
      nodeType: 'image',
    },
    {
      reason: 'display',
      allowFallback: false,
    },
  )

  assert.equal(calls.length, 1)
  assert.equal(calls[0].id, '822586469134341')
  assert.equal(calls[0].rawUrl, null)
  assert.equal(resolved.url, '/epoch-wiki/files/download/822586469134341')
})

test('omits empty image src from serialized html attributes', () => {
  assert.deepEqual(
    sanitizeImageHTMLAttributes({
      id: '822570771095557',
      src: null,
      uploaded: true,
    }),
    {
      id: '822570771095557',
      uploaded: true,
    },
  )

  assert.deepEqual(
    sanitizeImageHTMLAttributes({
      id: '822570771095557',
      src: 'null',
      uploaded: true,
    }),
    {
      id: '822570771095557',
      uploaded: true,
    },
  )
})

test('parses persisted null image src values as empty runtime src', () => {
  assert.equal(parseImageSource('null'), null)
  assert.equal(parseImageSource('undefined'), null)
  assert.equal(parseImageSource(''), null)
  assert.equal(parseImageSource('/files/download/42'), '/files/download/42')
})

test('parses persisted image boolean attributes instead of keeping string truthiness', () => {
  const element = {
    getAttribute: (name) => ({
      error: 'false',
      draggable: 'false',
      uploaded: 'true',
      equalProportion: 'true',
    })[name] ?? null,
  }

  assert.equal(parseImageBooleanAttribute(element, 'error', false), false)
  assert.equal(parseImageBooleanAttribute(element, 'draggable', false), false)
  assert.equal(parseImageBooleanAttribute(element, 'uploaded', false), true)
  assert.equal(parseImageBooleanAttribute(element, 'equalProportion', true), true)
  assert.equal(parseImageBooleanAttribute(element, 'missing', true), true)
})

test('treats persisted null image src values as unavailable at runtime', () => {
  assert.equal(shouldResolveImageSource({ id: null, src: 'null', uploaded: true }), false)
  assert.equal(canUseRawImageSource({ id: null, src: 'null', uploaded: true }), false)
})

test('returns only safe image sources for runtime rendering', () => {
  assert.equal(
    getRenderableImageSource({ id: null, src: 'null', uploaded: true }, null),
    null,
  )
  assert.equal(
    getRenderableImageSource({ id: '822570771095557', src: 'http://old-host/file.png', uploaded: true }, null),
    null,
  )
  assert.equal(
    getRenderableImageSource({ id: null, src: 'http://old-host/file.png', uploaded: true }, null),
    'http://old-host/file.png',
  )
  assert.equal(
    getRenderableImageSource({ id: '822570771095557', src: null, uploaded: true }, '/epoch-wiki/files/download/822570771095557'),
    '/epoch-wiki/files/download/822570771095557',
  )
})

test('does not stringify object values into image sources', () => {
  const objectSource = { url: '/epoch-wiki/files/download/822570771095557' }

  assert.equal(normalizeImageSource(objectSource), null)
  assert.equal(parseImageSource(objectSource), null)
  assert.equal(
    getRenderableImageSource({ id: null, src: objectSource, uploaded: true }, null),
    null,
  )
  assert.equal(
    getRenderableImageSource({ id: '822570771095557', src: null, uploaded: true }, objectSource),
    null,
  )
})

test('does not use object file resolver fallbacks as urls', async () => {
  const resolver = createFileResolver({
    options: {
      value: {
        onFileLoad: async () => undefined,
      },
    },
  })

  const resolved = await resolver.resolve(
    {
      src: { url: '/epoch-wiki/files/download/822570771095557' },
      nodeType: 'image',
    },
    {
      reason: 'display',
      allowFallback: true,
    },
  )

  assert.equal(resolved.url, null)
})
