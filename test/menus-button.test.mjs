import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const componentSource = readFileSync(
  new URL('../src/components/menus/button.vue', import.meta.url),
  'utf8',
)

test('dropdown menu button merges custom popup props with internal visibility handling', () => {
  assert.match(componentSource, /const getDropdownPopupProps = \(baseProps = {}\) =>/)
  assert.match(componentSource, /const customProps = attrs\['popup-props'\] \|\| {}/)
  assert.match(componentSource, /onVisibleChange\?\.\(visible, context\)/)
  assert.match(componentSource, /onVisibleChangeKebab\?\.\(visible, context\)/)
  assert.match(componentSource, /:popup-props="getDropdownPopupProps\(\)"/)
})
