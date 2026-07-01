import assert from 'node:assert/strict'
import test from 'node:test'

import {
  shouldRenderCommentDivider,
  shouldShowBubbleMenu,
} from '../src/utils/bubble-menu.js'

test('shows viewer comment bubble for selected text even when the readonly editor is not focused', () => {
  assert.equal(shouldShowBubbleMenu({
    selectedText: 'selected text',
    selectionEmpty: false,
    hasNodeSelection: false,
    hasViewerSafeAction: false,
    hasEditorFocus: false,
    isViewerMode: true,
    commentsEnabled: true,
    commentSelectionEnabled: true,
    allowTextSelection: true,
    isEditable: false,
  }), true)
})

test('does not show viewer comment bubble when text selection comments are disabled', () => {
  assert.equal(shouldShowBubbleMenu({
    selectedText: 'selected text',
    selectionEmpty: false,
    hasNodeSelection: false,
    hasViewerSafeAction: false,
    hasEditorFocus: false,
    isViewerMode: true,
    commentsEnabled: true,
    commentSelectionEnabled: false,
    allowTextSelection: true,
    isEditable: false,
  }), false)
})

test('keeps edit bubble gated by editor focus and editability', () => {
  assert.equal(shouldShowBubbleMenu({
    selectedText: 'selected text',
    selectionEmpty: false,
    hasNodeSelection: false,
    hasViewerSafeAction: false,
    hasEditorFocus: false,
    isViewerMode: false,
    commentsEnabled: false,
    commentSelectionEnabled: true,
    allowTextSelection: true,
    isEditable: true,
  }), false)
})

test('does not render a leading divider when viewer selection only shows comment', () => {
  assert.equal(shouldRenderCommentDivider({
    isViewerMode: true,
    hasViewerSafeAction: false,
    hasEditableMenu: false,
  }), false)
})

test('renders comment divider only when another menu group follows comment', () => {
  assert.equal(shouldRenderCommentDivider({
    isViewerMode: true,
    hasViewerSafeAction: true,
    hasEditableMenu: false,
  }), true)

  assert.equal(shouldRenderCommentDivider({
    isViewerMode: false,
    hasViewerSafeAction: false,
    hasEditableMenu: true,
  }), true)
})
