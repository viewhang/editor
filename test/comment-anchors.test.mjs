import assert from 'node:assert/strict'
import test from 'node:test'

import {
  findAnchorContextInHtml,
  findAnchoredTextRange,
  normalizeAnchorText,
} from '../src/utils/comment-anchors.js'

test('finds a unique quote range when before and after context match', () => {
  const source = 'Redis 支持主从复制。Redis Sentinel 可以自动故障转移。Redis 支持持久化。'
  const range = findAnchoredTextRange(source, {
    quoteText: 'Redis',
    originalQuoteText: null,
    beforeText: '故障转移。',
    afterText: ' 支持持久化',
  })

  assert.deepEqual(range, { start: 37, end: 42 })
})

test('falls back to original quote text and normalizes whitespace', () => {
  const source = '第一段文字\n\n第二段   选中的文本  后续内容'
  const range = findAnchoredTextRange(source, {
    quoteText: null,
    originalQuoteText: '选中的文本',
    beforeText: '第二段 ',
    afterText: ' 后续',
  })

  assert.deepEqual(range, { start: 13, end: 18 })
})

test('returns null when the quote is ambiguous without context', () => {
  const source = '重复文本在这里，重复文本又出现。'
  const range = findAnchoredTextRange(source, {
    quoteText: '重复文本',
    originalQuoteText: null,
    beforeText: '',
    afterText: '',
  })

  assert.equal(range, null)
})

test('normalizeAnchorText collapses non-breaking spaces and regular whitespace', () => {
  assert.equal(normalizeAnchorText(' A\u00a0 \n B '), 'A B')
})

test('findAnchorContextInHtml strips tags before decoding escaped text', () => {
  const html = '<p>a &lt;tag&gt; <span data-comment-anchor-id="cmt_1" class="epoch-comment-anchor">x &amp; y</span> z</p>'
  const context = findAnchorContextInHtml(html, 'cmt_1')

  assert.deepEqual(context, {
    quoteText: 'x & y',
    beforeText: 'a <tag>',
    afterText: 'z',
  })
})

test('default options expose viewer and comments settings', async () => {
  globalThis.location = globalThis.location || { href: 'http://localhost/' }
  const { default: defaultOptions } = await import('../src/options/config/index.js')

  assert.deepEqual(defaultOptions.viewer, {
    enabled: false,
    showToolbar: true,
    showStatusbar: true,
    allowTextSelection: true,
  })
  assert.equal(defaultOptions.comments.enabled, false)
  assert.equal(defaultOptions.comments.selection.contextLength, 24)
  assert.deepEqual(defaultOptions.comments.anchors, [])
})
