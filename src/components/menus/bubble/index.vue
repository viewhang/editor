<template>
  <bubble-menu
    v-if="editor"
    class="umo-editor-bubble-menu"
    :editor="editor"
    :should-show="shouldShowBubbleMenu"
  >
    <menus-bubble-menus v-if="options?.document?.enableBubbleMenu">
      <template #bubble_menu="props">
        <slot name="bubble_menu" v-bind="props" />
      </template>
    </menus-bubble-menus>
  </bubble-menu>
</template>

<script setup>
import { BubbleMenu } from '@tiptap/vue-3/menus'

const editor = inject('editor')
const options = inject('options')
const isViewerMode = inject('isViewerMode', computed(() => false))

const viewerSafeTypes = ['link', 'image', 'inlineImage', 'video', 'audio', 'file', 'iframe']

const shouldShowBubbleMenu = ({ editor, state, from, to, view }) => {
  const selectedText = state.doc.textBetween(from, to)
  const hasTextSelection = !state.selection.empty && selectedText.trim().length > 0
  const hasNodeSelection = !!state.selection.node
  const hasViewerSafeAction = viewerSafeTypes.some((type) => editor.isActive(type))
  const hasBubbleContext = hasTextSelection || hasNodeSelection || hasViewerSafeAction

  const activeElement = document.activeElement
  const isChildOfMenu = activeElement?.closest?.('.umo-editor-bubble-menu')
  const hasEditorFocus = view.hasFocus() || isChildOfMenu
  if (!hasEditorFocus || !hasBubbleContext) {
    return false
  }

  if (isViewerMode.value) {
    const canCommentOnSelection =
      hasTextSelection &&
      !!options.value.comments?.enabled &&
      options.value.viewer?.allowTextSelection !== false
    return canCommentOnSelection || hasViewerSafeAction
  }

  return editor.isEditable
}
</script>

<style lang="less">
.umo-editor-bubble-menu {
  max-width: 580px;
  z-index: 110;
  border-radius: var(--umo-radius);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px 10px !important;
  box-shadow: var(--umo-shadow);
  border: 1px solid var(--umo-border-color);
  background-color: var(--umo-color-white);

  &:empty {
    display: none;
  }

  .umo-menu-button.show-text .umo-button-content .umo-button-text {
    display: none !important;
  }

  .umo-menu-button.huge {
    height: var(--td-comp-size-xs);
    min-width: unset;

    .umo-button-content {
      min-width: unset !important;

      .umo-icon {
        font-size: 16px;
        margin-top: 0;
      }
    }
  }
}
</style>
