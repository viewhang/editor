import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const componentSource = readFileSync(
  new URL('../src/components/menus/bubble/ai.vue', import.meta.url),
  'utf8',
)

test('assistant bubble commands use framework dropdown menu items', () => {
  assert.match(componentSource, /<t-dropdown-menu>/)
  assert.match(componentSource, /<t-dropdown-item[\s\S]*v-for="command in visibleCommands"/)
  assert.match(componentSource, /@click="handleCommand\(command\)"/)
})
