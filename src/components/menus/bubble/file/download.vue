<template>
  <menus-button
    v-if="editor?.getAttributes('file')?.uploaded"
    ico="download"
    :text="t('bubbleMenu.file.download')"
    @menu-click="downloadFile"
  />
</template>

<script setup>
import { getSelectionNode } from '@/utils/selection'

const editor = inject('editor')
const fileResolver = inject('fileResolver')
const container = inject('container')

const downloadFile = async () => {
  const node = editor.value ? getSelectionNode(editor.value) : null
  if (!node) {
    return
  }
  try {
    const resolved = await fileResolver.resolve(
      { ...node.attrs, nodeType: 'file' },
      { force: true, reason: 'download' },
    )
    const a = document.createElement('a')
    a.href = resolved.url || node.attrs.url
    a.download = node.attrs.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (error) {
    useMessage('error', { attach: container, content: error.message })
  }
}
</script>
