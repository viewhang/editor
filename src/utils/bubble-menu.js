export const viewerSafeBubbleTypes = ['link', 'image', 'inlineImage', 'video', 'audio', 'file', 'iframe']

export const shouldShowBubbleMenu = ({
  selectedText = '',
  selectionEmpty = true,
  hasNodeSelection = false,
  hasViewerSafeAction = false,
  hasEditorFocus = false,
  isViewerMode = false,
  commentsEnabled = false,
  commentSelectionEnabled = true,
  allowTextSelection = true,
  isEditable = false,
}) => {
  const hasTextSelection = !selectionEmpty && String(selectedText).trim().length > 0
  const hasBubbleContext = hasTextSelection || hasNodeSelection || hasViewerSafeAction

  if (!hasBubbleContext) {
    return false
  }

  if (isViewerMode) {
    const canCommentOnSelection =
      hasTextSelection &&
      commentsEnabled &&
      commentSelectionEnabled !== false &&
      allowTextSelection !== false

    if (canCommentOnSelection) {
      return true
    }

    return hasEditorFocus && hasViewerSafeAction
  }

  return hasEditorFocus && isEditable
}

export const shouldRenderCommentDivider = ({
  isViewerMode = false,
  hasViewerSafeAction = false,
  hasEditableMenu = false,
}) => {
  if (isViewerMode) {
    return hasViewerSafeAction
  }

  return hasEditableMenu
}
