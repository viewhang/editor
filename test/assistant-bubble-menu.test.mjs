import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const componentSource = readFileSync(
  new URL('../src/components/menus/bubble/ai.vue', import.meta.url),
  'utf8',
)

test('assistant bubble commands use framework dropdown menu items', () => {
  assert.match(componentSource, /<t-dropdown-menu>/)
  assert.match(componentSource, /class="umo-ai-assistant-panel-item"/)
  assert.match(componentSource, /class="umo-ai-assistant-panel"/)
  assert.match(componentSource, /:popup-props="assistantPopupProps"/)
  assert.match(componentSource, /:min-column-width="520"/)
  assert.match(componentSource, /:max-column-width="600"/)
})

test('assistant bubble panel exposes prompt input command chips and submit button', () => {
  assert.match(componentSource, /class="umo-ai-assistant-input"/)
  assert.match(componentSource, /:placeholder="assistantPlaceholder"/)
  assert.match(componentSource, /@keydown\.enter\.exact\.prevent="submitCommand\(\)"/)
  assert.match(componentSource, /class="umo-ai-assistant-submit"/)
  assert.match(componentSource, /@click\.stop="submitCommand\(\)"/)
  assert.match(componentSource, /class="umo-ai-assistant-chip"/)
  assert.match(componentSource, /@click="selectCommand\(command\)"/)
  assert.match(componentSource, /submitCommand\(command\)/)
})

test('assistant bubble panel exposes result actions', () => {
  assert.match(componentSource, /class="umo-ai-assistant-result"/)
  assert.match(componentSource, /class="umo-ai-assistant-result-content"/)
  assert.match(componentSource, /applyResult\('replace'\)/)
  assert.match(componentSource, /applyResult\('before'\)/)
  assert.match(componentSource, /applyResult\('after'\)/)
  assert.match(componentSource, /copyAssistantResult/)
  assert.match(componentSource, /regenerateAssistantResult/)
  assert.match(componentSource, /@click="closeAssistantPanel"/)
})
