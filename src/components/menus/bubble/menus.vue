<template>
  <menus-bubble-comment :divider-after="commentDividerAfter" />
  <template v-if="is('link') && attrs('link').href">
    <menus-bubble-link-open />
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-insert-link
      v-if="!isViewerMode"
      ico="edit"
      :text="t('insert.link.edit')"
    />
    <menus-bubble-link-copy />
    <menus-bubble-link-unlink v-if="!isViewerMode" />
    <template v-if="!isViewerMode">
      <div class="umo-bubble-menu-divider"></div>
      <menus-bubble-node-delete />
    </template>
  </template>
  <template
    v-else-if="
      (is('image') && !attrs('image').error) ||
      (is('inlineImage') && !attrs('inlineImage').error)
    "
  >
    <template v-if="!isViewerMode">
      <menus-toolbar-base-align-left />
      <menus-toolbar-base-align-center />
      <menus-toolbar-base-align-right />
      <div class="umo-bubble-menu-divider"></div>
      <menus-bubble-image-flip />
      <menus-bubble-image-proportion />
      <menus-bubble-image-draggable />
      <menus-bubble-image-rotate />
      <menus-bubble-image-reset />
      <div class="umo-bubble-menu-divider"></div>
    </template>
    <menus-bubble-image-preview
      v-if="
        attrs('image')?.type?.startsWith('image') ||
        attrs('inlineImage')?.type?.startsWith('image')
      "
    />
    <menus-bubble-image-edit v-if="!isViewerMode" />
    <menus-bubble-image-open />
    <menus-bubble-node-duplicate
      v-if="!isViewerMode && is('image') && attrs('image').draggable"
    />
    <menus-bubble-node-tofile
      v-if="
        !isViewerMode &&
        attrs('image').type.startsWith('image') &&
        attrs('image').previewType !== null &&
        attrs('inlineImage').previewType !== null
      "
    />
    <menus-bubble-image-convert v-if="!isViewerMode" />
    <template v-if="!isViewerMode">
      <div class="umo-bubble-menu-divider"></div>
      <menus-bubble-node-delete />
    </template>
  </template>
  <template
    v-else-if="is('video') || is('audio') || is('file') || is('iframe')"
  >
    <template v-if="!isViewerMode">
      <menus-toolbar-base-align-left />
      <menus-toolbar-base-align-center />
      <menus-toolbar-base-align-right />
    </template>
    <template v-if="!isViewerMode && is('file')">
      <menus-bubble-file-width />
    </template>
    <div v-if="!isViewerMode" class="umo-bubble-menu-divider"></div>
    <template v-if="is('iframe')">
      <menus-bubble-webpage-clickable v-if="!isViewerMode" />
      <menus-toolbar-insert-web-page
        v-if="!isViewerMode && !disable('web-page')"
        ico="edit"
        :page-type="attrs('iframe')?.type"
        :page-url="attrs('iframe')?.src"
      />
      <menus-bubble-webpage-open />
      <div class="umo-bubble-menu-divider"></div>
    </template>
    <menus-bubble-file-download
      v-if="is('file') || is('video') || is('audio')"
    />
    <menus-bubble-node-tofile v-if="!isViewerMode && (is('video') || is('audio'))" />
    <menus-bubble-node-delete v-if="!isViewerMode" />
  </template>
  <template v-else-if="!isViewerMode && is('table')">
    <menus-toolbar-table-cells-align />
    <menus-toolbar-table-cells-background />
    <!-- <menus-toolbar-table-border-color  /> -->
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-table-add-row-before />
    <menus-toolbar-table-add-row-after />
    <menus-toolbar-table-add-column-before />
    <menus-toolbar-table-add-column-after />
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-table-delete-row />
    <menus-toolbar-table-delete-column />
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-table-merge-cells />
    <menus-toolbar-table-split-cell />
  </template>
  <template v-else-if="!isViewerMode && is('tag')">
    <menus-bubble-tag-input />
    <menus-bubble-tag-builtin />
    <div class="umo-bubble-menu-divider"></div>
    <menus-bubble-tag-color />
    <menus-bubble-tag-background />
    <div class="umo-bubble-menu-divider"></div>
    <menus-bubble-tag-delete />
  </template>
  <template v-else-if="!isViewerMode && is('echarts')">
    <menus-toolbar-base-align-left />
    <menus-toolbar-base-align-center />
    <menus-toolbar-base-align-right />
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-tools-echarts ico="setting" />
    <menus-bubble-node-delete />
  </template>
  <template v-else-if="!isViewerMode && is('optionBox')">
    <menus-toolbar-base-font-size :select="false" />
    <menus-toolbar-base-bold />
    <menus-toolbar-base-italic />
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-base-color />
    <menus-toolbar-base-background-color />
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-insert-option-box edit />
    <div class="umo-bubble-menu-divider"></div>
    <menus-bubble-node-delete />
  </template>
  <template v-else-if="!isViewerMode && (is('blockMath') || is('inlineMath'))">
    <menus-bubble-math />
    <menus-bubble-node-delete />
  </template>
  <template
    v-else-if="
      is('toc') ||
      is('pageBreak') ||
      is('horizontalRule') ||
      is('codeBlock') ||
      attrs('image').error
    "
  >
    <!-- <menus-bubble-node-delete /> -->
  </template>
  <template v-else-if="!isViewerMode">
    <menus-toolbar-base-font-size :select="false" />
    <div
      v-if="!disable('font-size-increase') || !disable('font-size-decrease')"
      class="umo-bubble-menu-divider"
    ></div>
    <menus-toolbar-base-bold />
    <menus-toolbar-base-italic />
    <menus-toolbar-base-underline />
    <menus-toolbar-base-strike />
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-base-align-dropdown />
    <menus-toolbar-insert-link v-if="!disable('link')" />
    <div class="umo-bubble-menu-divider"></div>
    <menus-toolbar-base-color />
    <template v-if="!is('textBox')">
      <menus-toolbar-base-background-color />
      <menus-toolbar-base-highlight v-if="!disable('highlight')" />
    </template>
    <template v-else>
      <menus-bubble-text-box-border />
      <menus-bubble-text-box-background />
      <menus-bubble-text-box-writing-mode />
      <div class="umo-bubble-menu-divider"></div>
      <menus-bubble-node-delete />
    </template>
  </template>
  <menus-bubble-ai v-if="!isViewerMode" />
  <template v-if="editor?.state?.selection">
    <slot
      name="bubble_menu"
      :node-type="getCurrentNode('name')"
      :node-attrs="getCurrentNode('attrs')"
    />
  </template>
