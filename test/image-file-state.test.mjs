import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildUploadedImageAttrs,
  normalizeImageSource,
  parseImageBooleanAttribute,
  parseImageSource,
  sanitizeImageHTMLAttributes,
} from '../src/extensions/image/file-state.js'

test('persists uploaded images by returned url', () => {
  assert.deepEqual(
    buildUploadedImageAttrs({
      id: '822570771095557',
      url: 'http://172.28.30.155:9527/epoch-wiki/files/download/822570771095557',
    }),
    {
      id: '822570771095557',
      src: 'http://172.28.30.155:9527/epoch-wiki/files/download/822570771095557',
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
      id: null,
      src: 'https://cdn.example.com/image.png',
      uploaded: true,
    },
  )
})

test('rejects empty image upload result before mutating document attrs', () => {
  assert.throws(
    () => buildUploadedImageAttrs({}),
    /Image upload result must include url/,
  )
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

test('does not stringify object values into image sources', () => {
  const objectSource = { url: '/epoch-wiki/files/download/822570771095557' }

  assert.equal(normalizeImageSource(objectSource), null)
  assert.equal(parseImageSource(objectSource), null)
})
