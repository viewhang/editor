<template>
  <bubble-menu
    v-if="editor"
    class="umo-editor-bubble-menu"
    :editor="editor"
    :should-show="shouldShowBubbleMenu"
  >
    <menus-bubble-menus
      v-if="options?.document?.enableBubbleMenu"
      :key="bubbleMenuKey"
    >
      <template #bubble_menu="props">
        <slot name="bubble_menu" v-bind="props" />
      </template>
    </menus-bubble-menus>
  </bubble-menu>
</template>

<script setup>
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { shortId } from '@/utils/short-id'

import {
  isBubbleNodeActive,
  shouldShowBubbleMenu as shouldShowBubbleMenuState,
  viewerSafeBubbleTypes,
} from '@/utils/bubble-menu'

const editor = inject('editor')
const options = inject('options')
const isViewerMode = inject('isViewerMode', computed(() => false))

// 根据选区、编辑状态和评论设置决定是否显示气泡菜单
const shouldShowBubbleMenu = ({ editor, state, from, to, view }) => {
  const selectedText = state.doc.textBetween(from, to)
  const { activeElement } = document
  const isChildOfMenu = activeElement?.closest?.('.umo-editor-bubble-menu')
  const hasEditorFocus = view.hasFocus() || isChildOfMenu
  const hasViewerSafeAction = viewerSafeBubbleTypes.some((type) => isBubbleNodeActive(editor, type))

  return shouldShowBubbleMenuState({
    selectedText,
    selectionEmpty: state.selection.empty,
    hasNodeSelection: !!state.selection.node,
    hasViewerSafeAction,
    hasEditorFocus,
    isViewerMode: isViewerMode.value,
    commentsEnabled: !!options.value.comments?.enabled,
    commentSelectionEnabled: options.value.comments?.selection?.enabled !== false,
    allowTextSelection: options.value.viewer?.allowTextSelection !== false,
    isEditable: editor.isEditable,
  })
}

let bubbleMenuKey = $ref(shortId())
watch(
  () => [options.value.document?.readOnly, editor.value?.isEditable],
  async () => {
    await nextTick()
    bubbleMenuKey = shortId()
  },
)
</script>

<style lang="less">
.umo-editor-bubble-menu {
  max-width: 620px;
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