</template>

<script setup>
import { CellSelection } from '@tiptap/pm/tables'
import { shouldRenderCommentDivider } from '@/utils/bubble-menu'

const editor = inject('editor')
const options = inject('options')
const isViewerMode = inject('isViewerMode', computed(() => false))

const disable = (name) => {
  return options.value.disableExtensions.includes(name)
}
const is = (type) => {
  const editorIns = editor.value
  if (!editorIns) return false

  if (type === 'table') {
    const { selection } = editorIns.state
    return selection instanceof CellSelection
  }

  return editorIns.isActive(type)
}
const attrs = (type) => {
  return editor.value.getAttributes(type)
}

const hasViewerSafeBubbleAction = () => {
  const editorIns = editor.value
  if (!editorIns) return false

  const linkAttrs = editorIns.getAttributes('link')
  const imageAttrs = editorIns.getAttributes('image')
  const inlineImageAttrs = editorIns.getAttributes('inlineImage')

  return (
    (editorIns.isActive('link') && !!linkAttrs.href) ||
    (editorIns.isActive('image') && !imageAttrs.error) ||
    (editorIns.isActive('inlineImage') && !inlineImageAttrs.error) ||
    editorIns.isActive('video') ||
    editorIns.isActive('audio') ||
    editorIns.isActive('file') ||
    editorIns.isActive('iframe')
  )
}

const hasEditableBubbleMenu = () => {
  const editorIns = editor.value
  if (!editorIns) return false

  const imageAttrs = editorIns.getAttributes('image')
  const isEmptyBubbleGroup =
    editorIns.isActive('toc') ||
    editorIns.isActive('pageBreak') ||
    editorIns.isActive('horizontalRule') ||
    editorIns.isActive('codeBlock') ||
    !!imageAttrs.error

  return !isEmptyBubbleGroup
}

const commentDividerAfter = computed(() => shouldRenderCommentDivider({
  isViewerMode: isViewerMode.value,
  hasViewerSafeAction: hasViewerSafeBubbleAction(),
  hasEditableMenu: hasEditableBubbleMenu(),
}))

const getCurrentNode = (type) => {
  const { state } = editor.value
  const { selection } = state
  const { $from } = selection
  const currentNode = selection.node || $from.parent
  if (type === 'name') {
    return currentNode.type.name
  }
  if (type === 'attrs') {
    return currentNode.attrs
  }
}
</script>

<style lang="less">
.umo-bubble-menu-divider {
  width: 1px;
  border-right: solid 1px var(--umo-border-color-light);
  height: 16px;
  margin: 0 10px 0 5px;
  &:last-child:is(.umo-bubble-menu-divider) {
    display: none;
  }
}
</style>
