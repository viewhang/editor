import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildUploadedImageAttrs,
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
