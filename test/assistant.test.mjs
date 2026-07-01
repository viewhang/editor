import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildAssistantContent,
  buildAssistantPayload,
  getAssistantCommandLabel,
  getAssistantCommandValue,
  isReadableStreamLike,
  readAssistantResult,
  validateAssistantInputLength,
} from '../src/utils/assistant.js'

const locale = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.zh_CN || value.en_US || ''
}

test('uses the localized command value in the 9.x assistant payload', () => {
  const payload = buildAssistantPayload({
    command: {
      label: { en_US: 'Polish', zh_CN: '润色' },
      value: { en_US: 'Polish', zh_CN: '润色' },
    },
    input: '选中文字',
    lang: 'zh-CN',
    output: 'html',
    locale,
  })

  assert.deepEqual(payload, {
    lang: 'zh-CN',
    input: '选中文字',
    command: '润色',
    output: 'html',
  })
})

test('falls back to command label when value is omitted', () => {
  const value = getAssistantCommandValue({
    label: { en_US: 'Continue', zh_CN: '续写' },
  }, locale)

  assert.equal(value, '续写')
})

test('uses label for display and value for payload command', () => {
  const command = {
    label: { en_US: 'Translate', zh_CN: '翻译' },
    value: { en_US: 'Translate to Chinese', zh_CN: '翻译成英文' },
  }

  assert.equal(getAssistantCommandLabel(command, locale), '翻译')
  assert.equal(getAssistantCommandValue(command, locale), '翻译成英文')
})

test('uses rich-text as the default assistant output', () => {
  const payload = buildAssistantPayload({
    command: { label: 'Polish' },
    input: 'selected text',
    lang: 'en-US',
    locale,
  })

  assert.equal(payload.output, 'rich-text')
})

test('preserves stable command identifiers in the assistant payload', () => {
  const payload = buildAssistantPayload({
    command: {
      id: 'config-1',
      assistantId: 'assistant-1',
      commandKey: 'polish',
      label: 'Polish',
      value: 'Make it better',
    },
    input: 'selected text',
    lang: 'en-US',
    locale,
  })

  assert.equal(payload.command, 'Make it better')
  assert.equal(payload.assistantId, 'assistant-1')
  assert.equal(payload.commandKey, 'polish')
  assert.equal(payload.commandId, 'config-1')
})

test('builds assistant content with html json and text', () => {
  const editor = {
    getHTML: () => '<p>Hello</p>',
    getJSON: () => ({ type: 'doc', content: [] }),
    getText: () => 'Hello',
  }

  assert.deepEqual(buildAssistantContent(editor), {
    html: '<p>Hello</p>',
    json: { type: 'doc', content: [] },
    text: 'Hello',
  })
})

test('validates maxlength against user input', () => {
  assert.equal(validateAssistantInputLength('12345', 5), true)
  assert.equal(validateAssistantInputLength('123456', 5), false)
})

test('reads readable stream chunks as a single string', async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('A')
      controller.enqueue(new TextEncoder().encode('B'))
      controller.close()
    },
  })

  assert.equal(isReadableStreamLike(stream), true)
  assert.equal(await readAssistantResult(stream), 'AB')
})

test('streams chunks to callback and ignores done sentinel', async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('A')
      controller.enqueue(new TextEncoder().encode('B'))
      controller.enqueue('[DONE]')
      controller.close()
    },
  })
  const chunks = []

  const result = await readAssistantResult(stream, (chunk, accumulated) => {
    chunks.push({ chunk, accumulated })
  })

  assert.equal(result, 'AB')
  assert.deepEqual(chunks, [
    { chunk: 'A', accumulated: 'A' },
    { chunk: 'B', accumulated: 'AB' },
  ])
})

test('propagates stream read failures', async () => {
  const stream = new ReadableStream({
    pull() {
      throw new Error('stream failed')
    },
  })

  await assert.rejects(() => readAssistantResult(stream), /stream failed/)
})

test('rejects unsupported assistant result values', async () => {
  await assert.rejects(() => readAssistantResult({ content: 'text' }), /must return a string or ReadableStream/)
})

test('default options expose the 9.x ai.assistant shape', async () => {
  globalThis.location = globalThis.location || { href: 'http://localhost/' }
  const { default: defaultOptions } = await import('../src/options/config/index.js')

  assert.equal(defaultOptions.ai.assistant.enabled, false)
  assert.equal(defaultOptions.ai.assistant.maxlength, 100)
  assert.equal(defaultOptions.ai.assistant.placeholder.zh_CN, '输入或选择指令...')
  assert.equal(Array.isArray(defaultOptions.ai.assistant.commands), true)
  assert.equal(defaultOptions.ai.actions, undefined)
})

test('assistant schema accepts placeholder and rejects malformed commands', async () => {
  globalThis.location = globalThis.location || { href: 'http://localhost/' }
  const { default: schema } = await import('../src/options/schema.js')

  assert.doesNotThrow(() => schema.validate({
    ai: {
      assistant: {
        placeholder: { en_US: 'Prompt', zh_CN: '提示词' },
        commands: [{ label: { en_US: 'Polish', zh_CN: '润色' } }],
      },
    },
  }))

  assert.throws(() => schema.validate({
    ai: { assistant: { commands: ['Polish'] } },
  }), /commands\[0\].*object/)

  assert.throws(() => schema.validate({
    ai: { assistant: { commands: [{}] } },
  }), /commands\[0\].*label.*value/)
})
