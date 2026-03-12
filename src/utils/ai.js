import { isNumber, isRecord, isString } from '@tool-belt/type-predicates'

import { l, t } from '@/composables/i18n'
import { getSelectionNode, getSelectionText } from '@/utils/selection'

export const AI_ACTION_SURFACES = ['bubble', 'slash']
export const AI_DEFAULT_APPLY_MODE = 'replace-selection'
export const AI_DEFAULT_BUBBLE_MAX_VISIBLE = 3

const getSelectionState = (editor) => {
  const selection = editor?.state?.selection
  return {
    empty: !!selection?.empty,
    from: selection?.from || 0,
    to: selection?.to || 0,
    text: editor ? getSelectionText(editor) : '',
    node: editor ? getSelectionNode(editor) : null,
  }
}

export const getAiActionLabel = (action) => {
  return l(action?.label) || action?.key || ''
}

export const getAiActionDescription = (action) => {
  return l(action?.description) || ''
}

export const cloneAiAction = (action) => {
  return JSON.parse(JSON.stringify(action || {}))
}

export const getAiBubbleMaxVisible = (editorOptions) => {
  const maxVisible = editorOptions?.ai?.bubble?.maxVisible
  if (!isNumber(maxVisible) || maxVisible < 0) {
    return AI_DEFAULT_BUBBLE_MAX_VISIBLE
  }
  return Math.floor(maxVisible)
}

export const getAiSurfaceActions = (editorOptions, surface = 'bubble') => {
  const aiOptions = editorOptions?.ai
  if (!aiOptions?.enabled || !Array.isArray(aiOptions.actions)) {
    return []
  }

  if (surface === 'bubble' && aiOptions?.bubble?.enabled === false) {
    return []
  }

  return aiOptions.actions
    .map((action, index) => ({ action, index }))
    .filter(({ action }) => {
      if (!isRecord(action) || action.disabled || !action.key) {
        return false
      }
      if (!Array.isArray(action.surfaces) || action.surfaces.length === 0) {
        return surface === 'bubble'
      }
      return action.surfaces.includes(surface)
    })
    .sort((prev, next) => {
      const priorityA = isNumber(prev.action.priority) ? prev.action.priority : 0
      const priorityB = isNumber(next.action.priority) ? next.action.priority : 0
      if (priorityA === priorityB) {
        return prev.index - next.index
      }
      return priorityB - priorityA
    })
    .map(({ action }) => action)
}

export const isAiActionVisible = ({ action, editor, readOnly = false }) => {
  if (!isRecord(action) || !editor) {
    return false
  }

  const selection = getSelectionState(editor)
  const selectionConfig = isRecord(action.selection) ? action.selection : {}
  const visibleWhen = isRecord(action.visibleWhen) ? action.visibleWhen : {}

  const requiresSelection = selectionConfig.required !== false
  if (requiresSelection && selection.empty) {
    return false
  }

  if (
    isNumber(selectionConfig.minLength) &&
    selection.text.length < selectionConfig.minLength
  ) {
    return false
  }

  if (
    isNumber(selectionConfig.maxLength) &&
    selection.text.length > selectionConfig.maxLength
  ) {
    return false
  }

  if (
    typeof visibleWhen.readOnly === 'boolean' &&
    visibleWhen.readOnly !== readOnly
  ) {
    return false
  }

  if (
    Array.isArray(visibleWhen.nodeTypes) &&
    visibleWhen.nodeTypes.length > 0 &&
    !visibleWhen.nodeTypes.includes(selection.node?.type?.name)
  ) {
    return false
  }

  return true
}

export const getVisibleAiActions = ({
  editorOptions,
  editor,
  surface = 'bubble',
  readOnly = false,
}) => {
  return getAiSurfaceActions(editorOptions, surface).filter((action) => {
    return isAiActionVisible({ action, editor, readOnly })
  })
}

export const normalizeAiActionResult = (result, action = {}) => {
  if (result === undefined || result === null || result === false) {
    return null
  }

  if (result === true) {
    return { type: 'none' }
  }

  if (isString(result)) {
    return {
      type: action.applyMode || AI_DEFAULT_APPLY_MODE,
      format: 'text',
      content: result,
    }
  }

  if (!isRecord(result)) {
    throw new Error(t('ai.invalidResult'))
  }

  return {
    type: action.applyMode || AI_DEFAULT_APPLY_MODE,
    format: 'text',
    ...result,
  }
}
