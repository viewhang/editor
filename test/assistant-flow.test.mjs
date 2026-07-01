import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const componentSource = readFileSync(
  new URL('../src/components/index.vue', import.meta.url),
  'utf8',
)

test('assistant command stores generated result for explicit user action', () => {
  assert.match(componentSource, /const createAssistantState = \(overrides = {}\) =>/)
  assert.match(componentSource, /result: '',/)
  assert.match(componentSource, /range: null,/)
  assert.match(componentSource, /assistantState\.value = nextState\(\{\s*loading: false,\s*preview: resultText,\s*result: resultText,/)
})

test('assistant result can be applied before after or as replacement', () => {
  assert.match(componentSource, /const getAssistantInsertRange = \(range, mode\) =>/)
  assert.match(componentSource, /mode === 'before'/)
  assert.match(componentSource, /mode === 'after'/)
  assert.match(componentSource, /return \{ from: range\.from, to: range\.to \}/)
  assert.match(componentSource, /provide\('applyAssistantOutput', applyAssistantOutput\)/)
})
