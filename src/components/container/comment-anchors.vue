<template>
  <span
    v-for="(rect, index) in commentAnchorRects"
    :key="`${rect.anchorId}-${index}`"
    class="umo-comment-anchor-overlay"
    :style="{
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    }"
    role="button"
    tabindex="0"
    :data-umo-comment-anchor-id="rect.anchorId"
    @keydown.enter.stop.prevent="handleActivate(rect.anchorId)"
    @keydown.space.stop.prevent="handleActivate(rect.anchorId)"
  />
</template>

<script setup>
const options = inject('options')
const commentAnchorRects = inject('commentAnchorRects', ref([]))

const handleActivate = (anchorId) => {
  options.value.comments?.onAnchorClick?.(anchorId)
}
</script>
