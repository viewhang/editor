import assert from 'node:assert/strict'
import test from 'node:test'

import { shouldTrackPageContent } from '../src/utils/page-content.js'

test('web layout does not require a page content element for zoom height tracking', () => {
  assert.equal(shouldTrackPageContent('web'), false)
})

test('page layout requires a page content element for zoom height tracking', () => {
  assert.equal(shouldTrackPageContent('page'), true)
})
