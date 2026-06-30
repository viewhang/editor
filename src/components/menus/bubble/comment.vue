<template>
  <template v-if="visible">
    <div class="umo-bubble-menu-divider"></div>
    <menus-button
      ico="reply"
      :text="label"
      menu-type="button"
      force-enabled
      @menu-click="handleClick"
    />
  </template>
</template>

<script setup>
import { l } from '@/composables/i18n'

const editor = inject('editor')
const options = inject('options')
const createSelectionCommentDraft = inject('createSelectionCommentDraft')

const visible = computed(() => {
  const comments = options.value.comments
  if (!comments?.enabled || comments.selection?.enabled === false || !editor.value) {
    return false
  }
  if (options.value.viewer?.allowTextSelection === false) {
    return false
  }
  return !editor.value.state.selection.empty
})

const label = computed(() => l(options.value.comments?.selection?.label) || 'Comment')

const handleClick = () => {
  const draft = createSelectionCommentDraft?.()
  if (draft) {
    options.value.comments?.onSelectionComment?.(draft)
  }
}
</script>
