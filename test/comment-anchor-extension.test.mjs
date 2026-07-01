import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { getSchema } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

import CommentAnchor from '../src/extensions/comment-anchor.js'

const elementWithAnchor = (anchorId) => ({
  getAttribute(name) {
    if (name === 'data-comment-anchor-id') {
      return anchorId
    }
    return null
  },
})

test('comment anchor mark parses backend anchor spans', () => {
  const attributes = CommentAnchor.config.addAttributes()

  assert.equal(
    attributes.anchorId.parseHTML(elementWithAnchor('cmt_1')),
    'cmt_1',
  )
  assert.deepEqual(attributes.anchorId.renderHTML({ anchorId: 'cmt_1' }), {
    'data-comment-anchor-id': 'cmt_1',
  })
  assert.deepEqual(attributes.anchorId.renderHTML({ anchorId: null }), {})
})

test('comment anchor mark renders backend-compatible span markup', () => {
  const rendered = CommentAnchor.config.renderHTML({
    HTMLAttributes: {
      'data-comment-anchor-id': 'cmt_1',
      class: 'umo-comment-anchor',
    },
  })

  assert.deepEqual(rendered, [
    'span',
    {
      'data-comment-anchor-id': 'cmt_1',
      class: 'epoch-comment-anchor',
    },
    0,
  ])
})

test('comment anchor mark does not consume styled spans during parsing', () => {
  assert.deepEqual(CommentAnchor.config.parseHTML(), [
    {
      tag: 'span[data-comment-anchor-id]',
      consuming: false,
    },
  ])
})

test('comment anchor mark keeps backend markup in the tiptap schema', () => {
  const schema = getSchema([StarterKit, CommentAnchor])
  const mark = schema.marks.commentAnchor.create({ anchorId: 'cmt_1' })

  assert.deepEqual(schema.marks.commentAnchor.spec.toDOM(mark), [
    'span',
    {
      'data-comment-anchor-id': 'cmt_1',
      class: 'epoch-comment-anchor',
    },
    0,
  ])
})

test('default extension registry includes comment anchors', () => {
  const source = readFileSync(
    new URL('../src/extensions/index.js', import.meta.url),
    'utf8',
  )

  assert.match(source, /import CommentAnchor from '\.\/comment-anchor'/)
  assert.match(source, /CommentAnchor,/)
})
